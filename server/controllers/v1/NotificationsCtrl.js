'use strict';

const mongoose = require('mongoose'),
    Notification = mongoose.model('Notification');

exports.put = (req, res) => {
    const query = {};
    if(req.params._id) {
        query._id = req.params._id;
    }

    Notification
        .findOneAndUpdate(query, { $set: { isRead: true } })
        .lean()
        .exec((err, notification) => {
            if(err) {
                console.error(err);
            }
        })
};