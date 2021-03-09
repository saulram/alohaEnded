/**
 * Created by Mordekaiser on 14/10/16.
 */
"use strict";

const mongoose = require('mongoose'),
    Reward = mongoose.model('Reward'),
    getSlug = require('speakingurl'),
    moment = require('moment'),
    User = mongoose.model('User'),
    jwtValidation = require('../../services/v1/jwtValidation'),
    feedCtrl = require('../../controllers/v1/FeedsCtrl'),
    Account = mongoose.model('Account'),
    json2csv = require('json2csv'),
    _ = require('underscore');

exports.post = function (req, res) {
    let data = {
        size: [],
        gender: [],
        color: []
    };

    if(req.body.name){
        data.name = req.body.name;
        data.slug = getSlug(req.body.name, {lang: 'es'});
    }
    if(req.body.description)
        data.description = req.body.description;
    if(req.body.points)
        data.points = Number(req.body.points);
    if(req.body.expiresAt)
        data.expiresAt = req.body.expiresAt;
    if(req.file)
        data.image = req.file.filename;
    if(req.body.category)
        data.category = req.body.category;
    if(req.body.sizes)
        data.size = req.body.sizes.split(',');
    if(req.body.genders)
        data.gender = req.body.genders.split(',');
    if(req.body.colors)
        data.color = req.body.colors.split(',');

    const reward = new Reward(data);
    reward.save(function(err, doc) {
        if(err) {
            res.status(500).json({success:false});
            res.end();
        }
        if(doc) {
            feedCtrl.createFeed('', '', '', '', '', doc, '', 0, doc.description, 'New reward');
            res.status(201).json({success: true});
            res.end();
        }
    });
};

exports.get = function (req, res) {
    // always query the active documents
    let query = {
        isActive: true
    };

    if(req.query._id)
        query._id = req.query._id;

    if(req.query.type === 'byId')
        findAll(query);
    else if(jwtValidation.isAdmin(req.headers['x-access-token']) && req.query.type === 'all') {
        findAll(query);
    } else
        findDocs();

    function findDocs() {
        // Query the user so we get the wish list and likes
        User.findOne({_id: jwtValidation.getUserId(req.headers['x-access-token'])})
            .exec(function (err, user) {
                if(err) {
                    console.log(err);
                    res.status(500).json({success: false, error: err});
                    res.end();
                }

                if(user) {
                    var rewardQuery = {
                        isActive: true,
                        expiresAt: {$gte: moment().format("MM-DD-YYYY")}
                    };

                    var nSkip = 0;

                    if(req.query.lastId)
                        rewardQuery._id = {$gt: req.query.lastId};

                    if(req.query.prevId)
                        rewardQuery._id = {$lt: req.query.prevId};

                    if(req.query.currentPage)
                        nSkip = 9 * (req.query.currentPage - 1);

                    Reward.find(rewardQuery)
                        .skip(nSkip)
                        .limit(9)
                        .sort({points: 1})
                        .exec(function (err, rewards) {
                            if(err) {
                                res.status(500).json({success: false});
                                res.end();
                            }

                            var objectReward = [];

                            rewards.forEach(function(values) {
                                var reward = values.toObject();
                                delete reward.__v;
                                delete reward.createdAt;
                                delete reward.isActive;
                                // send an active parameter, so html reward class can be display
                                var currentDate = moment().format("MM-DD-YYYY");
                                var lastUpdate = moment(reward.updatedAt).format("MM-DD-YYYY");
                                if(lastUpdate >= currentDate)
                                    reward.new = 'active';
                                delete reward.updatedAt;
                                reward.image = "/assets/images/rewards/" + values.image;
                                reward.expiresAt = moment(reward.expiresAt).locale('es').format('LL');
                                //send an active parameter, so html wish list class can be displayed
                                var wlIndex = user.wishList.indexOf(reward._id);
                                if(wlIndex > -1)
                                    reward.wishList = 'active';
                                else
                                    reward.wishList = '';
                                var likeIndex = user.likes.indexOf(reward._id);
                                if(likeIndex > -1)
                                    reward.likeStatus = 'active';
                                else
                                    reward.likeStatus = '';
                                // verify if user has points to change reward
                                if(Number(values.points) <= Number(user.points.current))
                                    reward.lockStatus = 'active';
                                else
                                    reward.lockStatus = '';

                                reward.comments = values.comments.sort(function (a, b) {
                                    if(a.postedAt < b.postedAt)
                                        return 1;
                                    if(a.postedAt > b.postedAt)
                                        return -1;
                                    return 0;
                                });

                                objectReward.push(reward);
                            });
                            res.status(200).json(objectReward);
                            res.end();
                        });
                }
            });
    }

    // get all the documents for the admin view
    function findAll(query) {
        console.log('GET Admin rewards');
        Reward.find(query, function (err, rewards) {
            if(err) {
                console.log(err);
                res.status(500).json({success: true});
                res.end();
            }
            if(rewards) {
                var objectRewards = [];

                rewards.forEach(function(values) {
                    var reward = values.toObject();
                    delete reward.__v;
                    delete reward.createdAt;
                    delete reward.updatedAt;
                    delete reward.isActive;
                    delete reward.slug;
                    delete reward.likes;

                    reward.image = "/assets/images/rewards/" + values.image;
                    if(req.query.type == 'byId')
                        reward.expiresAt = moment(reward.expiresAt);
                    else
                        reward.expiresAt = moment(reward.expiresAt).locale('es').format('LL');

                    objectRewards.push(reward);
                });

                res.status(200).json(objectRewards);
                res.end();
            }
        })
    }
};

