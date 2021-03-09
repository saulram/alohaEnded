/**
 * Created by Mordekaiser on 27/10/16.
 */
"use strict";

const mongoose = require('mongoose'),
    AccountStatus = mongoose.model('Account'),
    jwtValidation = require('../../services/v1/jwtValidation'),
    userCtrl = require('../../controllers/v1/UsersCtrl'),
    User = mongoose.model('User'),
    moment = require('moment'),
    shortid = require('shortid'),
    feedCtrl = require('../../controllers/v1/FeedsCtrl'),
    json2csv = require('json2csv'),
    mailgunEmail = require('../../services/v1/MailgunEmail'),
    helpers = require('../../services/v1/Helpers'),
    _ = require('underscore');

exports.importPost = function (expendedPoints, rewardName, earnedPoints, earnedReason, user_id) {
    let data = {};
    if(expendedPoints)
        data.expendedPoints = expendedPoints;
    if(rewardName)
        data.rewardName = rewardName;
    if(earnedPoints)
        data.earnedPoints = earnedPoints;
    if(earnedReason)
        data.earnedReason = earnedReason;

    data.user_id = user_id;
    data.earnedType = earnedReason;

    const accountStatus = new AccountStatus(data);
    accountStatus.save(function(err, doc) {
        if(err) {
            console.log(err);
        }
    });
};

// creates a document when collaborator assigns a badge
exports.postBadge = function (user_id, earnedPoints, earnedReason, callback) {
    //console.log('POST Badge document to account');
    const data = {
        user_id: user_id,
        earnedPoints: earnedPoints,
        earnedReason: earnedReason,
        earnedType: 'badge'
    };

    // create new account status document
    const accountStatus = new AccountStatus(data);
    accountStatus.save(function(err, doc) {
        if(err)
            console.log('Error creating document: ' + err);
        if(doc)
            callback(true)

    });

};

// creates the record when a user reclaims a reward
exports.post = function (req, res) {
    var user_id = jwtValidation.getUserId(req.headers['x-access-token']);
    var nRewards = Number(req.body.rewards.length);

    if( nRewards > 0) {
        // first validate if the user has the appropriate amount of points
        // if so decrement the current points
        var totalPoints = req.body.rewards.reduce(getSum, 0);
        userCtrl.restPoints(user_id, totalPoints, function (user) {
            if(user) {
                var code = shortid.generate();
                var waiting = 0;
                for(var i = 0; i < nRewards; i++) {
                    var doc = {
                        user_id: user_id,
                        reward_id: req.body.rewards[i].reward_id,
                        exchangeCode: code,
                        expendedPoints: req.body.rewards[i].points,
                        rewardName: req.body.rewards[i].rewardName,
                        rewardImage: req.body.rewards[i].rewardImage
                    };

                    if(req.body.rewards[i].size)
                        doc.size = req.body.rewards[i].size;
                    if(req.body.rewards[i].gender)
                        doc.gender = req.body.rewards[i].gender;
                    if(req.body.rewards[i].color)
                        doc.color = req.body.rewards[i].color;

                    // create a feed record when a collaborator redeems a reward
                    feedCtrl.createFeed('', '', user._id, user.completeName, '', req.body.rewards[i], '', '', '', 'Reward exchanged', user.location);

                    // create new account status document
                    var accountStatus = new AccountStatus(doc);
                    accountStatus.save(function(err, doc) {
                        if(err)
                            console.log(err);

                    });
                    waiting++;
                }
                if(nRewards === waiting) {
                    searchAdminEmail(user.location, function (emails) {
                        emails.push('alberto_carrillo@grupopresidente.com');
                        let emailData = {
                            exchangeCode: code,
                            rewards: req.body.rewards,
                            receiver_id: user_id,
                            email: emails,
                            receiverName: user.completeName
                        };

                        //sendEmailNotification(emailData);
                    });

                    const response = {
                        exchangeCode: code,
                        currentPoints: Number(user.points.current),
                        success: true
                    };
                    res.status(200).json(response);
                    res.end();
                }
            }
        });
    } else {
        res.status(500).json({success: false});
        res.end();
    }

    function searchAdminEmail(location, done) {
        const query = {
            location: location,
            roles: {$in: ['admin']}
        };

        User.find(query, function (err, users) {
            if(err)
                console.log('AccountStatusCtrl searchAdminEmail. ' + err);
            if(users) {
                const usersEmail = users.map(function (user) {
                    let emails = [];
                    emails.push(user.email);
                    return emails;
                });

                return done(usersEmail);
            }
            else
                done();
        })
    }

    function //sendEmailNotification(emailData) {
        helpers.getUserEmail(emailData.receiver_id, function (user) {
            if(user) {
                let rewardsNameList = "";
                for(let reward of emailData.rewards) {
                    rewardsNameList = rewardsNameList + "<li style='text-align: center'><p>" + reward.rewardName + "</p><img style='width: 100px' src='http://staging.valora-gp.com" + reward.rewardImage + "'></li>";
                }
                let html = "<p>El colaborador " + emailData.receiverName + " canjeó las siguientes recompensas:</p><ul>" + rewardsNameList + "</ul>";
                mailgunEmail.send(emailData.email, 'Recompensa canjeada', html);
            }
        });
    }
};

