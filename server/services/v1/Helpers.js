/**
 * Created by Latin on 3/22/2017.
 */
'use strict';
const mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Badge = mongoose.model('Badge'),
    _ = require('underscore');

exports.getUserEmail = function (user_id, callback) {
    User.findOne({_id: user_id}, {_id: 0, email:1}, function (err, email) {
        if(email)
            return callback(email);
        else
            return callback();
    })
};

exports.getUsersEmailByName = usersName => {
    return new Promise((outerResolve, outerReject) => {
        let userPromise = query => {
            return new Promise((resolve, reject) => {
                User
                    .find(query)
                    .lean()
                    .exec((err, users) => {
                        if(err) {
                            console.error(err);
                        }
                        if(users.length > 0) {
                            resolve(users);
                        } else {
                            reject('No users with email');
                        }
                    })
            })
        };

        function sendResponse(users) {
            if (typeof users !== 'undefined') {
                outerResolve(_.map(users, user => user.email));
            }

            outerReject('No users with email');
        }

        let query = {
            completeName: { $in: usersName },
            email: { $exists: true },
            isActive: true,
            seniority: { $gte: 1 }
        };

        userPromise(query)
            .then(sendResponse)
            .catch(err => console.error(err));
    })
};

exports.getBadgeName = function (badgeSlug, callback) {
    Badge.findOne({slug: badgeSlug},{_id: 0, name: 1}, function (err, name) {
        if(err) {
            console.error(err);
        }

        return callback(name);
    })
};

exports.validateNotifications = function (user_id, callback) {
    User.findOne({_id: user_id},{notifications: 1, email: 1, _id: 0}, function (err, userData) {
        if(err)
            console.log('Error at searching for notifications. ' + err);
        if(userData) {
            if(userData.email) {
                callback(userData);
            } else
                callback(false);
        }
        else
            callback(false);

    })
};

exports.getUpgradeBadge = upgrade => {
    let upgradeData = {};
    if(typeof upgrade !== 'undefined') {
        if(upgrade.result >= 30 && upgrade.result <= 100) {
            upgradeData.badgeName = 'Bronce';
            upgradeData.badgeThumbnail = 'https://valora-gp.com/assets/images/upgrade-bronce.png';
        } else if(upgrade.result > 100 && upgrade.result <= 150) {
            upgradeData.badgeName = 'Plata';
            upgradeData.badgeThumbnail = 'https://valora-gp.com/assets/images/upgrade-plata.png';
        } else if(upgrade.result > 150 && upgrade.result <= 200) {
            upgradeData.badgeName = 'Oro';
            upgradeData.badgeThumbnail = 'https://valora-gp.com/assets/images/oro-.png';
        } else if(upgrade.result > 200) {
            upgradeData.badgeName = 'Diamante';
            upgradeData.badgeThumbnail = 'https://valora-gp.com/assets/images/diamante-.png';
        }
    }

    return upgradeData;
};

exports.getUserByCompleteName = completeName => {
    return new Promise((resolve, reject) => {
        const query = {
            completeName: completeName
        };
        const projection = { completeName: 1, location: 1 };

        User
            .findOne(query, projection)
            .lean()
            .exec((err, user) => {
                if(err) {
                    console.error(err);
                }
                if(user) {
                    resolve(user);
                } else {
                    reject('No user found');
                }
            })
    })
};

exports.getUserById = _id => {
    return new Promise((resolve, reject) => {
        const query = {
            _id: _id
        };
        const projection = { completeName: 1, location: 1 };

        User
            .findOne(query, projection)
            .lean()
            .exec((err, user) => {
                if(err) {
                    console.error(err);
                }
                if(user) {
                    resolve(user);
                } else {
                    reject('No user found');
                }
            })
    })
};