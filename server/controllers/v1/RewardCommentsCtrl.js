/**
 * Created by Mordekaiser on 02/05/17.
 */
'use strict';
const mongoose = require('mongoose'),
    Reward = mongoose.model('Reward'),
    jwtValidation = require('../../services/v1/jwtValidation');

exports.post = function (req, res) {
    let query = {
        _id: req.query.reward_id
    };
    const collaborator = {
        id: jwtValidation.getUserId(req.headers['x-access-token']),
        completeName: req.body.collaboratorName
    };
    let data = {
        $push: {comments: {
            collaborator: collaborator,
            comment: req.body.comment
        }}
    };

    Reward
        .findOneAndUpdate(query, data, {new: true})
        .exec(function (err, reward) {
            if(err)
                console.log('CommentsCtrl post. ' + err);
            if(reward) {
                res.status(201).json(reward.comments.sort(function (a, b) {
                    if(a.postedAt < b.postedAt)
                        return 1;
                    if(a.postedAt > b.postedAt)
                        return -1;
                    return 0;
                }));
                res.end();
            }
        })
};

exports.del = function (req, res) {
    let query = {};
    if(req.query.reward_id)
        query._id = req.query.reward_id;
    let data = {
        $pull: {comments: {_id: req.query.comment_id}}
    };

    Reward
        .findOneAndUpdate(query, data, {new: true}, function (err, reward) {
            if(err)
                console.log('RewardCommentsCtrl - del. ' + err);
            if(reward) {
                res.status(200).json(reward.comments);
                res.end();
            }
        })
};