function getSum(total, item) {
    // http://stackoverflow.com/questions/1230233/how-to-find-the-sum-of-an-array-of-numbers
    return Number(total) + Number(item.points);
}

exports.get = function (req, res) {
    // console.log('GET my activity');
    let accountPromise = query => {
        return new Promise((resolve, reject) => {
            AccountStatus
                .find(query)
                .lean()
                .exec((err, accounts) => {
                    if(err) {
                        console.error(err);
                    }
                    if(accounts.length > 0) {
                        resolve(accounts);
                    } else {
                        reject('No accounts found');
                    }
                })
        })
    };


    function sendResponse(accounts) {
        let resData = {
            success: true,
            accounts: []
        };

        if(typeof accounts !== 'undefined') {
            const currentMonth = new Date().getMonth() + 1;

            const prevAccounts = accounts.filter(account => {
                const createdAt = new moment(account.createdAt);
                if(Number(previousMonth.get('month') + 1) === Number(createdAt.get('month') + 1)) {
                    return account;
                }
            });

            const accountsOfThisMonth = _.filter(accounts, (account) => {
                if(new Date(account.createdAt).getMonth() + 1 === currentMonth) {
                    return account;
                }
            }).map(account => {
                return {
                    createdAt: moment.utc(account.createdAt).locale('es').format('LL'),
                    updatedAt: moment.utc(account.updatedAt).locale('es').format('LL'),
                    user_id: account.user_id,
                    reward_id: account.reward_id,
                    exchangeCode: account.exchangeCode,
                    expendedPoints: account.expendedPoints,
                    rewardName: account.rewardName,
                    earnedPoints: account.earnedPoints,
                    earnedReason: account.earnedReason,
                    earnedType: account.earnedType,
                    size: account.size,
                    gender: account.gender,
                    color: account.color,
                    status: account.status,
                    isActive: account.isActive,
                    _id: account._id
                }
            });

            if(prevAccounts.length > 0) {
                let totalEarnedPts = 0;
                let totalExpendedPts = 0;

                 const prevEarnedPts = prevAccounts.filter(account => {
                    if(typeof account.earnedPoints !== 'undefined') {
                        return account;
                    }
                });

                if(prevEarnedPts.length > 0) {
                    totalEarnedPts = prevEarnedPts.reduce(function addPoints(a, b) {
                        return {earnedPoints: a.earnedPoints + b.earnedPoints};
                    }).earnedPoints;
                }

                const prevExpendedPts = prevAccounts.filter(account => {
                    if(typeof account.expendedPoints !== 'undefined') {
                        return account;
                    }
                });

                if(prevExpendedPts.length > 0) {
                    totalExpendedPts = prevExpendedPts.reduce(function addPoints(a, b) {
                        return { expendedPoints: a.expendedPoints + b.expendedPoints };
                    }).expendedPoints;
                }

                resData.previousPoints = totalEarnedPts - totalExpendedPts;
            }

            resData.accounts = accountsOfThisMonth;
            res.status(200).json(resData);
        } else {
            resData.message = 'No se encontraron registros';
            resData.success = false;
            res.status(404).json(resData);
        }
    }

    const previousMonthDate = new moment().subtract(1, 'months').date(1).format("YYYY-MM-DD");
    const previousMonth = new moment().subtract(1, 'months').date(1);
    const query = {
        isActive: true
    };

    if(req.query.type === 'byId') {
        query.user_id = jwtValidation.getUserId(req.headers['x-access-token']);
        query.createdAt = { $gte: previousMonthDate };
    }

    accountPromise(query)
        .catch(err => console.error(err))
        .then(sendResponse);
};

