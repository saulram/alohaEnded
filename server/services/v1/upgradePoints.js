'use strict';

const mongoose = require('mongoose'),
    User = mongoose.model('User'),
    helpers = require('../../services/v1/Helpers'),
    _ = require('underscore'),
    Account = mongoose.model('Account');

exports.reducePoints = () => {
    let getUsersPromise = query => {
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
                        reject('No users found');
                    }
                })
        })
    };

    let reducePromise = users => {
        return new Promise((resolve, reject) => {
            if(typeof users !== 'undefined') {
                let userPromises = [];

                console.log(users.length);
                users.forEach(user => userPromises.push(reducePoints(user)));

                Promise.all(userPromises).then(data => resolve(data));
            } else {
                reject('No users received');
            }
        })
    };

    function reducePoints(user) {
        return new Promise(resolve => {
            if(typeof user.points !== 'undefined' && typeof user.points.current !== 'undefined') {
                const twentyFivePercent = Math.round(user.points.current/4);

                if(twentyFivePercent > 0 && user.points.current > 0) {
                    const query = {
                        _id: user._id,
                        'points.current': { $gte: twentyFivePercent }
                    };

                    const data = {
                        $inc: { 'points.current': -Number(twentyFivePercent) }
                    };

                    User
                        .findOneAndUpdate(query, data, {new: true})
                        .lean()
                        .exec((err, updatedUser) => {
                            if(err) {
                                console.error(err);
                            }
                            if(updatedUser) {
                                const customUser = {
                                    _id: updatedUser._id,
                                    completeName: updatedUser.completeName,
                                    reducedPoints: twentyFivePercent
                                };

                                resolve(customUser);
                            } else {
                                resolve();
                            }
                        })
                } else {
                    resolve();
                }
            } else  {
                resolve();
            }
        })
    }

    let accountBalancePromise = users => {
        return new Promise((resolve, reject) => {
            let userPromises = [];

            users.forEach(user => {
                if(typeof user !== 'undefined') {
                    userPromises.push(postAccount(user));
                }
            });

            Promise.all(userPromises).then(data => {
                console.log('All account document created, points reduced correctly');
                resolve(data);
            });
        })
    };

    function postAccount(user) {
        return new Promise((resolve, reject) => {
            const data = {
                user_id: user._id,
                createdAt: new Date(),
                updatedAt: new Date(),
                expendedPoints: user.reducedPoints,
                earnedReason: 'Política Valora (-25% de tus puntos totales)',
                earnedType: 'Política'
            };

            const account = new Account(data);
            account.save(err => {
                if(err) {
                    console.error(err);
                } else {
                    resolve();
                }
            })
        })
    }

    const userQuery = {};

    getUsersPromise(userQuery)
        .then(reducePromise)
        .then(accountBalancePromise)
        .catch(err => console.error(err))
};