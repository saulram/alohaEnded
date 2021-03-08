/**
 * Created by Mordekaiser on 01/11/16.
 */
"use strict";
const mongoose = require('mongoose'),
    Badge = mongoose.model('Badge'),
    getSlug = require('speakingurl'),
    moment = require('moment'),
    jwt = require('../../services/v1/jwtValidation'),
    User = mongoose.model('User'),
    Acknowledgment = mongoose.model('Acknowledgment'),
    _ = require('underscore'),
    json2csv = require('json2csv');

exports.post = function (req, res) {
    console.log('POST Badge');
    var data = {};
    if(req.body.category) {
        data.category = req.body.category;
        if(req.body.category === 'administrator')
            data.rolAuth = "superAdmin";
    }

    if (req.body.name) {
        data.name = req.body.name;
        data.slug = getSlug(req.body.name, {lang: 'es'});
    }
    if(req.body.points)
        data.points = req.body.points;
    if(req.body.expiresAt)
        data.expiresAt = req.body.expiresAt;
    if(req.body.rolAuth)
        data.rolAuth = req.body.rolAuth;

    if(req.file)
        data.image = getSlug(req.body.name, {lang: 'es'});

    var badge = new Badge(data);
    badge.save(function(err, doc) {
        if(err) {
            res.status(500).json({success:false});
            res.end();
        } else {
            res.status(201).json({success: true});
            res.end();
        }
    });
};

exports.get = function (req, res) {
    var query = {
        isActive: true
    };

    if(req.query.type === 'all'){
        if(req.query.category === 'especial')
            query.category = req.query.category;
        if(req.query.category === 'valores')
            query.category = {$nin: ['especial', 'administrator']};
        if(req.query.category === "administrator")
            query.category = req.query.category;

        getBadges(query);
    }
    // get the badges that will be displayed in the badge box, depending of th collaborator role
    if(req.query.type === 'byRol') {
        // get user rol
        var roles = jwt.getUserRol(req.headers['x-access-token']);
        query.rolAuth = {$in: roles};
        //query.expiresAt = {$gte: moment().format("MM-DD-YYYY")};

        getBadges(query);
    }
    if(req.query.type === 'byId') {
        if(req.query.id)
            query._id = req.query.id;
        getBadges(query);
    }

    function getBadges(query) {
        Badge.find(query, function (err, badges) {
            if(err)
                console.log(err);

            if(badges) {
                var objectBadges = [];

                badges.forEach(function(values) {
                    var badge = values.toObject();
                    delete badge.__v;
                    delete badge.createdAt;
                    delete badge.updatedAt;
                    delete badge.isActive;

                    badge.image = "/assets/images/badges/" + values.image;
                    if(req.query.category !== 'especial')
                        delete badge.rolAuth;
                    if(req.query.type === 'byId' && badge.expiresAt)
                        badge.expiresAt = moment(badge.expiresAt);
                    else if(badge.expiresAt)
                        badge.expiresAt = moment(badge.expiresAt).locale('es').format('LL');

                    if(req.query.type === 'byRol' && values.category === 'especial') {
                        if(moment(values.expiresAt).format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD')) {
                            objectBadges.push(badge);
                        }
                    } else
                        objectBadges.push(badge);
                });

                res.status(200).json(objectBadges);
                res.end();
            } else {
                res.status(500).json({success: false, error: err});
                res.end();
            }
        })
    }
};

exports.put = function (req, res) {
    console.log('PUT Badge');
    var query = {
        _id: req.query._id
    };

    var data = {};

    if(req.body.name) {
        data.name = req.body.name;
        data.slug = getSlug(req.body.name, {lang: 'es'});
    }
    if(req.body.category)
        data.category = req.body.category;
    if(req.body.points)
        data.points = req.body.points;
    if(req.body.expiresAt)
        data.expiresAt = req.body.expiresAt;

    if(req.file)
        data.image = getSlug(req.body.name, {lang: 'es'});

    Badge.update(query, {$set: data}, function (err, doc) {
        if(err)
            console.log(err);
        if(doc.ok === 1) {
            res.status(200).json({success: true});
            res.end();
        } else {
            res.status(500).json({success: false});
            res.end();
        }
    })
};

exports.del = function (req, res) {
    console.log('DELETE Badge');
    var query = {
        _id: req.query._id
    };

    var data = {
        isActive: false
    };

    Badge.update(query, {$set: data}, function (err, doc) {
        if(err) {
            console.log(err);
            res.status(200).json({success: false});
            res.end();
        }
        console.log(doc);
        if(doc.nModified != 0) {
            res.status(200).json({success: true});
            res.end();
        }
    })
};

