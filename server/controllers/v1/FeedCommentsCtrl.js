/**
 * Created by Latin on 4/26/2017.
 */
'use strict';
const mongoose = require('mongoose'),
    Feed = mongoose.model('Feed'),
    jwtValidation = require('../../services/v1/jwtValidation'),
    Helpers = require('../../services/v1/Helpers'),
    MailgunEmail = require('../../services/v1/MailgunEmail'),
    notifications = require('../../services/v1/notifications');

exports.post = function (req, res) {
    console.log('FeedCommentsCtrl - POST');
    let query = {
        _id: req.query.feed_id
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

    Feed
        .findOneAndUpdate(query, data, {new: true})
        .exec(function (err, feed) {
            let resData = {
                success: true,
                comments: []
            };

            if(err)
                console.log('CommentsCtrl post. ' + err);
            if(feed) {
                resData.comments = feed.comments.sort(function (a, b) {
                    if(a.postedAt < b.postedAt)
                        return 1;
                    if(a.postedAt > b.postedAt)
                        return -1;
                    return 0;
                });
                res.status(201).json(resData);

                const commentData = {
                    collaborator: collaborator,
                    message: req.body.comment
                };

                Helpers.getUserByCompleteName(collaborator.completeName)
                    .then(sender => {
                        Helpers.getUsersEmailByName([feed.receiverName])
                            .then(emails => {
                                emails.forEach(function (email) {
                                    const html = "<p>" + sender.completeName + " de " + sender.location + " ha comentado un post relacionado contigo:</p>" +
                                        "<p>" + req.body.comment + "</p>" +
                                        "<p>¿Deseas contestarle o agradecerle? Entra a la sección de &quot;Mi actividad&quot; y ahi podrás ver tus nuevas interacciones con los demás y desde ahi mismo podrás contestarles por medio de comentarios o un &quot;me gusta&quot;.</p>";
                                    MailgunEmail.send(email, 'Tu actividad en Valora', html)
                                })
                            })
                    })
                    .catch(err => console.error(err));

                if(typeof req.body.mentionNames !== 'undefined' && req.body.mentionNames.length > 0) {
                    req.body.mentionNames.forEach(completeName => {
                        Helpers.getUserByCompleteName(completeName)
                            .then(user => {
                                if(typeof user !== 'undefined') {
                                    const customFeed = feed;
                                    customFeed.receiver_id = user._id;
                                    customFeed.sender_id = collaborator._id;
                                    commentData.type = 'tagged';

                                    notifications.newNotification(customFeed, commentData);
                                }
                            })
                            .catch(err => console.error(err));
                    })
                }

                notifications.newNotification(feed, commentData);

                Helpers.getUsersEmailByName(req.body.mentionNames)
                    .then(sendEmails)
                    .catch(err => console.error(err));

            } else {
                resData.success = false;
                resData.message = 'No se encontró información';
                res.status(404).json(resData);
            }
        });

    function sendEmails(emails) {
        emails.forEach(function (email) {
            MailgunEmail.send(email, 'Te han etiquetado en un comentario', "<p>" + req.body.comment + "</p>")
        })
    }
};

exports.del = function (req, res) {
    let query = {};
    if(req.query.feed_id)
        query._id = req.query.feed_id;
    let data = {
        $pull: {comments: {_id: req.query.comment_id}}
    };

    Feed
        .findOneAndUpdate(query, data, {new: true}, function (err, feed) {
            if(err)
                console.log('FeedCommentsCtrl - del. ' + err);
            if(feed) {
                res.status(200).json(feed.comments);
                res.end();
            }
        })
};