exports.del = function (req, res) {
    console.log('DELETE Rewards');
    var query = {};
    var data = {
        isActive: false
    };

    if(req.query._id)
        query._id = req.query._id;

    Reward.update(query, {$set: data}, function (err) {
        if (err) {
            console.log(err);
            res.status(401).json({success: false, error: err});
        } else {
            res.status(201).json({success: true});
            res.end();
        }
    });
};

exports.put = function (req, res) {
    console.log('PUT Reward');
    var data = {};
    var query = {
        _id: req.query._id
    };

    if(req.body.name){
        data.name = req.body.name;
        data.slug = getSlug(req.body.name, {lang: 'es'});
    }
    if(req.body.description)
        data.description = req.body.description;
    if(req.body.points)
        data.points = Number(req.body.points);
    if(req.body.expiresAt)
        data.expiresAt = moment(req.body.expiresAt).format("MM-DD-YYYY");
    if(req.file)
        data.image = req.file.filename;
    if(req.body.sizes)
        data.size = req.body.sizes.split(',');
    if(req.body.genders)
        data.gender = req.body.genders.split(',');
    if(req.body.colors)
        data.color = req.body.colors.split(',');

    Reward.update(query, {$set: data}, function (err) {
        if (err) {
            console.log(err);
            res.status(401).json({success: false, error: err});
        } else {
            res.status(201).json({success: true});
            res.end();
        }
    });
};

exports.count = function (req, res) {
    Reward.count({isActive: true}, function (err, docs) {
        if(err) {
            console.log(err);
            res.status(500).json({success: false});
            res.end();
        }

        if(docs) {
            var totalPage = Math.round((docs + 9 - 1) / 9);
            res.status(200).json(totalPage);
            res.end();
        }
    })
};

exports.getRewardStatus = function (req, res) {
    //console.log('\x1b[40m', 'GET Reward Status');
    let query = {
        isActive: true,
        exchangeCode: {$exists:true}
    };
    if(req.query.type === 'byId')
        if(req.query.id)
            query._id = req.query.id;

    Account.find(query, function (err, accounts) {
        let waiting = accounts.length;
        let accountRewardObj = [];
        if(waiting > 0) {
            accounts.forEach(function (account) {
                let data = {
                    rewardName: account.rewardName,
                    exchangeCode: account.exchangeCode,
                    status: account.status,
                    size: account.size,
                    gender: account.gender,
                    color: account.color,
                    _id: account._id,
                    createdAt: moment(account.createdAt).locale('es').format('LL')
                };

                User.findOne({_id: account.user_id}, function (usrErr, user) {
                    if(user) {
                        data.collaboratorName = user.completeName;
                        accountRewardObj.push(data);
                    }
                    waiting--;
                    if(waiting == 0) {
                        res.status(200).json(accountRewardObj);
                        res.end();
                    }
                })
            })
        }
    })
};

