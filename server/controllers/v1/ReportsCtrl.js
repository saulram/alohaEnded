/**
 * Created by Latin on 1/31/2017.
 */
'use strict';
const mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Acknowledgments = mongoose.model('Acknowledgment'),
    Badges = mongoose.model('Badge'),
    Accounts = mongoose.model('Account'),
    moment = require('moment'),
    json2csv = require('json2csv');

exports.generalReport = function (req, res) {
    // console.log('\x1b[35m', 'General report, Upgrade, Performance and Seniority');
    const fields = ['completeName', 'employeeNumber', 'location', 'area', 'department', 'upgradePts', 'seniorityPts', 'performancePts'];
    let rows = [];

    let accountPromise = query => {
        return new Promise((resolve, reject) => {
            Accounts
                .aggregate(query)
                .exec((err, accounts) => {
                    if(err) {
                        console.error(err);
                    }
                    if(accounts.length > 0) {
                        resolve(accounts);
                    } else {
                        console.log('Reject');
                        reject({message: 'No users found'});
                    }
                })
        })
    };

    let userPromise = accounts => {
        return new Promise((resolve, reject) => {
            if (typeof accounts !== 'undefined') {
                let usersPromises = [];

                accounts.forEach(account => {
                    usersPromises.push(getUserData(account));
                });

                Promise.all(usersPromises).then(userAccount => {
                    console.log('users promise Resolved');
                    resolve(userAccount);
                })
            } else {
                reject({message: 'No accounts received'});
            }
        })
    };

    function getUserData(account) {
        return new Promise((resolve, reject) => {
            const userQuery = {
                _id: account._id
            };

            let userAccount = {
                badgesPoints: 0,
                upgradePoints: 0,
                seniorityPoints: 0,
                performancePoints: 0
            };

            let csvData = {
                upgradePts: 0,
                seniorityPts: 0,
                performancePts: 0
            };

            account.earnedTypes.forEach(earnedType => {
                if(earnedType.category === 'seniority') {
                    userAccount.seniorityPoints = earnedType.points;
                    csvData.seniorityPts = earnedType.points;
                }
                if(earnedType.category === 'Upgrade') {
                    userAccount.upgradePoints = earnedType.points;
                    csvData.upgradePts = earnedType.points;
                }
                if(earnedType.category === 'Evaluación de desempeño') {
                    userAccount.performancePoints = earnedType.points;
                    csvData.performancePts = earnedType.points;
                }
            });

            User.findOne(userQuery, function (err, user) {
                if(err) {
                    console.error('Error at searching user in ReportsCtrl. ' + err);
                    reject({message: 'Error at searching user in ReportsCtrl'});
                }
                if(user) {
                    userAccount.completeName = user.completeName;
                    userAccount.employeeNumber = user.employeeNumber;
                    userAccount.location = user.location;
                    userAccount.area = user.area;
                    userAccount.department = user.department;
                    csvData.completeName = user.completeName;
                    csvData.employeeNumber = user.employeeNumber;
                    csvData.location = user.location;
                    csvData.area = user.area;
                    csvData.department = user.department;

                    rows.push(csvData);

                    resolve(userAccount);
                } else {
                    resolve(userAccount);
                }
            });
        });
    }

    function sendResponse(userAccounts) {
        let resData = {};
        if(typeof userAccounts !== 'undefined') {
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
                resData.accounts = userAccounts;
                res.status(200).json(resData);
            }
        } else {
            resData.success = false;
            res.status(404).json(resData);
        }
    }

    let accountsQuery;
    let matchQuery = {};

    if(req.query.lastId) {
        matchQuery._id = {$gt: req.query.lastId};
    }
    if(req.query.dateTo && req.query.dateFrom) {
        const dateFrom = new Date(req.query.dateFrom.split('T')[0]);
        const dateTo = new Date(req.query.dateTo.split('T')[0] + 'T23:59:59.999Z');
        matchQuery.createdAt = {$gte: dateFrom, $lt: dateTo}
    }

    accountsQuery = [
        {$match: matchQuery},
        {$group: {_id: {'user_id': '$user_id', 'earnedType': '$earnedType'}, totalPoints: {$sum: '$earnedPoints'}}},
        {$group: {_id: '$_id.user_id', earnedTypes: {$push: {category: '$_id.earnedType', points: '$totalPoints'}}}}
    ];

    accountPromise(accountsQuery)
        .catch(err => {
            console.error(err);
        })
        .then(userPromise)
        .catch(err => {
            console.error(err);
        })
        .then(sendResponse);
};

