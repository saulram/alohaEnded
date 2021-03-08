'use strict';

const mongoose = require('mongoose'),
    Mention = mongoose.model('Mention'),
    moment = require('moment');

exports.post = (req, res) => {
    let data = {};
    if(req.body.description) {
        data.description = req.body.description;
    }

    if(typeof req.body.draft !== 'undefined') {
        data.draft = req.body.draft;
    }

    const mention = new Mention(data);
    mention.save(function(err, doc) {
        if(err) {
            res.status(500).json({ success: false });
            res.end();
        } else {
            res.status(201).json({ success: true });
            res.end();
        }
    });
};

exports.get = (req, res) => {
    let query = {};

    if(typeof req.query.type === 'undefined' || req.query.type !== 'admin') {
        query.draft = false;
    }

    Mention.find(query, (err, mentions) => {
        if(err) {
            console.log(err);
        }
        if(mentions.length > 0) {
            const customMentions = mentions.map(mention => {
                return {
                    description: mention.description,
                    draft: mention.draft,
                    updatedAt: moment(mention.updatedAt).locale('es').format('LL'),
                    _id: mention._id
                }
            });
            const responseData = {
                success: true,
                mentions: customMentions
            };

            res.status(200).json(responseData);
        } else {
            res.status(404).json({ success: false });
        }
    })
};

exports.getById = (req, res) => {
    Mention.findById(req.params._id, (err, mention) => {
        if (err) {
            console.error(err);
        }
        if(mention) {
            res.status(200).json({success: true, mention: mention});
        } else {
            res.status(404).json({success: false, message: 'No se encontró esa mención'});
        }
    })
};

exports.put = (req, res) => {
    let data = {};

    if(req.body.description) {
        data.description = req.body.description;
    }

    if(typeof req.body.draft !== 'undefined') {
        data.draft = req.body.draft;
    }

    if(typeof data.description !== 'undefined' || typeof data.description !== 'undefined') {
        data.updatedAt = new Date();
    }

    Mention
        .findByIdAndUpdate(req.params._id, {$set: data}, {new: true})
        .exec((err, mention) => {
            if(err) {
                console.error(err);
            }
            if (mention) {
                res.status(201).json({success: true});
            } else {
                res.status(200).json({success: false, message: 'No se pudo modificar la mención'});
            }
        })
};

exports.del = (req, res) => {
    Mention
        .remove({_id: req.params._id})
        .exec((err, mentionStatus) => {
            if(err) {
                console.error(err);
            } else {
                res.status(200).json({success: true, message: 'Mención borrada exitosamente'});
            }
        });
};