exports.getRewardStatusLocation = function (req, res) {
    // console.log('\x1b[35m', 'GET Reward Status by location');

    let adminPromise = (admin_id) => {
        return new Promise((resolve, reject) => {
            const userQuery = {
                _id: admin_id
            };

            User
                .findOne(userQuery)
                .lean()
                .exec((err, user) => {
                    if(err) {
                        console.error(err);
                    }
                    if(user) {
                        resolve(user.location);
                    } else {
                        reject('No user found');
                    }
                })
        })
    };

    let accountPromise = location => {
        return new Promise((resolve, reject) => {
            Account
                .find(query)
                .sort({ createdAt: -1 })
                .lean()
                .exec((err, accounts) => {
                    if(err) {
                        console.error(err);
                    }
                    if(accounts.length > 0) {
                        const customData = {
                            location: location,
                            accounts: accounts
                        };

                        resolve(customData);
                    } else {
                        reject('No accounts found');
                    }
                })
        })
    };

    let usersPromise = customData => {
        return new Promise((resolve, reject) => {
            if(typeof customData !== 'undefined') {
                let accountsPromise = [];

                customData.accounts.forEach(account => accountsPromise.push(getUserData(account, customData.location)));

                Promise.all(accountsPromise).then(data => {
                    const filterAccounts = _.filter(data, item => {
                        if(typeof item.location !== 'undefined') {
                            return item;
                        }
                    });

                    resolve(filterAccounts);
                });
            } else {
                reject('No custom data received');
            }
        })
    };

    function getUserData(account, location) {
        return new Promise(resolve => {
            const usersQuery = {
                _id: account.user_id,
                location: location
            };

            let customAccount = {
                rewardName: account.rewardName,
                exchangeCode: account.exchangeCode,
                status: account.status,
                size: account.size,
                gender: account.gender,
                color: account.color,
                _id: account._id,
                createdAt: moment.utc(account.createdAt).locale('es').format('LL')
            };

            User
                .findOne(usersQuery)
                .lean()
                .exec((err, user) => {
                    if(err) {
                        console.error(err);
                    }
                    if(user) {
                        customAccount.location = user.location;
                        customAccount.completeName = user.completeName;
                        customAccount.area = user.area;
                        customAccount.position = user.position;

                        resolve(customAccount);
                    } else {
                        resolve(customAccount);
                    }
                })
        })
    }

    function sendResponse(accounts) {
        let resData = {
            success: true,
            accounts: []
        };

        if(typeof accounts !== 'undefined') {
            resData.accounts = accounts;
            res.status(200).json(resData);
        } else {
            resData.success = false;
            resData.message = 'No se encontró información';
            res.status(404).json(resData);
        }
    }

    const query = {
        isActive: true,
        exchangeCode: { $exists: true }

    };
    const admin_id = jwtValidation.getUserId(req.headers['x-access-token']);

    adminPromise(admin_id)
        .then(accountPromise)
        .then(usersPromise)
        .catch(err => console.error(err))
        .then(sendResponse)
};

