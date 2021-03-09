/**
 * Created by Mordekaiser on 17/10/16.
 */
"use strict";
var mongoose = require('mongoose'),
    Reward = mongoose.model('Reward'),
    jwtValidation = require('../../services/v1/jwtValidation'),
    User = mongoose.model('User'),
    json2csv = require('json2csv');

exports.put = function (req, res) {
    console.log('PUT reward like');
    var data = {};
    var query = {
        _id: jwtValidation.getUserId(req.headers['x-access-token'])
    };

    if(req.body.likes)
        data.likes = 1;

    Reward.update({_id: req.body.likes}, {$inc: data}, function (err) {
        if(err) {
            console.log(err);
            res.status(500).json({success: false, error: err});
            res.end();
        }
        else {
            User.update(query, {$addToSet: {likes: req.body.likes}}, function (err) {
                if(err) {
                    console.log(err);
                    res.status(500).json({success: false, error: err});
                    res.end();
                }
                else {
                    res.status(201).json({success: true});
                    res.end();
                }
            });
        }
    })
};

exports.del = function (req, res) {
    console.log('DELETE reward like');
    var data = {};
    var query = {
        _id: jwtValidation.getUserId(req.headers['x-access-token'])
    };

    if(req.body.likes)
        data.likes = -1;

    Reward.update({_id: req.body.likes}, {$inc: data}, function (err) {
        if(err) {
            console.log(err);
            res.status(500).json({success: false, error: err});
            res.end();
        }
        else {
            User.update(query, {$pull: {likes: req.body.likes}}, function (err) {
                if(err) {
                    console.log(err);
                    res.status(500).json({success: false, error: err});
                    res.end();
                }
                else {
                    res.status(201).json({success: true});
                    res.end();
                }
            });
        }
    })
};

exports.getReport = function (req, res) {
    // console.log('GET Reward likes - report');
    const query = {
        isActive: true
    };
    let limit = 10;

    if(req.query.lastId) {
        query._id = { $gt: req.query.lastId };
    }

    if(req.query.type === 'csv') {
        limit = '';
    }

    const options = {
        _id: 1,
        name: 1,
        description: 1,
        category: 1,
        points: 1,
        likes: 1
    };

    Reward.find(query, options)
        .limit(limit)
        .sort({ likes: -1 })
        .exec(function (err, rewards) {
            if(err) {
                console.error(err);
            }
            if(rewards.length > 0) {
                if(req.query.type === 'csv') {
                    const fields = ['name', 'description', 'category', 'points', 'likes'];
                    json2csv({ data: rewards, fields: fields }, function(err, csv) {
                        if (err) console.log(err);
                        res.set('Content-Type', 'text/csv;charset=utf-8;');
                        res.send(new Buffer(csv));
                    });
                }
                else {
                    const resData = {
                        success: true,
                        rewards: rewards
                    };

                    res.status(200).json(resData);
                }
            } else {
                res.status(404).json({success: false, message: 'No hay más resultados'});
            }
        })
};