/**
 * Created by Latin on 4/12/2017.
 */
'use strict';
const mongoose = require('mongoose'),
    Feed = mongoose.model('Feed'),
    _ = require('underscore'),
    Badge = mongoose.model('Badge'),
    User = mongoose.model('User'),
    jwtValidation = require('../../services/v1/jwtValidation'),
    moment = require('moment'),
    Notification = mongoose.model('Notification');

exports.get = function (req, res) {
    const collaborator_id = jwtValidation.getUserId(req.headers['x-access-token']);

    let notificationPromise = query => {
        return new Promise((resolve, reject) => {
            const projection = { createdAt: 1, feed_id: 1, content: 1, message: 1, isRead: 1, type: 1 };
            Notification
                .find(query, projection)
                .sort({ createdAt: -1 })
                .lean()
                .exec((err, notifications) => {
                    if(err) {
                        console.error(err);
                    }
                    if(notifications.length > 0) {

                        resolve(_.map(notifications, notification => {
                            const notificationData = {
                                feed_id: notification.feed_id,
                                content: notification.content,
                                message: notification.message,
                                isRead: notification.isRead,
                                _id: notification._id,
                                type: notification.type
                            };

                            const today = moment().format("DD-MM-YYYY");
                            const yesterday = moment().add(-1, 'day').format("DD-MM-YYYY");

                            if(today === moment(notification.createdAt).format("DD-MM-YYYY"))
                                notificationData.createdAt = "Hoy";
                            else if(yesterday === moment(notification.createdAt).format("DD-MM-YYYY"))
                                notificationData.createdAt = 'Ayer';
                            else {
                                const formatL = moment(notification.createdAt).locale('es').format('LL');
                                const n = formatL.lastIndexOf('de');
                                notificationData.createdAt = formatL.substring(n, 0);
                            }
                            return notificationData;
                        }));
                    } else {
                        reject('No notifications found');
                    }
                })
        })
    };

    function sendResponse(notifications) {
        let resData = {
            success: true,
            notifications: []
        };

        if(typeof notifications !== 'undefined') {
            resData.notifications = notifications;
            res.status(200).json(resData);
        } else {
            resData.message = 'No se encontráron notificaciones';
            resData.success = false;
            res.status(404).json(resData);
        }
    }

    let query = {
        $or: [{ isActive: true, receiver_id: collaborator_id }, { isActive: true, sender_id: collaborator_id }]
    };

    notificationPromise(query)
        .catch(err => console.error(err))
        .then(sendResponse);
};

