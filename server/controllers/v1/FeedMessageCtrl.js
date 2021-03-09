'use strict';
const mongoose = require('mongoose'),
    FeedMessage = mongoose.model('FeedMessage');

exports.post = (req, res) => {
    let data = {};
    if(req.body.message) {
        data.message = req.body.message;
    }

    if (req.body.type) {
        data.type = req.body.type;
    }

    const feedMessage = new FeedMessage(data);
    feedMessage.save((err, newFeedMessage) => {
        if(err) {
            console.error(err);
        }
        if (newFeedMessage) {
            res.status(200).json({success: true});
        } else {
            res.status(500).json({success: false, message: 'No se pudo crear el mensaje para el feed'});
        }
    })
};