'use strict';

const jwt = require('../../services/v1/jwtValidation'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Feed = mongoose.model('Feed'),
    Account = mongoose.model('Account'),
    helpers = require('../../services/v1/Helpers');

// increments the current points of a collaborator
exports.post = (req, res) => {
    const collaborator_id = jwt.getUserId(req.headers['x-access-token']);
    let query = {
        _id: collaborator_id
    };
    let data = {
        "upgrade.result": Number(req.body.points)
    };

    User.findOneAndUpdate(query, {$inc: data}, {new: true}, (err, user) => {
        if(err) {
            console.log(err);
        }
        if(user) {
            // update the badge
            let badge = '';
            let currentPoints = user.upgrade.points;
            if (typeof user.upgrade.result !== 'undefined') {
                currentPoints = currentPoints + Number(user.upgrade.result);
            }

            if(currentPoints >= 30 && currentPoints <= 100) {
                badge = 'Bronce';
            } else if(currentPoints > 100 && currentPoints <= 150) {
                badge = 'Plata';
            } else if(currentPoints > 150 && currentPoints <= 200) {
                badge = 'Oro';
            } else if(currentPoints > 200) {
                badge = 'Diamante';
            }

            const upgradeData = {
                receiver_id: user._id,
                receiverName: user.completeName,
                earnedReason: 'upgrade',
                earnedPoints: req.body.points,
                message: badge
            };

            createFeed(upgradeData);

            const info = {
                user_id: user._id,
                earnedPoints: req.body.points,
                earnedReason: 'Upgrade',
                earnedType: 'Upgrade'
            };
            createAccountBalance(info);

            User.update({_id: user._id}, {$set: {'upgrade.badge': badge}}, (err, user) => {
                if(err) {
                    console.log(err);
                }
            });

            res.status(201).json({success: true});
        } else {
            res.status(404).json({success: false, message: 'No se encontró ese colaborador.'});
        }
    })
};

function createFeed(data) {
    var feed = new Feed(data);
    feed.save(function(err, doc) {
        if(err)
            console.log('Error at creating feed for seed. Error: ' + err);
    });
}

function createAccountBalance(data) {
    var account = new Account(data);
    account.save(function(err, doc) {
        if(err)
            console.log('Error at creating account balance for seed. Error: ' + err);
    });
}

exports.getByUser = (req, res) => {
    // console.log('Get points by user');
    const collaborator_id = jwt.getUserId(req.headers['x-access-token']);
    let query = {
        _id: collaborator_id
    };

    User.findOne(query, (err, user) => {
        if(err) {
            console.error(err);
        }
        if(user) {
            const upgrade = helpers.getUpgradeBadge(user.upgrade);
            const customUser = {
                success: true,
                completeName: user.completeName,
                location: user.location,
                badgeName: upgrade.badgeName,
                badgeThumbnail: upgrade.badgeThumbnail,
                points: user.upgrade.result
            };

            res.status(200).json(customUser)
        }
    })
};

exports.get = (req, res) => {
    // console.log('Get users points');
    let usersPromise = query => {
        return new Promise((resolve, reject) => {
            User
                .find(query)
                .sort({'upgrade.result': -1})
                .lean()
                .exec((err, users) => {
                    if(err) {
                        console.error(err);
                    }
                    if(users.length > 0) {
                        resolve(users);
                    } else {
                        reject({message: 'No users found'});
                    }
                })
        })
    };

    let customUserPromise = users => {
        return new Promise((resolve, reject) => {
            if (typeof users !== 'undefined') {
                let usersPromise = [];

                users.forEach(user => {
                    usersPromise.push(customizeData(user));
                });

                Promise.all(usersPromise).then(customData => {
                    resolve(customData);
                })
            } else {
                reject({message: 'No users received'});
            }
        })
    };

    function customizeData(user) {
        return new Promise(resolve => {
            const upgrade = helpers.getUpgradeBadge(user.upgrade);
            let customUser = {
                _id: user._id,
                completeName: user.completeName,
                location: user.location,
                profileImage: 'https://valora-gp.com/assets/images/users/' + user.profileImage,
                points: user.upgrade.result,
                badgeName: upgrade.badgeName,
                badgeThumbnail: upgrade.badgeThumbnail
            };

            resolve(customUser);
        })
    }

    function sendResponse(usersData) {
        if(typeof usersData !== 'undefined') {
            const resData = {
                success: true,
                users: usersData
            };

            res.status(200).json(resData);
        } else {
            res.status(404).json({success: false, message: 'No se encontró información'});
        }
    }

    const query = {
        isActive: true,
        "upgrade.result": { $gt: 0}
    };

    usersPromise(query)
        .then(customUserPromise)
        .catch(err => {
            console.error(err);
        })
        .then(sendResponse);
};