exports.badgeGroup = (req, res) => {
    console.log('GET badge group');
    const fields = ['receiverName', 'receiverNumber', 'receiverLocation', 'receiverArea', 'receiverDepartment',
        'receiverPosition', 'values', 'competences', 'specials', 'senderName', 'senderNumber', 'senderLocation',
        'senderArea', 'senderDepartment', 'senderPosition'];

    let acknowledgmentPromise = (query, projection) => {
        return new Promise((resolve, reject) => {
            Acknowledgment
                .find(query, projection)
                .sort({createdAt: -1})
                .lean()
                .exec((err, acknowledgments) => {
                    if(err) {
                        console.log(err);
                    }

                    if(acknowledgments.length > 0) {
                        resolve(acknowledgments);
                    } else {
                        reject('No acknowledgments found');
                    }
                })
        })
    };

    /**
     * Groups the acknowledgments by user_id
     * @param acknowledgments
     * @return {Promise<any>}
     */
    let groupBadgesPromise = acknowledgments => {
        return new Promise((resolve, reject) => {
            if(typeof acknowledgments !== 'undefined') {
                const groupedList = _.groupBy(acknowledgments, 'receiver_id');
                const arrayList = Object.keys(groupedList).map(k => {return groupedList[k]});

                resolve(arrayList);
            } else {
                reject('No acknowledgments received');
            }
        });
    };

    let sumBadgePoints = acknowledgments => {
        return new Promise((resolve, reject) => {
            if(typeof acknowledgments !== 'undefined') {
                let acknowledgmentsPromise = [];
                acknowledgments.forEach(acknowledgmentByCollaborator => acknowledgmentsPromise.push(getTotals(acknowledgmentByCollaborator)));

                Promise.all(acknowledgmentsPromise).then(data => {
                    resolve(data);
                })
            } else {
                reject('No grouped acknowledgments received');
            }
        });
    };

    function getTotals(acknowledgmentByCollaborator) {
        return new Promise(resolve => {
            let customAcknowledgment = {
                competences: 0,
                values: 0,
                specials: 0,
                receiver_id: acknowledgmentByCollaborator[0].receiver_id,
                sender_id: acknowledgmentByCollaborator[0].sender_id
            };

            if(typeof acknowledgmentByCollaborator !== 'undefined') {
                const filterValuesBadges = acknowledgmentByCollaborator.filter(valuesBadges);
                const filterCompetencesBadges = acknowledgmentByCollaborator.filter(competencesBadges);
                const filterSpecialBadges = acknowledgmentByCollaborator.filter(specialBadges);

                if(filterValuesBadges.length > 0) {
                    customAcknowledgment.values = filterValuesBadges.reduce(sumPoints).badgePoints;
                }

                if(filterCompetencesBadges.length > 0) {
                    customAcknowledgment.competences = filterCompetencesBadges.reduce(sumPoints).badgePoints;
                }

                if(filterSpecialBadges.length > 0) {
                    customAcknowledgment.specials = filterSpecialBadges.reduce(sumPoints).badgePoints;
                }
            }

            resolve(customAcknowledgment);
        })
    }

    let userPromise = acknowledgments => {
        return new Promise((resolve, reject) => {
            if(typeof acknowledgments !== 'undefined') {
                let userPromises = [];

                acknowledgments.forEach(acknowledgment => userPromises.push(searchUserData(acknowledgment)));

                Promise.all(userPromises).then(data => resolve(data));
            } else {
                reject('Data not found');
            }
        })
    };

    function searchUserData(acknowledgment) {
        return new Promise((resolve, reject) => {
            const userQuery = {
                _id: acknowledgment.receiver_id
            };

            let customData = {
                values: acknowledgment.values,
                competences: acknowledgment.competences,
                specials: acknowledgment.specials,
                sender_id: acknowledgment.sender_id
            };

            User
                .findOne(userQuery, { completeName: 1, employeeNumber: 1, location: 1, department: 1, area: 1, position: 1 })
                .lean()
                .exec((err, user) => {
                    if(err) {
                        console.error(err);
                    }

                    if(user) {
                        customData.receiverName = user.completeName;
                        customData.receiverNumber = user.employeeNumber;
                        customData.receiverLocation = user.location;
                        customData.receiverDepartment = user.department;
                        customData.receiverArea = user.area;
                        customData.receiverPosition = user.position;

                        resolve(customData);
                    } else {
                        reject('No data found');
                    }
                });
        })
    }

    let senderPromise = customAcknowledgments => {
        return new Promise((resolve, reject) => {
            if(typeof customAcknowledgments !== 'undefined') {
                let userPromises = [];

                customAcknowledgments.forEach(acknowledgment => userPromises.push(searchSenderData(acknowledgment)));

                Promise.all(userPromises).then(data => resolve(data));
            } else {
                reject('Data not found');
            }
        })
    };

    function searchSenderData(acknowledgment) {
        return new Promise((resolve, reject) => {
            const senderQuery = {
                _id: acknowledgment.sender_id
            };

            let customData = {
                values: acknowledgment.values,
                competences: acknowledgment.competences,
                specials: acknowledgment.specials,
                sender_id: acknowledgment.sender_id,
                receiverName: acknowledgment.receiverName,
                receiverLocation: acknowledgment.receiverLocation,
                receiverNumber: acknowledgment.receiverNumber,
                receiverDepartment: acknowledgment.receiverDepartment,
                receiverArea: acknowledgment.receiverArea,
                receiverPosition: acknowledgment.receiverPosition
            };

            User
                .findOne(senderQuery, { completeName: 1, employeeNumber: 1, location: 1, department: 1, area: 1, position: 1 })
                .lean()
                .exec((err, user) => {
                    if(err) {
                        console.error(err);
                    }

                    if(user) {
                        customData.senderName = user.completeName;
                        customData.senderLocation = user.location;
                        customData.senderNumber = user.employeeNumber;
                        customData.senderDepartment = user.department;
                        customData.senderArea = user.area;
                        customData.senderPosition = user.position;

                        resolve(customData);
                    } else {
                        reject('No data found');
                    }
                });
        })
    }

    function sendResponse(acknowledgments) {
        let resData = {
            success: false,
            acknowledgments: []
        };

        if(typeof acknowledgments !== 'undefined') {
            if(req.query.type === 'csv') {
                try {
                    json2csv({ data: acknowledgments, fields: fields }, function(err, csv) {
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
                resData.acknowledgments = acknowledgments;
                resData.success = true;
                res.status(200).json(resData);
            }
        } else {
            resData.message = 'No se encontró información';
            res.status(404).json(resData);
        }
    }

    let query = {
        isActive: true
    };

    if(req.query.dateTo && req.query.dateFrom) {
        const dateFrom = new Date(req.query.dateFrom.split('T')[0]);
        const dateTo = new Date(req.query.dateTo.split('T')[0] + 'T23:59:59.999Z');
        query.createdAt = {$gte: dateFrom, $lt: dateTo};
    }

    const project = { badgeSlug: 1, receiver_id: 1, badgePoints: 1, sender_id: 1 };
    acknowledgmentPromise(query, project)
        .then(groupBadgesPromise)
        .then(sumBadgePoints)
        .then(userPromise)
        .then(senderPromise)
        .catch(err => console.error(err))
        .then(sendResponse);

    function valuesBadges(item) {
        if(item.badgeSlug === 'actitud-de-servicio' || item.badgeSlug === 'responsabilidad-social'
            || item.badgeSlug === 'orgullo-presidente' || item.badgeSlug === 'respeto-y-diversidad'
            || item.badgeSlug === 'lealtad-y-justicia' || item.badgeSlug === 'honestidad-e-integridad') {
            return item;
        }
    }

    function competencesBadges(item) {
        if(item.badgeSlug === 'adaptibilidad-desarrollo-de-talento' || item.badgeSlug === 'compromiso-con-el-cliente'
            || item.badgeSlug === 'comunicacion-efectiva' || item.badgeSlug === 'relaciones-personales-creacion-de-equipos-e-cientes'
            || item.badgeSlug === 'innovacion-y-mejora' || item.badgeSlug === 'liderazgo-e-in-uencia-e-caz'
            || item.badgeSlug === 'orientacion-a-resultados' || item.badgeSlug === 'toma-de-decisiones-oportunas') {
            return item;
        }
    }

    function specialBadges(item) {
        if(item.badgeSlug !== 'adaptibilidad-desarrollo-de-talento' || item.badgeSlug !== 'compromiso-con-el-cliente'
            || item.badgeSlug !== 'comunicacion-efectiva' || item.badgeSlug !== 'relaciones-personales-creacion-de-equipos-e-cientes'
            || item.badgeSlug !== 'innovacion-y-mejora' || item.badgeSlug !== 'liderazgo-e-in-uencia-e-caz'
            || item.badgeSlug !== 'orientacion-a-resultados' || item.badgeSlug !== 'toma-de-decisiones-oportunas'
            || item.badgeSlug !== 'actitud-de-servicio' || item.badgeSlug !== 'responsabilidad-social'
            || item.badgeSlug !== 'orgullo-presidente' || item.badgeSlug !== 'respeto-y-diversidad'
            || item.badgeSlug !== 'lealtad-y-justicia' || item.badgeSlug !== 'honestidad-e-integridad') {
            return item;
        }
    }

    function sumPoints(a, b) {
        return { badgePoints: a.badgePoints + b.badgePoints };
    }
};