exports.put = function (req, res) {
    const query = {
        _id: req.query.id
    };
    let data = {};
    if(req.body.state) {
        data.status = req.body.state;
        if(req.body.state === 'Devolución')
            data.isActive = false;
    }

    AccountStatus.findOneAndUpdate(query, {$set: data}, {new: true}, function (err, result) {
        if (err) {
            console.log('AccountStatusCtrl - PUT ' + err);

        }
        if(result) {
            if(result.status === 'Devolución') {
                User.update({_id: result.user_id}, {$inc: {'points.current': result.expendedPoints}}, err => {
                    if(err) {
                        console.log('AccountStatus - PUT - User update ' + err);
                    }
                })
            }
            res.status(201).json({success: true});
        } else {
            res.status(401).json({success: false, error: err});
        }
    });
};

exports.accountHistoryPoints = (req, res) => {
    // console.log('Report total points');
    let query;
    const fields = ['completeName', 'employeeNumber', 'location', 'area', 'department', 'position', 'badge', 'seniority',
    'upgrade', 'performance', 'total'];

    let aggregatePromise = query => {
        return new Promise((resolve, reject) => {
            AccountStatus
                .aggregate(query)
                .exec((err, accounts) => {
                    if(err) {
                        console.error(err);
                    }
                    if(accounts.length > 0) {

                        resolve(accounts);
                    } else {
                        reject('Accounts not found');
                    }
                })
        })
    };

    let userPromise = accounts => {
        return new Promise((resolve, reject) => {
            if(typeof accounts !== 'undefined') {
                let userPromises = [];

                accounts.forEach(account => userPromises.push(getUserData(account)));

                Promise.all(userPromises).then(data => {

                    resolve(data.filter(item => {
                        if(typeof item.completeName !== 'undefined') {
                            return item;
                        }
                    }))
                });
            } else {
                reject('No users received');
            }
        })
    };

    function getUserData(account) {
        return new Promise(resolve => {
            const userQuery = {
                _id: account._id,
                isActive: true
            };

            let customData = {};

            customData.badge = _.reduce(filterByCategory(account, 'badge'), (value, item) => {
                return value + item.total;
            }, 0);

            customData.seniority = _.reduce(filterByCategory(account, 'seniority'), (value, item) => {
                return value + item.total;
            }, 0);

            customData.upgrade = _.reduce(filterByCategory(account, 'Upgrade'), (value, item) => {
                return value + item.total;
            }, 0);

            customData.performance = _.reduce(filterByCategory(account, 'Evaluación de desempeño'), (value, item) => {
                return value + item.total;
            }, 0);

            User
                .findOne(userQuery)
                .lean()
                .exec((err, user) => {
                    if(err) {
                        console.error(err);
                    }
                    if(user) {
                        customData.completeName = user.completeName;
                        customData.employeeNumber = user.employeeNumber;
                        customData.location = user.location;
                        customData.area = user.area;
                        customData.department = user.department;
                        customData.position = user.position;
                        customData.total = customData.performance + customData.upgrade + customData.seniority + customData.badge;
                        resolve(customData);
                    } else {
                        resolve(customData);
                    }
                });
        })
    }

    function filterByCategory(account, category) {
        return _.filter(account.category, (item) => {
            if(item.type === category) {
                return item;
            }
        });
    }

    function sendResponse(users) {
        let resData = {
            success: false,
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
                resData.success = true;
                resData.users = users;
                res.status(200).json(resData);
            }
        } else {
            resData.message = 'Información no encontrada';
            res.status(404).json(resData);
        }
    }

    if(typeof req.query.dateFrom !== 'undefined' && typeof req.query.dateTo !== 'undefined') {
        const dateFrom = new Date(req.query.dateFrom);
        const dateTo = new Date(req.query.dateTo.split('T')[0] + 'T23:59:59.999Z');
        query = [
            { $match: { isActive: true, earnedPoints: { $gt: 0 }, createdAt: { $gte: dateFrom, $lt: dateTo } } },
            { $group: { _id: {user_id: "$user_id", earnedType: "$earnedType" }, total: { $sum: "$earnedPoints" } } },
            { $sort: { "_id.user_id": 1 } },
            { $group: { _id: "$_id.user_id", category: { $push: { type: "$_id.earnedType", total: "$total" } } } }
        ];
    } else {
        query = [
            { $match: { isActive: true, earnedPoints: { $gt: 0 } } },
            { $group: { _id: {user_id: "$user_id", earnedType: "$earnedType" }, total: { $sum: "$earnedPoints" } } },
            { $sort: { "_id.user_id": 1 } },
            { $group: { _id: "$_id.user_id", category: { $push: { type: "$_id.earnedType", total: "$total" } } } }
        ];
    }

    // console.log(query);

    aggregatePromise(query)
        .then(userPromise)
        .catch(err => console.error(err))
        .then(sendResponse);
};

function addPoints(a, b) {
    return {earnedPoints: a.earnedPoints + b.earnedPoints};
}