exports.getExchangedReport = function (req, res) {
    // console.log('GET Most exchanged report');
    let query;
    let matchQuery = {};

    if(req.query.lastId && req.query.type !== 'csv') {
        matchQuery = { $match: { reward_id: { $ne: null, $gt: req.query.lastId} } }
    } else {
        matchQuery = { $match: { reward_id: { $ne: null } } }
    }

    if(req.query.type === 'csv') {
        query = [
            matchQuery,
            {$group: {_id: {reward_id: "$reward_id", rewardName: "$rewardName"}, count: {$sum: 1}}},
            {$sort: {count: -1}}
        ];
    } else {
        query = [
            matchQuery,
            {$group: {_id: {reward_id: "$reward_id", rewardName: "$rewardName"}, count: {$sum: 1}}},
            {$sort: {count: -1}},
            { $limit: 10 }
        ];
    }

    Account
        .aggregate(query)
        .exec(function (err, docs) {
            if(err) {
                console.log(err);
                res.status(500).json({success: false});
                res.end();
            }

            if(docs.length > 0) {
                if(req.query.type === 'csv') {
                    const fields = ['Nombre', 'Canjeados'];
                    const data = [];
                    docs.forEach(function (values, key) {
                        var info = {
                            Nombre: values._id.rewardName,
                            Canjeados: values.count
                        };
                        data.push(info);
                    });
                    json2csv({ data: data, fields: fields }, function(err, csv) {
                        if (err) console.log(err);
                        res.set('Content-Type', 'text/csv;charset=utf-8;');
                        res.send(new Buffer(csv));
                    });
                }
                else {
                    const resData = {
                        success: true,
                        exchanges: docs
                    };

                    res.status(200).json(resData);
                }
            } else {
                res.status(404).json({success: false, message: 'No se encontraron más resultados'});
            }
        })
};

exports.exchangedRewards = function (req, res) {
    // console.log('Rewards exchanged by date - report');
    const fields = ['exchangeCode', 'createdAt', 'rewardName', 'employeeNumber', 'location', 'area', 'position'];


    let accountPromise = query => {
        return new Promise((resolve, reject) => {
            Account
                .find(query)
                .lean()
                .exec(function (err, accounts) {
                    if(err) {
                        console.error('RewardsCtrl - exchangedRewards. ' + err);
                    }
                    if(accounts) {
                        const customAccounts = accounts.map(function (account) {
                            return {
                                createdAt: moment.utc(account.createdAt).locale('es').format('LL'),
                                rewardName: account.rewardName,
                                exchangeCode: account.exchangeCode,
                                user_id: account.user_id
                            };
                        });

                        resolve(customAccounts);
                    } else {
                        reject('No accounts found');
                    }
                });
        })
    };

    let userPromise = accounts => {
        return new Promise((resolve, reject) => {
            if(typeof accounts !== 'undefined') {
                let accountsPromise = [];
                accounts.forEach(account => accountsPromise.push(getUserData(account)));

                Promise.all(accountsPromise).then(data => {
                    resolve(data);
                })
            } else {
                reject('No accounts received');
            }
        })
    };

    function getUserData(account) {
        return new Promise(resolve => {
            const userQuery = {
                _id: account.user_id
            };

            let customAccount = {
                createdAt: account.createdAt,
                rewardName: account.rewardName,
                exchangeCode: account.exchangeCode
            };

            User
                .findOne(userQuery)
                .lean()
                .exec((err, user) => {
                    if(err) {
                        console.error(err);
                    }
                    if(user) {
                        customAccount.employeeNumber = user.employeeNumber;
                        customAccount.location = user.location;
                        customAccount.area = user.area;
                        customAccount.position = user.position;
                    }

                    resolve(customAccount);
                })
        })
    }

    function sendResponse(accounts) {
        let resData = {
            success: true,
            accounts: []
        };

        if(typeof accounts !== 'undefined') {
            if (req.query.type === 'csv') {
                try {
                    json2csv({ data: accounts, fields: fields }, function(err, csv) {
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
                resData.accounts = accounts;
                res.status(200).json(resData);
            }
        } else {
            resData.message = 'Información no encontrada';
            resData.success = false;
            res.status(404).json(resData);
        }
    }

    let query = {
        exchangeCode: {$exists: true}
    };

    if(req.query.dateTo && req.query.dateFrom) {
        const dateFrom = new Date(req.query.dateFrom.split('T')[0]);
        const dateTo = new Date(req.query.dateTo.split('T')[0] + 'T23:59:59.999Z');
        query.createdAt = {$gte: dateFrom, $lt: dateTo}
    }

    accountPromise(query)
        .then(userPromise)
        .catch(err => console.log(err))
        .then(sendResponse);
};