/**
 * Created by Mordekaiser on 11/10/16.
 */
"use strict";
const jwt = require('jsonwebtoken'),
    encrypt = require('../../services/v1/encrypto'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    config = require('../../config/configuration'),
    jwtValidation = require('../../services/v1/jwtValidation'),
    UserLog = mongoose.model('UserLog'),
    shortid = require('shortid'),
    moment = require('moment'),
    mailgun = require('mailgun-js')({apiKey: config.staging.api_key, domain: 'sandbox9b7c437a8cc54e199de2e912d73ff446.mailgun.org'}),
    mailcomposer = require('mailcomposer'),
    Q = require('q'),
    helpers = require('../../services/v1/Helpers'),
    _ = require('underscore'),
    json2csv = require('json2csv');

exports.login = function (req, res) {
    const query = {
        employeeNumber: req.query.employeeNumber,
        hashed_pwd: req.query.password
    };

    let loginQuery = {
        employeeNumber: req.query.employeeNumber,
        isActive: true
    };

    // validation for the collaborators that have less than a year, but have access to Upgrade
    if(req.query.webApp && req.query.webApp === 'valora') {
        loginQuery.seniority = {$gte: 1}
    }

    // console.log(loginQuery);

    User.findOne(loginQuery, function (err, user) {
        if(err) {
            console.error('UserCtrl - login - findOne. ' + err);
            res.status(401).json({ success: false });
        }
        if(!user) {
            // console.log('UserCtrl - login - 401');
            res.status(401).json({ success: false, message: 'Acceso denegado' });
        }
        else if(query.hashed_pwd) {
            if(encrypt.hashPwd(user.salt, query.hashed_pwd) === user.hashed_pwd) {
                const token = jwt.sign({roles: user.roles, user_id: user._id}, config.staging.tokenSecret);

                let userObj = user.toObject();
                delete userObj.createdAt;
                delete userObj.updatedAt;
                delete userObj.isActive;
                delete userObj._id;
                delete userObj.salt;
                delete userObj.hashed_pwd;
                delete userObj.__v;
                delete userObj.likes;
                delete userObj.seniority;
                delete userObj.wishList;
                delete userObj.notifications;
                delete userObj.performance;
                delete userObj.passRecovery;
                userObj.profileImage = "/assets/images/users/" + userObj.profileImage;

                userObj.upgradeBadge = helpers.getUpgradeBadge(user.upgrade).badgeName;

                userObj.token = token;
                userObj.success = true;

                createLogRecord(user._id);

                res.status(200).json(userObj);
                res.end();
            } else {
                res.status(401).json({ success: false, message: 'Credenciales inválidas' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Credenciales no proporcionadas' });
        }
    })
};

function createLogRecord(user) {
    const logData = {
        userId: user._id
    };

    const userLog = new UserLog(logData);
    userLog.save();
}

// Rest the collaborator current points
exports.restPoints = function (user_id, points, callback) {
    console.log('Rest collaborator current points');
    var query = {
        _id: user_id,
        "points.current": {$gte: Number(points)}
    };
    var data = {
        "points.current": Number(points) * -1
    };

    User.findOneAndUpdate(query, {$inc: data}, {new: true}, function (err, doc) {
        if(err)
            console.log(err);
        if(doc) {
            callback(doc);
        }
    })
};

// Rest the collaborator temporal points
exports.restTemporalPoints = function (user_id, points, callback) {
    console.log('Rest collaborator temporal points _id: ' + user_id + ' at ' + new Date());
    var query = {
        _id: user_id,
        "points.temporal": {$gte: Number(points)}
    };
    var data = {
        "points.temporal": Number(points) * -1
    };
    User.findOneAndUpdate(query, {$inc: data}, {new: true}, function (err, doc) {
        if(err)
            console.log(err);
        if(doc) {
            callback(doc);
        } else
            callback(null);
    })
};

// increments the current points of a collaborator
exports.incCurrentPoints = function (user_id, points, callback) {
    console.log("user id" +user_id + "points "+points);
    console.log('Increment collaborator current points _id: ' + user_id + ' at ' + new Date());
    var query = {
        _id: user_id
    };
    var data = {
        "points.temporal": Number(points)
    };

    User.findOneAndUpdate(query, {$inc: data}, {new: true}, function (err, doc) {
        if(err)
            console.log(err);
        if(doc) {
            callback(doc);
        }
    })
};

exports.get = function (req, res) {
    // console.log('Get users by name');
    let senderLocation;
    let limit;
    let userPromise = (query, senderLocation) => {
        return new Promise((resolve, reject) => {
            const userProjection = { _id: 1, completeName: 1, employeeNumber: 1, upgrade: 1, seniority: 1, performance: 1,
                points: 1, location: 1, profileImage: 1, roles: 1, area: 1, department: 1, position: 1 };
            if(req.query.type === 'byCompleteName') {
                limit = 5;
            }
            User
                .find(query, userProjection)
                .limit(limit)
                .lean()
                .exec((err, users) => {
                    if(err) {
                        console.error(err);
                    }
                    if(users.length > 0) {
                        const userWithOtherLocation = [];
                        let customUsers = _.map(users, user => {
                            let customUser = {
                                _id: user._id,
                                completeName: user.completeName,
                                employeeNumber: user.employeeNumber,
                                upgrade: user.upgrade,
                                seniority: user.seniority,
                                performance: user.performance,
                                points: user.points,
                                position: user.position,
                                department: user.department,
                                area: user.area
                            };

                            if(typeof user.location !== 'undefined') {
                                customUser.location = user.location;
                            }
                            if(user.profileImage) {
                                customUser.profileImage = "/assets/images/users/" + user.profileImage;
                            }
                            else {
                                customUser.profileImage = "https://source.unsplash.com/random/400x200";
                            }

                            if(req.query.type === 'byAdmin') {
                                customUser.roles = user.roles;
                            }

                            return customUser;
                        });

                        if(req.query.type !== 'byCollaborator') {
                            customUsers = _.filter(customUsers, user => {
                                if(user.location === senderLocation) {
                                    return user;
                                } else {
                                    userWithOtherLocation.push(user);
                                }
                            });
                            customUsers = customUsers.concat(userWithOtherLocation);
                        }
                        resolve(customUsers);
                    } else {
                        reject('No users found');
                    }
                })
        })
    };

    function sendResponse(users) {
        let resData = {
            success: true,
            users: []
        };

        if(typeof users !== 'undefined') {
            resData.users = users;
            res.status(200).json(resData);
        } else {
            resData.success = false;
            resData.message = 'No se encontraron colaboradores';
            res.status(404).json(resData);
        }
    }

    let query = {
        isActive: true,
        seniority: { $gte: 1 }
    };
    // search for collaborator in badge box
    if(req.query.type === 'byCompleteName') {
        console.log('GET User by complete name');
        query._id = {$ne: jwtValidation.getUserId(req.headers['x-access-token'])};
        if(req.query.completeName) {
            query.completeName = {$regex: req.query.completeName, $options: 'i'};
        }

        if(req.query.location) {
            senderLocation = req.query.location;
        }
    }

    if(req.query.type === 'byCollaborator') {
        query._id = jwtValidation.getUserId(req.headers['x-access-token']);
    }

    userPromise(query, senderLocation)
        .catch(err => console.error(err))
        .then(sendResponse);
};

exports.put = function (req, res) {
    console.log('PUT user progile image');
    if(req.file) {
        var query = {
            _id: jwtValidation.getUserId(req.headers['x-access-token'])
        };
        var data = {
            profileImage: req.file.filename
        };

        User.update(query, {$set: data}, function (err, doc) {
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
    }
};

exports.putPass = function (req, res) {
    let salt, hash;
    const query = {
        _id: jwtValidation.getUserId(req.headers['x-access-token'])
    };

    salt = encrypt.createSalt();
    hash = encrypt.hashPwd(salt, req.body.newPass);
    const data = {
        salt: salt,
        hashed_pwd: hash,
        passChanged: true
    };

    if(req.body.email) {
        data.email = req.body.email;
    }

    User.update(query, {$set: data}, function (err, doc) {
        if(err) {
            console.error(err);
            res.status(500).json({success: false});
            res.end();
        }

        if(doc.nModified !== 0) {
            res.status(200).json({success: true});
            res.end();
        }
    })
};

exports.getEmail = (req, res) => {

};

exports.forgottenPass = function (req, res) {
    let userPromise = function (query) {
        return new Promise((resolve, reject) => {
            User
                .findOne(query)
                .exec((err, user) => {
                    if(err) {
                        console.error(err);
                    }
                    if(user) {
                        if(user.email) {
                            const uuidData = {
                                user_id: user._id,
                                uuid: shortid.generate(),
                                expiresAt: moment().utcOffset(60).format('YYYY-MM-DD'),
                                userEmail: user.email
                            };
                            resolve(uuidData);
                        } else {
                            reject({message: 'Correo electrónico no proporcionado'});
                        }
                    } else {
                        reject({message: 'Información no encontrada'});
                    }
                })
        });
    };

    let sendMailPromise = function (uuiData) {
        return new Promise((resolve, reject) => {
            if(typeof uuiData !== 'undefined') {
                const html = "<!DOCTYPE html>" +
                    "<html xmlns='http://www.w3.org/1999/xhtml'>" +
                    "<head>" +
                    "<meta charset='utf-8'>" +
                    "<meta name='x-apple-disable-message-reformatting'>" +
                    "<title>Valora</title>" +
                    "</head>" +
                    "<body width='100%' bgcolor='#ffffff' style='margin: 0; mso-line-height-rule: exactly;'>" +
                    "<table width='100%' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' id='backgroundTable' st-sortable='header'>" +
                    "<tbody>" +
                    "<tr>" +
                    "<td>" +
                    "<table width='600' cellpadding='0' cellspacing='0' border='0' align='center' class='devicewidth'>" +
                    "<tbody>" +
                    "<tr>" +
                    "<td width='100%'>" +
                    "<table bgcolor='#ffffff' width='600' cellpadding='0' cellspacing='0' border='0' align='center' class='devicewidth' style='border-bottom: 1px solid #32dfff'>" +
                    "<tbody>" +
                    "<tr>" +
                    "<td height='5' style='font-size:1px; line-height:1px; mso-line-height-rule: exactly;'>&nbsp;</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "<table width='100' align='left' border='0' cellpadding='0' cellspacing='0' class='devicewidth'>" +
                    "<tbody>" +
                    "<tr>" +
                    "<td width='74' height='65' align='center'>" +
                    "<div class='imgpop'>" +
                    "<a target='_blank' href='#'>" +
                    "<img src='https://valora-gp.com/assets/images/logo-valora-icono.png' alt='' border='0' width='74' height='65' style='display:block; border:none; outline:none; text-decoration:none;'>" +
                    "</a>" +
                    "</div>" +
                    "</td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>" +
                    "<table width='500' border='0' align='right' valign='middle' cellpadding='0' cellspacing='0' border='0' class='devicewidth'>" +
                    "<tbody>" +
                    "<tr>" +
                    "<td align='center' style='font-family: Helvetica, arial, sans-serif; font-size: 18px;color: #c689ff' st-content='phone'  height='65'>" +
                    "<p>Proceso para la recuperación de contraseña</p>" +
                    "</td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td height='5' style='font-size:1px; line-height:1px; mso-line-height-rule: exactly;'>&nbsp;</td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>" +
                    "</td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>" +
                    "</td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>" +
                    "<table width='100%' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' id='backgroundTable' st-sortable='banner'>" +
                    "<tbody>" +
                    "<tr>" +
                    "<td>" +
                    "<table width='600' cellpadding='0' cellspacing='0' border='0' align='center' class='devicewidth' style='border-bottom: 1px solid #32dfff'>" +
                    "<tbody>" +
                    "<tr>" +
                    "<td width='100%'>" +
                    "<table bgcolor='#ffffff' width='600' align='center' cellspacing='0' cellpadding='0' border='0' class='devicewidth'>" +
                    "<tbody>" +
                    "<tr>" +
                    "<td align='center' st-image='banner-image'>" +
                    "<div style='font-family: Helvetica, arial, sans-serif; font-size: 15px;color: #000000'>" +
                    "<ol style='text-align: left; color: #f28bb9'>" +
                    "<li>En este correo viene la nueva contraseña</li>" +
                    "<li>Cuando entres a valora, usa esta contraseña</li>" +
                    "<li>Se te solicitará un cambio de contraseña</li>" +
                    "<li>Por seguridad, te recomendamos cambiar la contraseña</li>" +
                    "</ol>" +
                    "<p style='color: #fb898b'>Nueva contraseña: <b>" + uuiData.uuid + "</b></p>" +
                    "</div>" +
                    "</td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>" +
                    "</td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>" +
                    "</td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>" +
                    "</body>" +
                    "</html>";
                const mailData = mailcomposer({
                    from: 'soporte-tecnico@valora-gp.com',
                    to: uuiData.userEmail,
                    subject: 'Cambio de contraseña',
                    text: '',
                    html: html
                });

                mailData.build(function (error, message) {
                    const sendTo = {
                        to: uuiData.userEmail,
                        message: message.toString('ascii')
                    };

                    mailgun.messages().sendMime(sendTo, function (sendError, body) {
                        if (sendError) {
                            console.error(sendError);
                            reject({message: sendError});
                        }

                        if(body) {
                            resolve(uuiData);
                        }
                        else {
                            reject({message: 'No se pudo enviar el correo electrónico'});
                        }
                    });
                })
            } else {
                reject('No user information received');
            }
        });
    };

    let forcePassChangePromise = function (uuiData) {
        return new Promise((resolve, reject) => {
            if(typeof uuiData !== 'undefined') {
                const userQuery = {
                    _id: uuiData.user_id
                };
                User
                    .findOne(userQuery)
                    .exec((err, user) => {
                        if(err) {
                            console.error(err);
                        }
                        if(user) {
                            let salt, hash;
                            salt = encrypt.createSalt();
                            hash = encrypt.hashPwd(salt, uuiData.uuid);

                            user.passRecovery.uuid = uuiData.uuid;
                            user.passChanged = false;
                            user.salt = salt;
                            user.hashed_pwd = hash;

                            user.save(function (err) {
                                if(err) {
                                    console.error(err);
                                }
                                else {
                                    resolve(true);
                                }
                            })
                        }
                    })
            } else {
                reject('No uui data received');
            }
        });
    };

    let query = {};
    if(req.query.employeeNumber) {
        query.employeeNumber = req.query.employeeNumber;
    }

    userPromise(query)
        .then(sendMailPromise)
        .then(forcePassChangePromise)
        .catch(err => {
            console.error('Send mail - ' + err.message);
        })
        .then(sendResponse);

    function sendResponse() {
        const responseData = {
            success: true,
            message: 'Contraseña cambiada correctamente'
        };

        res.status(200).json(responseData);
    }
};

exports.putPreferences = function (req, res) {
    let query = {
        _id: jwtValidation.getUserId(req.headers['x-access-token'])
    };
    let data = {};
    if(req.body.email)
        data.email = req.body.email;
    if(req.body.notifications) {
        if(typeof req.body.notifications.badge !== 'undefined')
            data['notifications.badge'] = req.body.notifications.badge;
        if(typeof req.body.notifications.upgrade !== 'undefined')
            data['notifications.upgrade'] = req.body.notifications.upgrade;
        if(typeof req.body.notifications.performance !== 'undefined')
            data['notifications.performance'] = req.body.notifications.performance;
        if(typeof req.body.notifications.feedLike !== 'undefined')
            data['notifications.feedLike'] = req.body.notifications.feedLike;
        if(typeof req.body.notifications.seniority !== 'undefined')
            data['notifications.seniority'] = req.body.notifications.seniority;
        if(typeof req.body.notifications.ambassador !== 'undefined')
            data['notifications.ambassador'] = req.body.notifications.ambassador;
    }

    User.update(query, {$set: data}, function (err, doc) {
        if(err)
            console.log(err);

        if(doc.nModified !== 0) {
            res.status(200).json({success: true});
            res.end();
        } else {
            res.status(500).json({success: false});
            res.end();
        }
    })
};

exports.getPreferences = function (req, res) {
    let query = {
        _id: jwtValidation.getUserId(req.headers['x-access-token'])
    };

    User.findOne(query, {notifications: 1, email: 1}, function (err, data) {
        if(err)
            console.log('Error at getting user preferences. ' + err);
        if(data) {
            res.status(200).json(data);
            res.end();
        }
    })
};

/**
 * Get all the active collaborators
 * @param req
 * @param res
 */
exports.getActiveCollaborators = (req, res) => {
    // console.log('Collaborators by location');
    let userPromise = query => {
        return new Promise((resolve, reject) => {
            const userProjection = { completeName: 1, employeeNumber: 1, seniority: 1, location: 1, position: 1, area: 1 };
            User
                .find(query, userProjection)
                .sort({seniority: -1})
                .lean()
                .exec((err, users) => {
                    if(err) {
                        console.error(err);
                    }
                    if(users.length > 0) {

                        const customUsers = _.map(users, user => {
                            return {
                                completeName: user.completeName,
                                employeeNumber: user.employeeNumber,
                                seniority: user.seniority,
                                location: user.location,
                                position: user.position,
                                area: user.area
                            }
                        });
                        resolve(customUsers)
                    } else {
                        reject('No users found');
                    }
                })
        })
    };

    function sendResponse(users) {
        const fields = ['completeName', 'employeeNumber', 'seniority', 'location', 'area', 'position'];
        let resData = {
            success: true,
            users: []
        };

        if(typeof users !== 'undefined') {
            if(req.query.type === 'csv') {
                try {
                    json2csv({ data: users, fields: fields }, function(err, csv) {
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
                resData.users = users;
                res.status(200).json(resData);
            }
        } else {
            resData.message = 'No se encontraron colaboradores';
            resData.success = false;
            res.status(404).json(resData);
        }
    }

    let query = {
        isActive: true
    };

    if(req.query.webApp === 'valora') {
        query.seniority = { $gte: 1 };
    }

    if(req.query.webApp === 'upgrade') {
        query.seniority = { $eq: 0 };
    }

    if(req.query.location) {
        query.location = req.query.location;
    }

    userPromise(query)
        .catch(err => console.error(err))
        .then(sendResponse);
};

/**
 * Get the temporal password for the collaborators
 * @param req
 * @param res
 */
exports.getTemporalPass = (req, res) => {
    let query = {};

    if (req.query.completeName) {
        query.completeName = {$regex: req.query.completeName, $options: 'i'};
    }

    if(req.query.employeeNumber) {
        query.employeeNumber = req.query.employeeNumber;
    }

    User
        .find(query)
        .lean()
        .exec((err, users) => {
            if(err) {
                console.log(err);
            }
            if(users.length > 0) {
                const customUsers = _.map(users, user => {

                    let customData = {
                        completeName: user.completeName,
                        employeeNumber: user.employeeNumber,
                        location: user.location,
                        email: user.email,
                        seniority: user.seniority,
                        passChanged: user.passChanged,
                        isActive: user.isActive,
                        _id: user._id
                    };

                    if(typeof user.passRecovery !== 'undefined') {
                        customData.temporal = user.passRecovery.uuid;
                    }

                    return customData;
                });

                res.status(200).json({success: true, users: customUsers});
            } else {
                res.status(404).json({success: false, users: [], message: 'Información no encontrada'});
            }
        })
};

/**
 * Get the current locations from the database
 * @param req
 * @param res
 */
exports.getLocation = (req, res) => {
    User
        .distinct('location')
        .lean()
        .exec((err, locations) => {
            if(err) {
                console.error(err);
            }
            if(locations.length > 0) {
                res.status(200).json({success: true, locations: locations});
            } else {
                res.status(404).json({success: false, locations: []});
            }
        })
};

exports.activate = (req, res) => {
    // console.log('Activate collaborator');
    if(req.params._id) {
        const query = {
            _id: req.params._id
        };

        User
            .findOneAndUpdate(query, { $set: { isActive: true } }, { new: true })
            .exec((err, user) => {
                if(err) {
                    console.error(err);
                }
                if(user) {
                    res.status(200).json({ success: true, user: user });
                }
            })
    } else {
        res.status(200).json({ message: 'No se proporciono la clave', success: false });
    }
};