exports.badgesPoints = function (req, res) {
    console.log('\x1b[35m', 'Badge points report');
    let badgeCategories = null;

    let query = {
        isActive: true
    };
    let dateTo = new Date();
    let limit = 100;

    if(req.query.lastId)
        query._id = {$gt: req.query.lastId};
    if(req.query.location)
        query.location = req.query.location;
    if(req.query.area)
        query.area = req.query.area;
    if(req.query.department)
        query.department = req.query.department;
    if(req.query.dateTo)
        dateTo = moment.utc(req.query.dateTo).add(1, 'day').format('YYYY-MM-DD');
    if(req.query.location || req.query.area || req.query.department || req.query.dateFrom)
        limit = "";

    // We only query for badges once.
    Badges.find().select({category: 1, slug: 1}).then( badges => {
      badgeCategories = badges.reduce( (acc, badge) => {
        acc[badge.slug] = badge.category;
        return acc;
      }, {});
      return User.find(query).limit(limit);
    })
    .then( users => {
        let promises = [];
        if(users.length > 0) {
            // waits until the last record is returned
            let waiting = 0;
            users.forEach( user => {
                const userData = {
                    _id: user._id,
                    completeName: user.completeName,
                    employeeNumber: user.employeeNumber,
                    location: user.location,
                    area: user.area,
                    department: user.department,
                    currentPoints: user.points.current
                };

                promises.push(customUserPromise(userData));
            });

            return Promise.all(promises);
        }
    })
    .then( customUsers => {
        res.status(200).json(customUsers);
        res.end();
    })
    .catch( (err) => {
        console.error(err);
    });

    /**
     * Gets a custom user with acknowledgments and points.
     * @param {Object} user - A user.
     * @return {Promise} - A promise that resolves into the custom user.
     */
    function customUserPromise(user) {
        return new Promise((resolve, reject) => {
            getAcknowledgments(user).then( acknowledgments => {
                if(acknowledgments) {
                    user.specialTotalPts = acknowledgments.specialTotalPts;
                    user.valuesTotalPts = acknowledgments.valuesTotalPts;
                    user.competencesTotalPts = acknowledgments.competencesTotalPts;
                }
                resolve(user);
            })
            .catch((err) => {
                reject(err);
            });
        });
    };

    /**
     * Get user acknowledgments.
     * @param {Object} user - User to search for acknowledgments.
     * @return {Promise} - A promise that resolves into an array of acknowledgments.
     */
    function getAcknowledgments(user) {

        // should be a promise called on an upper level

        let matchObj = { $match: { receiver_id: user._id.toString() } };
        let groupObj = { $group: { _id: {badgeSlug: '$badgeSlug'}, total: {$sum: '$badgePoints'} } };

        if(req.query.dateTo && req.query.dateFrom) {
            const dateFromAg = new Date(req.query.dateFrom+'T00:00:00Z');
            const dateToAg = new Date(req.query.dateTo+'T23:59:59.999Z');
            matchObj.$match.createdAt = {$gte: dateFromAg, $lte: dateToAg};
        }

        let query = [ matchObj, groupObj ];

        return new Promise( (resolve, reject) => {
            Acknowledgments.aggregate(query).then( acknowledgments => {
                if ( acknowledgments.length > 0 ) {
                    let valuesTotalPts = 0,
                        competencesPts = 0,
                        specialPts = 0;

                    if( acknowledgments.length === 1 ) {
                        let category = badgeCategories[acknowledgments[0]._id.badgeSlug];

                        if(category === 'valor')
                            valuesTotalPts = valuesTotalPts + acknowledgments[0].total;
                        if(category === 'competencias')
                            competencesPts = competencesPts + acknowledgments[0].total;
                        if(category === 'especial')
                            specialPts = specialPts + acknowledgments[0].total;
                        let data = {
                            valuesTotalPts: valuesTotalPts,
                            competencesTotalPts: competencesPts,
                            specialTotalPts: specialPts
                        };

                        resolve(data);
                    } else {
                        for(let i = 0; i < acknowledgments.length; i++) {
                            (function (index) {
                                let categoryData = {};
                                let category = badgeCategories[acknowledgments[index]._id.badgeSlug];
                                if(category === 'valor')
                                    valuesTotalPts = valuesTotalPts + acknowledgments[index].total;
                                if(category === 'competencias')
                                    competencesPts = competencesPts + acknowledgments[index].total;
                                if(category === 'especial')
                                    specialPts = specialPts + acknowledgments[index].total;
                                if(index === Number(acknowledgments.length - 1)) {
                                    categoryData.valuesTotalPts = valuesTotalPts;
                                    categoryData.competencesTotalPts = competencesPts;
                                    categoryData.specialTotalPts = specialPts;

                                    resolve(categoryData);
                                }
                            })(i);
                        }
                    }
                } else {
                    resolve(null);
                }
            })
            .catch( err => {
              reject(err);
            });
        });
    }
};