/*exports.get = function (req, res) {
    const collaborator_id = jwtValidation.getUserId(req.headers['x-access-token']);
    let query = {
        $or: [{ isActive: true, receiver_id: collaborator_id }, { isActive: true, sender_id: collaborator_id }]
    };

    Q.all(getFeeds(query))
        .then(setCustomInfo)
        .then(setReceiverInfo)
        .then(setBadgeName)
        .then(customNewReward)
        .then(setSenderInfo)
        .done(function (customFeeds) {
            res.status(200).json(customFeeds);
            res.end();
        });

    function getFeeds(query) {
        let dfd = Q.defer();
        Feed.find(query)
            .limit(20)
            .sort({createdAt: -1})
            .exec(function (err, feeds) {
                let customFeeds = [];
                for(let i = 0; i < feeds.length; i++) {
                    let feedData = {};
                    const today = moment().format("DD-MM-YYYY");
                    const yesterday = moment().add(-1, 'day').format("DD-MM-YYYY");

                    if(today === moment(feeds[i].createdAt).format("DD-MM-YYYY"))
                        feedData.createdAt = "Hoy";
                    else if(yesterday === moment(feeds[i].createdAt).format("DD-MM-YYYY"))
                        feedData.createdAt = 'Ayer';
                    else {
                        const formatL = moment(feeds[i].createdAt).locale('es').format('LL');
                        const n = formatL.lastIndexOf('de');
                        feedData.createdAt = formatL.substring(n, 0);
                    }

                    feedData._id = feeds[i]._id;
                    feedData.count = feeds[i].likes.count;
                    if(feeds[i].sender_id)
                        feedData.sender_id = feeds[i].sender_id;
                    if(feeds[i].senderName)
                        feedData.senderName = feeds[i].senderName;
                    if(feeds[i].receiver_id)
                        feedData.receiver_id = feeds[i].receiver_id;
                    if(feeds[i].receiverName)
                        feedData.receiverName = feeds[i].receiverName;
                    if(feeds[i].badgeSlug)
                        feedData.badgeSlug = feeds[i].badgeSlug;
                    if(feeds[i].reward_id)
                        feedData.reward_id = feeds[i].reward_id;
                    if(feeds[i].rewardName)
                        feedData.rewardName = feeds[i].rewardName;
                    if(feeds[i].rewardImage)
                        feedData.rewardImage = feeds[i].rewardImage;
                    if(feeds[i].rewardPoints)
                        feedData.rewardPoints = feeds[i].rewardPoints;
                    if(feeds[i].earnedReason)
                        feedData.earnedReason = feeds[i].earnedReason;
                    if(feeds[i].earnedPoints)
                        feedData.earnedPoints = feeds[i].earnedPoints;
                    if(feeds[i].message)
                        feedData.message = feeds[i].message;
                    if(feeds[i].rewardExpiresAt)
                        feedData.rewardExpiresAt = feeds[i].rewardExpiresAt;

                    // set the like status if the user has done it before
                    const userIndex = feeds[i].likes.collaborator_id.indexOf(collaborator_id);
                    if(userIndex > -1)
                        feedData.likeStatus = 'active';

                    customFeeds.push(feedData);

                    if(i === feeds.length - 1)
                        dfd.resolve(customFeeds);
                }
            });

        return dfd.promise;
    }

    function setCustomInfo(customFeeds) {
        let dfd = Q.defer();
        let earnedRewarded = customFeeds.map(function (feed) {
            let data = feed;
            if(feed.receiver_id && (feed.rewardName || feed.earnedReason)) {
                if(feed.earnedReason === "Desempeño" && !feed.badgeSlug) {
                    data.receiverName = feed.receiverName.toLowerCase();
                    data.badgeImage = "/assets/images/gp-desempeno.png";
                    data.type = 'imports';
                }
                else if(feed.earnedReason === "upgrade" && !feed.badgeSlug) {
                    data.receiverName = feed.receiverName.toLowerCase();
                    data.message = feed.message;
                    data.type = 'imports';
                    if(feed.message === 'bronce' || feed.message === 'BRONCE')
                        data.badgeImage = "/assets/images/upgrade-bronce.png";
                    else if(feed.message === 'plata' || feed.message === 'PLATA')
                        data.badgeImage = "/assets/images/upgrade-plata.png";
                    else if(feed.message === 'oro' || feed.message === 'ORO')
                        data.badgeImage = "/assets/images/upgrade-oro.png";
                    else if(feed.message === 'diamante' || feed.message === 'DIAMANTE')
                        data.badgeImage = "/assets/images/upgrade-diamante.png";
                }
                else if(feed.receiver_id && feed.rewardImage && !feed.badgeSlug) {
                    data.type = 'rewardRedeemed';
                    data.rewardImage = '/assets/images/rewards/' + feed.rewardImage;
                }
                else if(feed.earnedReason === "seniority" && !feed.badgeSlug) {
                    data.receiverName = feed.receiverName.toLowerCase();
                    data.type = 'imports';
                }
                return data;

            } else {
                return feed;
            }
        });

        dfd.resolve(earnedRewarded);

        return dfd.promise;
    }

    function setReceiverInfo(customFeeds) {
        let dfd = Q.defer();

        for(let i = 0; i < customFeeds.length; i++) {
            User.findOne({_id: customFeeds[i].receiver_id}, function (err, user) {
                if(err)
                    console.log(err);
                if(user) {
                    let data = customFeeds[i];
                    data.receiverName = user.completeName;
                    if(user.location === 'MEXICO')
                        data.receiverLocation = 'POLANCO';
                    else
                        data.receiverLocation = user.location;

                    if(customFeeds[i].earnedReason === "seniority" && !customFeeds[i].badgeSlug) {
                        data.seniority = user.seniority;
                        if(user.seniority !== 1)
                            data.badgeImage = "/assets/images/ico_" + user.seniority + '.png';
                        else
                            data.badgeImage = "/assets/images/logo-valora-icono.png";
                    }

                    customFeeds[i] = Object.assign(customFeeds[i], data);
                }
                if(i === customFeeds.length - 1)
                    dfd.resolve(customFeeds);
            })
        }

        return dfd.promise;
    }

    function setBadgeName(customFeeds) {
        let dfd = Q.defer();

        for(let i = 0; i < customFeeds.length; i++) {
            Badge.findOne({slug: customFeeds[i].badgeSlug}, function (badgeErr, badge) {
                if (badgeErr)
                    console.log(badgeErr);
                if (badge) {
                    let data = customFeeds[i];

                    if (typeof customFeeds[i].message !== 'undefined') {
                        if(customFeeds[i].message  === 'ambassador')
                            data.type = "ambassador";
                    } else
                        data.type = "badgeAcknowledge";

                    data.badgeName = badge.name;
                    data.badgeImage = "/assets/images/badges/" + badge.image;

                    customFeeds[i] = Object.assign(customFeeds[i], data);
                }

                if(i === customFeeds.length - 1)
                    dfd.resolve(customFeeds);
            });
        }

        return dfd.promise;
    }

    function customNewReward(customFeeds) {
        let dfd = Q.defer();

        let newCustomizedReward = customFeeds.map(function (feed) {
            if(feed.reward_id && !feed.receiver_id) {
                let data = feed;

                data.type = 'rewardCreated';
                if(feed.rewardExpiresAt)
                    data.rewardExpiresAt = moment(feed.rewardExpiresAt).locale('es').format('LL');
                data.rewardImage = "/assets/images/rewards/" + feed.rewardImage;

                return data;
            } else
                return feed;
        });

        dfd.resolve(newCustomizedReward);

        return dfd.promise;
    }

    function setSenderInfo(customFeeds) {
        let dfd = Q.defer();

        for(let i = 0; i < customFeeds.length; i++) {
            User.findOne({_id: customFeeds[i].sender_id}, function (err, user) {
                if(err)
                    console.log(err);
                if(user) {
                    let data = customFeeds[i];
                    data.senderName = user.completeName;
                    if(user.location === 'MEXICO')
                        data.senderLocation = 'POLANCO';
                    else
                        data.senderLocation = user.location;

                    customFeeds[i] = Object.assign(customFeeds[i], data);
                }
                if(i === customFeeds.length - 1)
                    dfd.resolve(customFeeds);
            })
        }

        return dfd.promise;
    }
};*/