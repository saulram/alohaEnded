/**
 * Created by Mordekaiser on 17/10/16.
 */
"use strict";
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    jwtValidation = require('../../services/v1/jwtValidation'),
    Reward = mongoose.model('Reward'),
    moment = require('moment');

// updates the rewards wish list of the user
exports.put = function (req, res) {
    console.log('PUT wish list');
    var data = {};
    var query = {
        _id: jwtValidation.getUserId(req.headers['x-access-token'])
    };

    if(req.body.wishList)
        data.wishList = req.body.wishList;

    User.update(query, {$addToSet: data}, function (err) {
        if(err) {
            console.log(err);
            res.status(500).json({success: false, error: err});
            res.end();
        }
        else {
            res.status(201).json({success: true});
            res.end();
        }
    })
};

exports.del = function (req, res) {
    console.log('DELETE wish list');
    var data = {};
    var query = {
        _id: jwtValidation.getUserId(req.headers['x-access-token'])
    };

    if(req.body.wishList)
        data['$in'] = [req.body.wishList];

    User.update(query, {$pull: {wishList: data}}, function (err) {
        if(err) {
            console.log(err);
            res.status(500).json({success: false, error: err});
            res.end();
        }
        else {
            res.status(201).json({success: true});
            res.end();
        }
    })
};

exports.get = function (req, res) {
    console.log('GET my wish list');
    var query = {
        _id: jwtValidation.getUserId(req.headers['x-access-token'])
    };

    User.findOne(query)
        .exec(function (err, user) {
            if(err) {
                console.log(err);
                res.status(500).json({success: false, error: err});
                res.end();
            }

            if(user) {
                var rewardQuery = {
                    _id: {$in: user.wishList}
                };

                Reward.find(rewardQuery)
                    .sort({name: 1})
                    .exec(function (err, rewards) {
                        if(err) {
                            res.status(500).json({success: false});
                            res.end();
                        }

                        var objectReward = [];
                        var waiting = rewards.length;
                        if(waiting > 0) {
                            rewards.forEach(function(values) {
                                var reward = values.toObject();
                                delete reward.__v;
                                delete reward.createdAt;
                                delete reward.isActive;
                                delete reward.updatedAt;
                                reward.image = "/assets/images/rewards/" + values.image;
                                reward.expiresAt = moment(reward.expiresAt).locale('es').format('MM-DD-YYYY');

                                objectReward.push(reward);
                                waiting--;

                                if(waiting == 0) {
                                    res.status(200).json(objectReward);
                                    res.end();
                                }
                            });
                        } else {
                            res.status(404);
                            res.end();
                        }
                    });
            }
        })
};