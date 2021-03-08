/**
 * Created by Mordekaiser on 24/10/16.
 */
"use strict";
const csv = require('fast-csv'),
    config = require('../../config/configuration'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    moment = require('moment'),
    AccountStatusCtrl = require('../../controllers/v1/AccountStatusCtrl'),
    feedCtrl = require('../../controllers/v1/FeedsCtrl'),
    path = require('path'),
    businessRules = require('../../services/v1/BusinessRules'),
    Feed = mongoose.model('Feed'),
    Account = mongoose.model('Account'),
    encrypt = require('../../services/v1/encrypto'),
    mailgunEmail = require('../../services/v1/MailgunEmail');

exports.post = function (req, res) {
    if(req.file && path.extname(req.file.originalname) == '.csv') {
        if(req.body.type == "performance") {
            console.log('POST Import performance');
            let dataArr = [];
            let totalRows = [];
            let errRows = [];
            let response = {};

            csv
                .fromPath(config.staging.rootPath + "server/imported-files/" + req.file.filename, {headers: true, ignoreEmpty: true})
                .validate(function(data, next){
                    console.log('Validating CSV...');
                    totalRows.push(data);
                    // update the collaborator points
                    const query = {
                        employeeNumber: data['numero de empleado']
                    };
                    let dataCsv = {};
                    let setData = {
                        "points.updatedAt": moment().format("MM-DD-YYYY")
                    };

                    const grade = Number(data['evaluacion']);
                    let perfPoints = 0;

                    if(grade >= 3) {
                        if(grade >= 3 && grade <= 3.99) {
                            dataCsv["points.current"] = 100;
                            perfPoints = 100;
                            setData.performance = 1;
                        }

                        if(grade >= 4 && grade <= 4.99) {
                            dataCsv["points.current"] = 250;
                            perfPoints = 250;
                            setData.performance = 2;
                        }
                        if(grade >= 5) {
                            dataCsv["points.current"] = 500;
                            perfPoints = 500;
                            setData.performance = 3;
                        }

                        User.findOneAndUpdate(query, {$inc: dataCsv, $set: setData}, {new: true}, function (err, user) {
                            if (err)
                                console.log(err);
                            if(user) {
                                response.currentPoints = Number(user.points.current);
                                // create a record to track account balance
                                AccountStatusCtrl.importPost('', '', Number(perfPoints), 'Evaluación de desempeño', user._id);
                                // create a feed record
                                feedCtrl.createFeed('', '', user._id, user.completeName, '', '', 'performance', user.performance, '', 'performance');

                                if(!!user.email) {
                                    if(user.notifications.performance) {
                                        const emailData = {
                                            email: user.email,
                                            receiverName: user.completeName,
                                            category: 'performance'
                                        };
                                        sendEmailNotification(emailData);
                                    }
                                }

                                next(null, true);
                            } else
                                next(null, false);
                        });
                    } else
                        next(null, false);

                })
                .on("data-invalid", function(data){
                    errRows.push(data);
                })
                .on("data", function (data) {
                    dataArr.push(data);
                })
                .on("end", function () {
                    console.log("CSV done");
                    response.filename = req.file.filename;
                    response.columns = dataArr.length;
                    response.totalColumns = totalRows.length;
                    response.errorRows = errRows;
                    response.success = Number(dataArr.length) > 0;
                    if(Number(dataArr.length) > 0)
                        res.status(200).json(response);
                    else
                        res.status(500).json(response);
                    res.end();
                });
        }
        if(req.body.type == "upgrade") {
            let upgradeArr = [];
            let upTotalRows = [];
            let upErrRows = [];
            let responseUpgrade = {};

            csv
                .fromPath(config.staging.rootPath + "server/imported-files/" + req.file.filename, {headers: true, ignoreEmpty: true})
                .validate(function(data, next){
                    upTotalRows.push(data);
                    const query = {
                        employeeNumber: data['employee']
                    };
                    let dataCsv = {};
                    const setData = {
                        "points.updatedAt": moment().format("MM-DD-YYYY"),
                        "upgrade.badge": data['badge'],
                        "upgrade.result": Number(data['points']),
                        "upgrade.updatedAt": moment().format("MM-DD-YYYY")
                    };

                    // points obtained in file
                    const upgradePoints = Number(data['points']);
                    dataCsv["points.current"] = Number(data['points']);

                    // increments the user current points
                    User.findOneAndUpdate(query, {$inc: dataCsv, $set: setData}, {new: true}, function (err, user) {
                        if (err)
                            console.log(err);
                        if(user) {
                            responseUpgrade.currentPoints = Number(user.points.current);
                            // create a record to track account balance
                            AccountStatusCtrl.importPost('', '', upgradePoints, 'Upgrade', user._id);
                            // create a feed record
                            feedCtrl.createFeed('', '', user._id, user.completeName, '', '', 'upgrade', user.upgrade.result, user.upgrade.badge, 'upgrade');
                            // send email notification if collaborator has enabled it in their preferences
                            if(!!user.email) {
                                if(!!user.notifications.upgrade) {
                                    let emailData = {
                                        email: user.email,
                                        badgeName: 'Upgrade ' + data['badge'],
                                        category: 'upgrade'
                                    };

                                    sendEmailNotification(emailData);
                                }
                            }
                            next(null, true);
                        } else
                            next(null, false);
                    });
                })
                .on("data-invalid", function(data){
                    upErrRows.push(data);
                })
                .on("data", function (data) {
                    upgradeArr.push(data);
                })
                .on("end", function () {
                    console.log("CSV done");
                    responseUpgrade.filename = req.file.filename;
                    responseUpgrade.columns = upgradeArr.length;
                    responseUpgrade.totalColumns = upTotalRows.length;
                    responseUpgrade.errorRows = upErrRows;
                    responseUpgrade.success = Number(upgradeArr.length) > 0;
                    if(Number(upgradeArr.length) > 0)
                        res.status(200).json(responseUpgrade);
                    else
                        res.status(500).json(responseUpgrade);
                    res.end();
                });
        }
    }
    else if(req.body.type == "points") {
        console.log('POST Import points');
        var roles = ["admin", "lider", "colaborador"];
        var data = {};
        var query = {};
        if(req.body.points)
            data["points.temporal"] = Number(req.body.points);
        if(req.body.expiresAt)
            data["points.expiresAt"] = req.body.expiresAt;
        // only when user is collaborator exclude other roles
        if(req.query.role == "colaborador") {
            var index = roles.indexOf(req.query.role);
            if(index > - 1) {
                roles.splice(index, 1);
            }
            query.roles = {$in: [req.query.role], $nin: roles};
        }
        if(req.query.role == "admin")
            query.roles = {$in: [req.query.role]};
        if(req.query.role == "lider")
            query.roles = {$in: [req.query.role]};

        User.update(query, {$set: data}, {multi: true}, function (err, doc) {
            if(err)
                console.log(err);
            if(doc) {
                res.status(200).json({success: true});
                res.end();
            }
        })
    } else {
        res.status(500).json({success: false});
        res.end();
    }

    function sendEmailNotification(emailData) {
        let html = "";
        if(emailData.category === 'upgrade')
            html = "<p>Acabas de recibir una insignia de " + emailData.badgeName + ", puedes ver el total de puntos en tu estado de cuenta de <a href='https://valora-gp.com/' style='text-decoration: none'>Valora</a>.</p>";
        else
            html = "<p>" + emailData.receiverName + " has recibido una nueva insignia por los buenos resultados en tu evaluación de desempeño. Entra a <a href='https://valora-gp.com/' style='text-decoration: none'>Valora</a> y checa cuántos puntos has obtenido.</p>"
        mailgunEmail.send(emailData.email, 'Tu actividad en Valora', html);
    }
};

/**
 * Add collaborators by .csv
 * @param req
 * @param res
 */
exports.addCollaborators = function (req, res) {
    if(req.file && path.extname(req.file.originalname) === '.csv') {
        let skippedData = [];
        let insertedData = [];
        csv
            .fromPath(config.staging.rootPath + "server/imported-files/" + req.file.filename, {headers: true, ignoreEmpty: true})
            .validate(function(row, next) {
                let query = {
                    employeeNumber: row['Numero de Empleado']
                };
                searchCollaborator(query, function (success) {
                    if(!success) {
                        // insert new collaborator
                        const points = businessRules.seniorityValidation(Number(row['Antiguedad']));
                        let salt, hash;
                        salt = encrypt.createSalt();
                        hash = encrypt.hashPwd(salt, 'demo');
                        let collaboratorData = {
                            completeName: row['Nombre Completo'],
                            employeeNumber: row['Numero de Empleado'],
                            seniority: Number(row['Antiguedad']),
                            location: row['Hotel'],
                            position: row['Nombre del Puesto'],
                            area: row['Direccion'],
                            department: row['Departamento'],
                            salt: salt,
                            hashed_pwd: hash,
                            points: {
                                current: points,
                                temporal: 600
                            },
                            groups: ['todos']
                        };

                        if(row['Personas a cargo'] === 'SI')
                            collaboratorData.roles = ['colaborador', 'lider'];
                        else
                            collaboratorData.roles = ['colaborador'];

                        insertCollaborator(collaboratorData, function (userCreated) {
                            if(userCreated)
                                next(null, true);
                            else
                                next(null, false);
                        });
                    } else {
                        // update collaborators
                        let collaboratorData = {
                            employeeNumber: row['Numero de Empleado'],
                            seniority: Number(row['Antiguedad']),
                            location: row['Hotel'],
                            position: row['Nombre del Puesto'],
                            area: row['Direccion'],
                            department: row['Departamento'],
                        };
                        if(row['Personas a cargo']) {
                            if(row['Personas a cargo'] === 'SI')
                                collaboratorData.roles = ['colaborador', 'lider'];
                            else
                                collaboratorData.roles = ['colaborador'];
                        }
                        updateCollaborator(collaboratorData, function (success) {
                            if(success)
                                next(null, true);
                            else
                                next(null, false);
                        });
                    }
                });
            })
            .on("data-invalid", function(data){
                skippedData.push(Number(data['Numero de Empleado']));
            })
            .on("data", function (data) {
                insertedData.push(data);
            })
            .on("end", function () {
                console.log('Importing file done');
                const documents = {
                    inserted: insertedData.length,
                    skipped: skippedData,
                    filename: req.file.filename,
                    success: true
                };

                res.status(200).json(documents);
                res.end();
            });
    }

    function searchCollaborator(query, callback) {
        User.findOne(query, function (err, user) {
            if(err)
                console.log('Insert Collaborators error. ' + err);
            if(!user)
                return callback(false);
            else
                return callback(true);
        });
    }

    function insertCollaborator(data, callback) {
        let user = new User(data);
        user.save(function (err, newCollaborator) {
            if(err) {
                console.log(err);
                return callback(false);
            }
            if(newCollaborator) {
                const points = businessRules.seniorityValidation(Number(data.seniority));
                let feedData = {
                    receiver_id: newCollaborator._id,
                    receiverName: newCollaborator.completeName,
                    earnedReason: 'seniority',
                    earnedPoints: points,
                    type: 'seniority'
                };

                createFeed(feedData);
                let info = {
                    user_id: newCollaborator._id,
                    earnedPoints: points,
                    earnedReason: 'Antigüedad',
                    earnedType: 'seniority'
                };
                createAccountBalance(info);

                return callback(true);
            }

        });
    }

    function updateCollaborator(employee, callback) {
        User.findOne({employeeNumber: employee.employeeNumber}, function (err, collaborator) {
            if(err)
                console.log(err);
            if(collaborator) {
                let data = {};
                let points = 0;
                let earnedYear = false;

                if(employee.seniority > collaborator.seniority) {
                    points = businessRules.seniorityValidation(employee.seniority);
                    data.seniority = employee.seniority;
                    earnedYear = true;
                }

                if(employee.location !== collaborator.location)
                    data.location = employee.location;
                if(employee.position !== collaborator.position)
                    data.position = employee.position;
                if(employee.department !== collaborator.department)
                    data.department = employee.department;
                if(employee.area !== collaborator.area)
                    data.area = employee.area;

                if(!isEmpty(data)) {
                    data.updatedAt = moment().format('YYYY-MM-DD');
                    User.update({employeeNumber: collaborator.employeeNumber},{$set: data, $inc: {'points.current': points}}, function (err, result) {
                        if(err)
                            console.log('Error at updating collaborator. ' + err);

                        if(earnedYear) {
                            let earnedYearData = {
                                receiver_id: collaborator._id,
                                receiverName: collaborator.completeName,
                                earnedReason: 'seniority',
                                earnedPoints: points,
                                type: 'seniority'
                            };
                            createFeed(earnedYearData);
                            let info = {
                                user_id: collaborator._id,
                                earnedPoints: points,
                                earnedReason: 'Antigüedad',
                                earnedType: 'seniority'
                            };
                            createAccountBalance(info);
                        }
                        callback(true);
                    })
                } else
                    callback(false);
            } else
                callback(false);
        })
    }

    function isEmpty(obj) {
        for(let prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    function createFeed(data) {
        const feed = new Feed(data);
        feed.save(function(err, doc) {
            if(err)
                console.log('Error at creating feed for seed. Error: ' + err);
        });
    }

    function createAccountBalance(data) {
        const account = new Account(data);
        account.save(function(err, doc) {
            if(err)
                console.log('Error at creating account balance for seed. Error: ' + err);
        });
    }
};

exports.removeCollaborators = function (req, res) {
    if(req.file && path.extname(req.file.originalname) === '.csv') {
        let skippedData = [];
        let insertedData = [];
        csv
            .fromPath(config.staging.rootPath + "server/imported-files/" + req.file.filename, {headers: true, ignoreEmpty: true})
            .validate(function(row, next) {
                let query = {
                    employeeNumber: row['ID']
                };
                User.findOneAndUpdate(query, {$set: {isActive: false}}, {new: true}, function (err, user) {
                    if(err)
                        console.log('Error at deleting collaborator. ' + err);
                    if(user)
                        next(null, true);
                    else
                        next(null, false);
                })
            })
            .on("data-invalid", function(data) {
                skippedData.push(Number(data['ID']));
            })
            .on("data", function (data) {
                insertedData.push(data);
            })
            .on("end", function () {
                console.log('Importing file done');
                const documents = {
                    inserted: insertedData.length,
                    skipped: skippedData,
                    filename: req.file.filename,
                    success: true
                };

                res.status(200).json(documents);
                res.end();
            });
    }
};