exports.badgePointsReport = (req, res) => {
    // console.info('Badges points report');
    const fields = ['receiverNumber', 'receiver', 'location', 'senderNumber', 'sender', 'badge', 'points', 'createdAt'];
    let rows = [];
    let limit = 100;

    let acknowledgmentPromise = acknowledgmentQuery => {
        return new Promise((resolve, reject) => {
            Acknowledgments
                .find(acknowledgmentQuery)
                .limit(limit)
                .sort({createdAt: -1})
                .exec((err, acknowledgments) => {
                    if(err) {
                        console.error(err);
                    }

                    if(acknowledgments.length > 0) {
                        resolve(acknowledgments);
                    } else {
                        reject('No hay más información');
                    }
                })
        });
    };

    let badgePromise = function (acknowledgments) {
        return new Promise((resolve, reject) => {
            let badgePromises = [];

            try {
                acknowledgments.forEach(acknowledgment => {
                    badgePromises.push(getBadge(acknowledgment));
                });
            } catch (e) {
                // console.error(e);
                reject('No hay más información');
            }

            Promise.all(badgePromises).then(customData => {
                resolve(customData);
            })
        });
    };

    function getBadge(acknowledgment) {
        return new Promise((resolve, reject) => {
            const badgeQuery = {
                slug: acknowledgment.badgeSlug
            };

            let reportData = {
                _id: acknowledgment._id,
                badgePoints: acknowledgment.badgePoints,
                sender_id: acknowledgment.sender_id,
                receiver_id: acknowledgment.receiver_id,
                createdAt: moment.utc(acknowledgment.createdAt).locale('es').format('LL')
            };

            Badges.findOne(badgeQuery, (err, badge) => {
                if(err) {
                    console.error(err);
                }
                if(badge) {
                    reportData.badgeName = badge.name;
                    resolve(reportData);
                } else {
                    resolve(reportData);
                }
            })
        })
    }

    let userPromise = function (customAcknowledgments) {
        return new Promise((resolve, reject) => {
            let userPromises = [];

            try {
                customAcknowledgments.forEach(acknowledgment => {
                    userPromises.push(getUsers(acknowledgment));
                });
            } catch (e) {
                // console.log(e);
                reject('No hay más información');
            }

            Promise.all(userPromises).then(customData => {
                resolve(customData);
            })
        });
    };

    function getUsers(acknowledgment) {
        return new Promise((resolve, reject) => {
            if (acknowledgment.sender_id === 'administrator') {
                let customData = {
                    _id: acknowledgment._id,
                    badgeName: acknowledgment.badgeSlug,
                    badgePoints: acknowledgment.badgePoints,
                    createdAt: acknowledgment.createdAt,
                    emisor: 'administrator'
                };
                let csvData = {
                    badge: acknowledgment.badgeName,
                    points: acknowledgment.badgePoints,
                    createdAt: acknowledgment.createdAt,
                    sender: 'administrator'
                };

                User
                    .findOne({_id: acknowledgment.receiver_id})
                    .exec((err, user) => {
                        if(err) {
                            console.error(err);
                        }
                        if(user) {
                            customData.receptor = user.completeName;
                            customData.nReceptor = user.employeeNumber;
                            csvData.receiver = user.completeName;
                            csvData.receiverNumber = user.employeeNumber;
                            rows.push(csvData);

                            resolve(customData);
                        } else {

                        }
                    })
            } else {
                Promise.all([
                    User.findOne({_id: acknowledgment.receiver_id}),
                    User.findOne({_id: acknowledgment.sender_id})
                ]).then((values) => {
                    let receiver = values[0];
                    let sender = values[1];

                    let customData = {
                        _id: acknowledgment._id,
                        badgeName: acknowledgment.badgeName,
                        badgePoints: acknowledgment.badgePoints,
                        createdAt: acknowledgment.createdAt
                    };

                    if(receiver) {
                        customData.receptor = receiver.completeName;
                        customData.nReceptor = receiver.employeeNumber;
                        customData.localidad = receiver.location;
                    }

                    if(sender) {
                        customData.emisor = sender.completeName;
                        customData.nEmisor = sender.employeeNumber;
                    } else {
                        customData.emisor = 'administrator';
                    }

                    const csvData = {
                        receiverNumber: receiver.employeeNumber,
                        receiver: receiver.completeName,
                        location: receiver.location,
                        senderNumber: sender.employeeNumber,
                        sender: sender.completeName,
                        badge: acknowledgment.badgeSlug,
                        points: acknowledgment.badgePoints,
                        createdAt: acknowledgment.createdAt
                    };

                    rows.push(csvData);
                    resolve(customData);
                })
                    .catch((err) => {
                        console.log('Err: ' + err);
                        reject(err);
                    });
            }
        });
    }

    function sendResponse(data) {
        if(typeof data !== 'undefined') {
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
                const responseData = {
                    success: true,
                    acknowledgments: data
                };
                res.status(200).json(responseData);
            }
        } else {

            res.status(404).json({success: false, message: 'No hay más información', acknowledgments: []});
        }
    }

    let acknowledgmentQuery = {
        isActive: true
    };

    if(req.query.lastId) {
        acknowledgmentQuery._id = {$lt: req.query.lastId};
    }

    if(req.query.dateTo && req.query.dateFrom) {
        const dateFrom = new Date(req.query.dateFrom.split('T')[0]);
        const dateTo = new Date(req.query.dateTo.split('T')[0] + 'T23:59:59.999Z');
        acknowledgmentQuery.createdAt = {$gte: dateFrom, $lt: dateTo};
        limit = 500;
    }

    if(typeof req.query.type !== 'undefined' && req.query.type === 'csv') {
        limit = '';
    }

    acknowledgmentPromise(acknowledgmentQuery)
        .catch(error => {
            console.error('\x1b[35m', 'acknowledgmentPromise error: ' + error);
        })
        .then(badgePromise)
        .catch(error => {
            console.error('\x1b[35m', 'badgePromise error: ' + error);
        })
        .then(userPromise)
        .catch(error => {
            console.error('\x1b[35m', 'userPromise error: ' + error);
        })
        .then(sendResponse)
};