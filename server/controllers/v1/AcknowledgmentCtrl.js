/**
 * Created by Mordekaiser on 09/11/16.
 */
"use strict";
const mongoose = require('mongoose'),
    Acknowledgment = mongoose.model('Acknowledgment'),
    jwtValidation = require('../../services/v1/jwtValidation'),
    userCtrl = require('../../controllers/v1/UsersCtrl'),
    accountCtrl = require('../../controllers/v1/AccountStatusCtrl'),
    Badge = mongoose.model('Badge'),
    feedCtrl = require('../../controllers/v1/FeedsCtrl'),
    User = mongoose.model('User'),
    json2csv = require('json2csv'),
    moment = require('moment'),
    mailgunEmail = require('../../services/v1/MailgunEmail'),
    helpers = require('../../services/v1/Helpers'),
    _ = require('underscore'),
    AcknowledgmentReport = mongoose.model('AcknowledgmentReport');

// when collaborator is acknowledging other collaborator or GP
exports.post = function (req, res) {
    let data = {};
    let senderUser_id = "";
    let senderMessage = "", senderUser = '';

    if(req.body.badgeSlug)
        data.badgeSlug = req.body.badgeSlug;
    if(req.body.badgeId) {
        data.badgeId = req.body.badgeId;
    }
    if(req.body.receiver_id)
        data.receiver_id = req.body.receiver_id;
    if(req.body.badgePoints)
        data.badgePoints = req.body.badgePoints;
    if(req.body.senderMessage) {
        senderMessage = req.body.senderMessage;
    }

    // when the admin (grupo presidente) acknowledgments someone
    if(req.body.sender_id === "administrator") {
        data.sender_id = "administrator";
        GPAcknowledgment(req.body.receiver_id, req.body.badgePoints, data);
    }

    // when a collaborator acknowledge some else
    if(typeof req.body.sender_id === 'undefined') {
        senderUser_id = jwtValidation.getUserId(req.headers['x-access-token']);
        senderUser = helpers.getUserById(senderUser_id);
        data.sender_id = senderUser_id;
        // validate that user don't assign the badge to it's self
        if(senderUser_id !== req.body.receiver_id) {
            // validate if the name is correct
            isACorrectName(req.body.completeName, function (isCorrect) {
                if(isCorrect) {
                    validateBadgeAcknowledgments(req.body.badgeSlug, senderUser_id, req.body.receiver_id, function (isValid) {
                        if(isValid) {
                            // validate if user has the necessary amount of temporal points
                            // decrements the sender collaborator temporal points
                            userCtrl.restTemporalPoints(senderUser_id, req.body.badgePoints, function (senderUser) {
                                if(senderUser) {
                                    // increment receiver collaborator current points, sames as badge value
                                    incrementUserPoints(req.body.receiver_id, req.body.badgePoints);
                                    // create a document in account
                                    let acknowledgment = new Acknowledgment(data);
                                    acknowledgment.save(function (err, result) {
                                        if(err) {
                                            console.error(err);
                                        }
                                        else {
                                            // verify if the collaborator has become a ambassador
                                            let query = [
                                                { $match: { badgeSlug: req.body.badgeSlug }},
                                                { $group: { _id: { receiver_id: "$receiver_id", badgeSlug: "$badgeSlug" }, count: { $sum: 1 }}}
                                            ];

                                            isBecomingAmbassador(query, req.body.badgeCategory, req.body.receiver_id, senderUser_id, req.body.badgeId);
                                            GenerateAccountRecord(req.body.receiver_id, req.body.badgePoints, 'Recibiste una insignia de ' + req.body.badgeSlug);

                                            // send email notification if collaborator has enabled it in their preferences
                                            helpers.validateNotifications(req.body.receiver_id, function (data) {
                                                if(data) {
                                                    if(!!data.notifications.badge) {
                                                        helpers.getBadgeName(req.body.badgeSlug, function (badge) {
                                                            if(badge) {
                                                                let emailData = {
                                                                    badgeName: badge.name,
                                                                    senderName: senderUser.completeName,
                                                                    email: data.email,
                                                                    category: 'badge'
                                                                };

                                                                sendEmailNotification(emailData);
                                                            }
                                                        });
                                                    }
                                                }
                                            });

                                            res.status(200).json({success: true});
                                            res.end();
                                        }
                                    });
                                    // create record for the acknowledgment report model
                                    const acknowledgmentReportData = {
                                        badgeName: req.body.badgeName,
                                        badgePoints: req.body.badgePoints,
                                        badgeCategory: req.body.badgeCategory,
                                        sender_id: senderUser_id,
                                        senderEmployeeNumber: senderUser.employeeNumber,
                                        senderName: senderUser.completeName,
                                        senderLocation: senderUser.location,
                                        senderPosition: senderUser.position,
                                        senderDepartment: senderUser.department,
                                        senderArea: senderUser.area,
                                        receiver_id: req.body.receiver_id,
                                        receiverEmployeeNumber: req.body.receiverEmployeeNumber,
                                        receiverName: req.body.receiverName,
                                        receiverLocation: req.body.receiverLocation,
                                        receiverPosition: req.body.receiverPosition,
                                        receiverDepartment: req.body.receiverDepartment,
                                        receiverArea: req.body.receiverArea
                                    };

                                    let acknowledgmentReport = new AcknowledgmentReport(acknowledgmentReportData);
                                    acknowledgmentReport.save((err, result) => {
                                        if(err) {
                                            console.error(err);
                                        }
                                    })

                                } else {
                                    res.status(400).json({success: false, error: 'Puntos insuficientes'});
                                    res.end();
                                }
                            });
                        } else {
                            res.status(400).json({success: false, error: 'No se puede otorgar una segunda insignia a la misma persona en el mismo mes.'});
                            res.end();
                        }
                    });
                }
                else {
                    res.status(400).json({success: false, error: 'El nombre que tecleaste no existe, te recomendamos selecionarlo de la lista que aparece al escribir un nombre o apellido'});
                    res.end();
                }
            })
        } else {
            res.status(400).json({success: false, error: 'Uno mismo no puede otorgarse insignias.'});
            res.end();
        }
    }

    function sendEmailNotification(emailData) {
        let html = "";
        if(emailData === 'ambassador')
            html = "<p>¡Tenemos embajador nuevo! ¡Muchas felicidades! Te has convertido en el embajador de " + emailData.badgeName + " gracias a la insignia que has recibido por parte de " + emailData.senderName + ". Entra a <a href='https://valora-gp.com/' style='text-decoration: none'>Valora</a>, en la sección “Insignias Valora” y revisa el Top Nacional de Embajadores y ¡vé que bien te ves ahí! </p>"
        else
            html = "<p>Has obtenido una insignia de " + emailData.badgeName + " de parte de " + emailData.senderName + ". Accede a Valora y revisa tu estado de cuenta para consultar los puntos que has obtenido <a href='https://valora-gp.com/' style='text-decoration: none'>aquí</a>.</p>";
        mailgunEmail.send(emailData.email, 'Tu actividad en Valora', html);
    }

    // validates that a badge only has one acknowledgment by the receiver in a month
    function validateBadgeAcknowledgments(badgeSlug, sender_id, receiver_id, callback) {
        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 0);

        var query = {
            sender_id: sender_id,
            receiver_id: receiver_id,
            createdAt: {$gte: moment(firstDay).format('YYYY-MM-DD'), $lt: moment(lastDay).format('YYYY-MM-DD')}
        };

        Acknowledgment.findOne(query, function (err, acknowledgment) {
            if(err)
                console.log(err);
            if(acknowledgment)
                callback(false);
            else
                callback(true);
        })
    }

    function isACorrectName(completeName, callback) {
        User.findOne({completeName: completeName}, function (err, user) {
            if(err)
                console.log(err);
            if(user)
                return callback(true);
            else
                return callback(false);
        })
    }

    function incrementUserPoints(user_id, points) {
        userCtrl.incCurrentPoints(user_id, points, function (docs) {});
    }

    function isBecomingAmbassador(query, badgeCategory, receiver_id, senderUser_id, badgeId) {
        let ambassador = {};
        Acknowledgment
            .aggregate(query)
            .exec(function (aggregationErr, aggregationDocs) {
                if(aggregationErr)
                    console.log('error');
                if(aggregationDocs.length > 0) {
                    const collaboratorsQuery = {
                        _id: {$in: [receiver_id, senderUser_id]}
                    };

                    User.find(collaboratorsQuery, function (collaboratorsErr, collaborators) {
                        if(collaboratorsErr)
                            console.log(collaboratorsErr);
                        if(collaborators) {
                            let receiverUser = {};
                            let senderUser = {};

                            if(collaborators[0]._id.toString() === receiver_id.toString()) {
                                receiverUser = collaborators[0];
                            }
                            if(collaborators[1]._id.toString() === receiver_id.toString()) {
                                receiverUser = collaborators[1];
                            }

                            if(collaborators[0]._id.toString() === senderUser_id.toString()) {
                                senderUser = collaborators[0];
                            }
                            else if(collaborators[1]._id.toString() === senderUser_id.toString()) {
                                senderUser = collaborators[1];
                            }

                            aggregationDocs.sort(function (a, b) {
                                if (a.count < b.count) {
                                    ambassador.receiver_id = b._id.receiver_id;
                                    ambassador.count = b.count;
                                    return 1;
                                }
                                if (a.count > b.count) {
                                    ambassador.receiver_id = a._id.receiver_id;
                                    ambassador.count = a.count;
                                    return -1;
                                }
                                // a must be equal to b
                                return 0;
                            });

                            // conditional when there are none ambassadors
                            if(aggregationDocs[1]) {
                                // a document feed is always created
                                //feedCtrl.createFeed(senderUser_id, senderUser.completeName, receiver_id, receiverUser.completeName, badgeSlug, '', '', '', '', 'badge');
                                feedCtrl.createBadgeAcknowledgment(badgeId, '', receiver_id, receiverUser.completeName, senderUser_id, senderUser.completeName, senderMessage, 'badge', receiverUser.location, senderUser.location);
                                if(aggregationDocs[0].count > aggregationDocs[1].count && receiver_id === aggregationDocs[0]._id.receiver_id) {
                                    // create ambassador feed record, exclude special badges for generating ambassadors
                                    if(badgeCategory !== "especial") {
                                        // feedCtrl.createFeed('', '', receiver_id, receiverUser.completeName, badgeSlug, '', '', '', 'ambassador', 'ambassador');
                                        feedCtrl.createBadgeAcknowledgment(badgeId, 'ambassador', receiver_id, receiverUser.completeName, '', '', '', 'ambassador', receiverUser.location, senderUser.location);
                                        // send email notification if collaborator has enabled it in their preferences
                                        helpers.validateNotifications(receiver_id, function (data) {
                                            if(data) {
                                                if(!!data.notifications.badge) {
                                                    helpers.getBadgeName(badgeSlug, function (badge) {
                                                        if(badge) {
                                                            let emailData = {
                                                                badgeName: badge.name,
                                                                senderName: senderUser.completeName,
                                                                email: data.email,
                                                                category: 'ambassador'
                                                            };

                                                            sendEmailNotification(emailData);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }

                                }
                            } else {
                                console.log('Creando feed');
                                //feedCtrl.createFeed(senderUser_id, senderUser.completeName, receiver_id, receiverUser.completeName, badgeId, '', '', '', '', 'badge');
                                feedCtrl.createBadgeAcknowledgment(badgeId, '', receiver_id, receiverUser.completeName, senderUser_id, senderUser.completeName, senderMessage, 'badge', receiverUser.location, senderUser.location);
                            }
                        }
                    });
                }
            })
    }

    function GenerateAccountRecord(user_id, earnedPoints, earnedReason) {
        accountCtrl.postBadge(user_id, earnedPoints, earnedReason, function (result) {});
    }

    function GPAcknowledgment(receiver_id, points, data) {
        //console.log('POST GP Acknowledgment');
        // increment receiver collaborator current points, sames as badge value
        
        userCtrl.incCurrentPoints(receiver_id, points, function (receiverUser) {
            if(receiverUser) {
                // create a document in account
                const acknowledgment = new Acknowledgment(data);
                acknowledgment.save(function(err, doc) {
                    console.log('Creando feed... pt1');


                    if(err) {
                        console.log(err);
                    } else {
                        // add document to feed model
                        console.log('Creando feed...pt2');
                        feedCtrl.createFeed( data.sender_id,data.senderName, receiver_id, receiverUser.completeName, doc.badgeSlug, '', '', '', '', 'GP badge', receiverUser.location);
                        // add a document to account model
                        accountCtrl.postBadge(receiver_id, points, 'Recibiste una insignia del administrator', function (success) {
                            if(success) {
                                helpers.getBadgeName(data.badgeSlug, function (badge) {
                                    if(badge) {
                                        let emailData = {
                                            receiver_id: receiver_id,
                                            badgeName: badge.name,
                                            badgeSlug: data.badgeSlug,
                                            senderName: 'administrator'
                                        };
                                        //COMENTADO POR SERVICIO SUSPENDIDO, DESCOMENTAR CUANDO FUNCIONE MAILGUN
                                        //sendEmailNotification(emailData);
                                    }
                                });
                                res.status(201).json({success: true});
                                res.end();
                            } else {
                                res.status(500).json({success:false});
                                res.end();
                            }
                        })
                    }
                });
            }
        })
    }
};

// get the sum of the badges obtained
exports.get = function (req, res) {
    // console.log('GET acknowledgments');
    const user_id = jwtValidation.getUserId(req.headers['x-access-token']);

    let aggregatePromise = query => {
        return new Promise((resolve, reject) => {
            Acknowledgment
                .aggregate(query)
                .sort({count: -1})
                .exec(function (err, aggregationDocs) {
                    if(err) {
                        console.error(err);
                    }
                    if(aggregationDocs.length > 0) {
                        let customDocs = _.sortBy(aggregationDocs, 'count').reverse();
                        resolve(customDocs);
                    } else {
                        reject('No acknowledgments found');
                    }
                });
        })
    };

    let badgePromise = customAcknowledgments => {
        return new Promise((resolve, reject) => {
            let acknowledgments = [];

            customAcknowledgments.forEach(acknowledgment => acknowledgments.push(getBadgeData(acknowledgment)));

            Promise.all(acknowledgments).then(data => resolve(data));
        })
    };

    function getBadgeData(acknowledgment) {
        return new Promise(resolve => {
            const badgeQuery = {
                slug: acknowledgment._id
            };

            Badge
                .findOne(badgeQuery)
                .lean()
                .exec((err, badge) => {
                    let customData = {
                        receiver_id: user_id,
                        count: acknowledgment.count
                    };

                    if(err) {
                        console.error(err);
                    }
                    if(badge) {
                        customData.badgeName = badge.name;
                        customData.image = "/assets/images/badges/" + badge.image;
                        customData.category = badge.category;
                        customData.badgeSlug = badge.slug;
                    }
                    resolve(customData)
                })
        })
    }

    function sendResponse(badges) {
        let resData = {
            success: true,
            badges: []
        };

        if(typeof badges !== 'undefined') {
            resData.badges = badges;
            res.status(200).json(resData);
        } else {
            res.success = false;
            res.message = 'No se encontró información';
            res.status(404).json(resData);
        }
    }

    const query = [
        { $match: { receiver_id: mongoose.Types.ObjectId(user_id) }},
        { $group: { _id: "$badgeSlug", count: { $sum: 1} }}
    ];

    aggregatePromise(query)
        .then(badgePromise)
        .catch(err => console.error(err))
        .then(sendResponse);
};

exports.getNationalAmbassadors = function (req, res) {
    //console.log('GET All Embassadors');
    // just values and competence badges have ambassadors
    var badgeQuery = {
        isActive: true,
        category: {$in: ["valor", "competencias"]}
    };
    var ambassadors = [];
    Badge.find(badgeQuery, function (err, badges) {
        if(err)
            console.log(err);
        if(badges) {
            var badgesProcessed = 0;
            badges.forEach(function (badge) {

                var query = [
                    {$match: {badgeSlug: badge.slug}},
                    {$group: {_id: {receiver_id: "$receiver_id", badgeSlug: "$badgeSlug"}, count: {$sum: 1}}}
                ];
                Acknowledgment
                    .aggregate(query)
                    .exec(function (err, aggregationDocs) {
                        if(err){
                            console.log(err);
                        }
                        if(aggregationDocs.length > 0) {
                            var ambassador = {
                                badgeName: badge.name,
                                image: "/assets/images/badges/" + badge.image
                            };
                            // validate when there are few acknowledgments
                            if(aggregationDocs.length > 1) {

                                aggregationDocs.sort(function (a, b) {
                                    if (a.count < b.count)
                                        return 1;
                                    if (a.count > b.count)
                                        return -1;
                                    // a must be equal to b
                                    return 0;
                                });

                                // getting the greatest count by badgeSlug
                                if(aggregationDocs[0].count) {
                                    ambassador.receiver_id = aggregationDocs[0]._id.receiver_id;
                                    ambassador.count = aggregationDocs[0].count;

                                    ambassadors.push(ambassador);
                                }
                            } else {
                                // if there is only one collaborator with the higher count it becomes the ambassador
                                ambassador.receiver_id = aggregationDocs[0]._id.receiver_id;
                                ambassador.count = aggregationDocs[0].count;
                                ambassadors.push(ambassador);
                            }
                        }

                        badgesProcessed++;
                        if(badgesProcessed === badges.length) {
                            // get the additional user information
                            var ambassadorsProcessed = 0;
                            if(ambassadors.length > 0) {
                                ambassadors.forEach(function (item) {
                                    item.completeName = 'jose';
                                    User.findOne({_id: item.receiver_id}, function (usrErr, user) {
                                        if(user) {
                                            item.completeName = user.completeName;
                                            item.location = user.location;
                                            item.employeeNumber = user.employeeNumber;
                                            if(user.profileImage)
                                                item.profileImage = "/assets/images/users/" + user.profileImage;
                                        }
                                        ambassadorsProcessed++;
                                        if(ambassadorsProcessed == ambassadors.length) {
                                            resAmbassadors(ambassadors);
                                        }
                                    });

                                });
                            } else {
                                resAmbassadors([]);
                            }
                        }
                    })
            })
        }
    });

    function resAmbassadors(array) {
        if(array.length > 0) {
            res.status(200).json(array);
            res.end();
        } else {
            res.status(404).json({success: false});
            res.end();
        }
    }
};

exports.badgesReport = function (req, res) {
    // console.log("\x1b[32m", 'Badges report');

    const fields = ['nReceptor', 'receptor', 'localidad', 'nEmisor', 'emisor', 'insignia', 'puntos', 'fecha'];

    const query = {};

    let limit = 100;

    if(req.query.dateTo && req.query.dateFrom) {
        const dateFrom = new Date(req.query.dateFrom+'T00:00:00Z');
        const dateTo = new Date(req.query.dateTo+'T23:59:59.999Z');
        query.createdAt = {$gte: dateFrom, $lte: dateTo};
        limit = '';
    }

    // Create the response in requested format
    let ackPromise = function(item){
        return new Promise((resolve, reject) => {
              Promise.all([
                  User.findOne({_id: item.receiver_id}),
                  User.findOne({_id: item.sender_id})
              ]).then((values) => {
                  let receiver = values[0];
	                let sender = values[1];

                  let row = {
                      _id: item._id,
                      insignia: item.badgeSlug,
                      puntos: item.badgePoints,
                      fecha: moment.utc(item.createdAt).locale('es').format('LL')
                  };

                  if(receiver) {
                      row.receptor = receiver.completeName;
                      row.nReceptor = receiver.employeeNumber;
                      row.localidad = receiver.location;
                  }

                  if(sender) {
                      row.emisor = sender.completeName;
                      row.nEmisor = sender.employeeNumber;
                  } else {
                      row.emisor = 'administrator';
                  }

                  resolve(row);
              })
      	 	    .catch((err) => {
      		        reject(err);
  		        });
        });
    };


    Acknowledgment.find(query).sort({createdAt: -1}).limit(limit)
        .then( docs => {
            let promises = [];

            if(docs.length > 0) {
                docs.forEach(item => {
                    promises.push( ackPromise(item) );
                });
            }
            return Promise.all(promises);
        })
        .then( sendResponse )
        .catch((err) => {
          console.log('\x1b[31m', err);
        });

    function sendResponse(rows) {
        if(req.query.type === 'csv') {
            json2csv({ data: rows, fields: fields }, function(err, csv) {
                if (err) console.log(err);
                res.set('Content-Type', 'text/csv;charset=utf-8;');
                res.send(new Buffer(csv));
            });
        } else {
            res.status(200).json(rows);
            res.end();
        }
    }
};

exports.adminBadgesReport = function (req, res) {
    var docsProcessed = 0;
    var sendersProcessed = 0;
    var rows = [];
    var fields = ['nReceptor', 'receptor', 'localidad', 'nEmisor', 'emisor', 'insignia', 'puntos'];

    Acknowledgment.find({}, function (err, docs) {
        if(err)
            console.log(err);
        if(docs.length > 0) {
            docs.forEach(function (item) {
                var rowInfo = {};
                User.findOne({_id: item.sender_id}, function (err, user) {
                    if(err) {
                        //console.log(err);
                        rowInfo.emisor = 'administrator';
                    }
                    if(user) {
                        rowInfo.emisor = user.completeName;
                        rowInfo.nEmisor = user.employeeNumber;
                    }

                    sendersProcessed++;
                    if(sendersProcessed === docs.length && docsProcessed === docs.length) {
                        sendCsv();
                    }
                });

                User.findOne({_id: item.receiver_id}, function (err, receptorUsr) {
                    if(err)
                        console.log(err);
                    if(receptorUsr) {
                        rowInfo.receptor = receptorUsr.completeName;
                        rowInfo.nReceptor = receptorUsr.employeeNumber;
                        rowInfo.localidad = receptorUsr.location;
                        rowInfo.insignia = item.badgeSlug;
                        rowInfo.puntos = item.badgePoints;
                    }

                    docsProcessed++;
                    if(docsProcessed === docs.length && sendersProcessed === docs.length) {
                        sendCsv();
                    }
                });

                rows.push(rowInfo);
            })
        }
    });

    function sendCsv() {
        var admin_id = jwtValidation.getUserId(req.headers['x-access-token']);
        var rowsProcessed = 0;

        User.findOne({_id: admin_id}, function (adminErr, userAdmin) {
            if(adminErr)
                console.log(adminErr);
            if(userAdmin) {
                var csvField = [];
                rows.forEach(function (row) {
                    if(row.localidad == userAdmin.location) {
                        csvField.push(row);
                    }
                    rowsProcessed++;
                    if(rowsProcessed == rows.length) {
                        if(req.query.type == 'csv') {
                            json2csv({ data: csvField, fields: fields }, function(err, csv) {
                                if (err) console.log(err);
                                res.set('Content-Type', 'text/csv;charset=utf-8;');
                                res.send(new Buffer(csv));
                            });
                        } else {
                            res.status(200).json(rows);
                            res.end();
                        }
                    }
                });
            }
        });

    }
};

exports.badgesAcknowledgment = (req, res) => {
    // console.log('GET badge acknowledgments --------------------');
    const fields = ['receiverName', 'receiverEmployeeNumber', 'receiverLocation', 'receiverArea', 'receiverPosition',
        'badgeSlug', 'senderName', 'senderEmployeeNumber', 'senderLocation', 'senderArea', 'senderPosition',
        'badgePoints', 'createdAt'];
    let rows = [];
    if(req.query.dateTo && req.query.dateFrom) {
        let acknowledgmentPromise = query => {
            return new Promise((resolve, reject) => {
                Acknowledgment
                    .find(query)
                    .sort({createdAt: -1})
                    .exec((err, acknowledgments) => {
                        if(err) {
                            console.error(err);
                        }
                        if(acknowledgments.length > 0) {
                            resolve(acknowledgments);
                        } else {
                            reject('No data found');
                        }
                    });
            })
        };

        let userPromise = acknowledgments => {
            return new Promise((resolve, reject) => {
                let acknowledgmentPromises = [];

                acknowledgments.forEach(acknowledgment => acknowledgmentPromises.push(getUserNames(acknowledgment)));

                Promise.all(acknowledgmentPromises).then(data => {
                    resolve(data);
                    rows = data;
                });
            })
        };

        const dateFrom = new Date(req.query.dateFrom);
        const dateTo = new Date(req.query.dateTo.split('T')[0] + 'T23:59:59.999Z');
        let query = {
            isActive: true,
            createdAt: { $gte: dateFrom, $lt: dateTo }
        };

        // console.log(query);

        acknowledgmentPromise(query)
            .then(userPromise)
            .catch(err => console.error(err))
            .then(sendResponse);
    } else {
        res.message = 'Rango de fechas requerido';
        res.status(500).json(resData);
    }

    function sendResponse(acknowledgments) {
        let resData = {
            success: false,
            acknowledgments: []
        };

        if(typeof acknowledgments !== 'undefined') {
            if(req.query.type === 'csv') {
                try {
                    json2csv({ data: rows, fields: fields }, function(err, csv) {
                        if (err) {
                            console.error(err);
                        }
                        res.set('Content-Type', 'text/csv;charset=utf-8;');
                        res.send(new Buffer(csv));
                    });
                } catch (err) {
                    console.error(err);
                }
            } else {
                resData.success = true;
                resData.acknowledgments = acknowledgments;
                res.status(200).json(resData);
            }
        } else {
            resData.message = 'No se encontró información';
            res.status(404).json(resData);
        }
    }

    function getUserNames(acknowledgment) {
        return new Promise(resolve => {
            let customAcknowledgment = {
                createdAt: moment.utc(acknowledgment.createdAt).locale('es').format('LL'),
                badgePoints: acknowledgment.badgePoints,
                badgeSlug: acknowledgment.badgeSlug
            };

            let promiseArray = [User.findOne({_id: acknowledgment.receiver_id})];

            if(acknowledgment.sender_id !== 'administrator') {
                promiseArray.push(User.findOne({_id: acknowledgment.sender_id}))
            }

            Promise
                .all(promiseArray)
                .then(values => {
                    if(typeof values[0] !== 'undefined') {
                        customAcknowledgment.receiverName = values[0].completeName;
                        customAcknowledgment.receiverEmployeeNumber = values[0].employeeNumber;
                        customAcknowledgment.receiverLocation = values[0].location;
                        customAcknowledgment.receiverArea = values[0].area;
                        customAcknowledgment.receiverPosition = values[0].position;
                    }

                    if(typeof values[1] !== 'undefined') {
                        customAcknowledgment.senderName = values[1].completeName;
                        customAcknowledgment.senderEmployeeNumber = values[1].employeeNumber;
                        customAcknowledgment.senderLocation = values[1].location;
                        customAcknowledgment.senderArea = values[1].area;
                        customAcknowledgment.senderPosition = values[1].position;
                    } else {
                        customAcknowledgment.senderName = 'administrator';
                    }

                    resolve(customAcknowledgment);
                })
        })
    }

    /*function getBadgeName(acknowledgment) {
        return new Promise((resolve, reject) => {
            let customAcknowledgment = {
                createdAt: acknowledgment.createdAt,
                receiver_id: acknowledgment.receiver_id,
                sender_id: acknowledgment.sender_id,
                badgePoints: acknowledgment.badgePoints
            };

            const badgeQuery = {
                slug: acknowledgment.badgeSlug
            };

            Badge
                .findOne(badgeQuery)
                .exec((err, badge) => {
                    if(err) {
                        console.error(err);
                    }
                    if(badge) {
                        customAcknowledgment.badgeSlug = badge.name;
                        resolve(customAcknowledgment);
                    } else {
                        resolve(customAcknowledgment);
                    }
                })
        })
    }*/
};

exports.getSenders = (req, res) => {
    // console.log('Get senders');
    if(typeof req.query.badgeSlug !== 'undefined') {
        let acknowledgmentPromise = query => {
            return new Promise((resolve, reject) => {
                Acknowledgment
                    .find(query)
                    .lean()
                    .exec((err, acknowledgments) => {
                        if(err) {
                            console.error(err);
                        }
                        if(acknowledgments.length > 0) {
                            resolve(acknowledgments);
                        } else {
                            reject('No acknowledgments found');
                        }
                    })
            })
        };

        let userPromise = acknowledgments => {
            return new Promise((resolve) => {
                let usersPromise = [];

                acknowledgments.forEach(acknowledgment => usersPromise.push(getSender(acknowledgment)));

                Promise.all(usersPromise).then(data => resolve(data));
            })
        };

        const query = {
            badgeSlug: req.query.badgeSlug,
            receiver_id: jwtValidation.getUserId(req.headers['x-access-token'])
        };

        acknowledgmentPromise(query)
            .then(userPromise)
            .catch(err => console.error(err))
            .then(sendResponse);

    } else {
        res.status(404).json({success: false, message: 'No se proporcionó una insignia'});
    }

    function getSender(acknowledgment) {
        return new Promise(resolve => {
            const userQuery = {
                _id: acknowledgment.sender_id
            };

            User
                .findOne(userQuery)
                .lean()
                .exec((err, user) => {
                    if(err) {
                        console.error(err);
                    }
                    if(user) {
                        resolve(user.completeName);
                    }
                })
        })
    }

    function sendResponse(users) {
        let resData = {
            success: true,
            users: []
        };

        if(typeof users !== 'undefined') {
            resData.users = users;
            res.status(200).json(resData);
        } else {
            resData.message = 'No se encontraron los usuarios';
            resData.success = false;
            res.status(200).json(resData);
        }
    }
};