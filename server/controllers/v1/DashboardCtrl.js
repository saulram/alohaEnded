/**
 * Created by Mordekaiser on 01/11/16.
 */
"use strict";
const mongoose = require('mongoose'),
    
    getSlug = require('speakingurl'),
    moment = require('moment'),
    jwt = require('../../services/v1/jwtValidation'),
    User = mongoose.model('User'),
    Badge = mongoose.model('Badge'),
    UserLog = mongoose.model('UserLog'),
    Acknowledgment = mongoose.model('Acknowledgment'),
    _ = require('underscore'),
    json2csv = require('json2csv');



exports.getGeneralsMetrics = function (req, res) {
    console.log("Metricas generales")
    var query = {
        isActive: true
    };
    getBadges(query)
    function getBadges(query) {
        UserLog.find({})
            .populate("userId").then(function(dbUserLog) {

                res.status(200).json(dbUserLog);
                res.end();
            }).catch(function(err){
                res.status(500).json({success: false, error: err});
                res.end();
            })
    }
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