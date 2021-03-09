/**
 * Created by Mordekaiser on 10/11/16.
 */
"use strict";
const mongoose = require('mongoose'),
    Feed = mongoose.model('Feed'),
    Reward = mongoose.model('Reward'),
    moment = require('moment'),
    Badge = mongoose.model('Badge'),
    User = mongoose.model('User'),
    jwtValidation = require('../../services/v1/jwtValidation'),
    json2csv = require('json2csv'),
    helpers = require('../../services/v1/Helpers'),
    mailgunEmail = require('../../services/v1/MailgunEmail'),
    Q = require('q'),
    notificationService = require('../../services/v1/notifications');

/**
 * Creates a feed document when a collaborator acknowledgments some else
 * @param badgeId
 * @param message
 * @param receiver_id
 * @param receiverName
 * @param sender_id
 * @param senderName
 * @param senderMessage
 * @param type
 * @param receiverLocation
 * @param senderLocation
 * @return {Promise<any>}
 */
exports.createBadgeAcknowledgment = (badgeId, message, receiver_id, receiverName, sender_id, senderName, senderMessage, type, receiverLocation, senderLocation) => {
    return new Promise(resolve => {
        let data = {
            type: type
        };

        if(badgeId) {
            data.badgeId = badgeId;
            if(message === 'ambassador') {
                data.receiver_id = receiver_id;
                data.receiverName = receiverName;
                data.message = 'ambassador';
                data.receiverLocation = receiverLocation;
            } else {
                data.receiver_id = receiver_id;
                data.receiverName = receiverName;
                data.receiverLocation = receiverLocation;
                if(sender_id) {
                    data.sender_id = sender_id;
                }
                data.senderName = senderName;
                data.senderLocation = senderLocation;
                if(typeof senderMessage !== 'undefined') {
                    data.senderMessage = senderMessage;
                }
            }

            createFeedPromise(data)
                .then((success) => {
                    resolve(!!(typeof success !== 'undefined' && success));
                })
                .catch(err => console.error(err))
        }
    });
};

exports.createFeed = function (sender_id, senderName, receiver_id, receiverName, badgeSlug, reward, earnedReason, earnedPoints, message, type, receiverLocation) {
    // create a feed for new reward added
    let data = {
        type: type
    };
    if(reward) {
        if(reward.reward_id)
            data.reward_id = reward.reward_id;
        if(reward._id)
            data.reward_id = reward._id;
        if(reward.rewardName)
            data.rewardName = reward.rewardName;
        if(reward.name)
            data.rewardName = reward.name;
        if(reward.description)
            data.message = reward.description;
        if(receiver_id)
            data.receiver_id = receiver_id;
        if(receiverName)
            data.receiverName = receiverName;
        if(reward.rewardImage)
            data.rewardImage = reward.rewardImage.substring(reward.rewardImage.lastIndexOf("/") + 1);
        if(reward.image)
            data.rewardImage = reward.image;
        if(reward.points)
            data.rewardPoints = reward.points;
        if(reward.expiresAt)
            data.rewardExpiresAt = reward.expiresAt;
        if(receiverLocation) {
            data.receiverLocation = receiverLocation;
        }

        createFeed(data);
    }

    // create a feed for badge acknowledgment
    if(badgeSlug) {
        data.badgeSlug = badgeSlug;
        if(message === 'ambassador') {
            data.receiver_id = receiver_id;
            data.receiverName = receiverName;
            data.message = 'ambassador';
        } else {
            data.receiver_id = receiver_id;
            data.receiverLocation = receiverLocation;
            data.receiverName = receiverName;
            if(sender_id) {
                data.sender_id = sender_id;
            }
            data.senderName = senderName;
        }

        createFeed(data);
    }

    if(earnedReason) {
        if(earnedReason === 'performance') {
            data.receiver_id = receiver_id;
            data.receiverName = receiverName;
            data.earnedPoints = earnedPoints;
            data.earnedReason = 'Desempeño';
        }
        if(earnedReason === "upgrade") {
            data.receiverName = receiverName;
            data.receiver_id = receiver_id;
            data.earnedReason = earnedReason;
            data.earnedPoints = earnedPoints;
            data.message = message;
        }
        createFeed(data);
    }
};

let createFeedPromise = data => {
    return new Promise((resolve, reject) => {
        const feed = new Feed(data);
        feed.save(function(err, doc) {
            if(err) {
                console.error('FeedsCtrl Create feed. ' + err);
                reject(err);
            }
            if(doc) {
                notificationService.newNotification(doc);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    })
};

function createFeed(data) {
    console.log(data);
    const feed = new Feed(data);
    feed.save(function(err, doc) {
        if(err) {
            console.log('FeedsCtrl Create feed. ' + err);
        }
        if(doc) {
            notificationService.newNotification(doc);
        }
    });
}

exports.get = function (req, res) {
    console.log('GET Feed');
    const collaborator_id = jwtValidation.getUserId(req.headers['x-access-token']);

    let feedPromise = query => {
        return new Promise((resolve, reject) => {
            Feed
                .find(query)
                .limit(20)
                .sort({createdAt: -1})
                .lean()
                .exec((err, feeds) => {
                    if(err) {
                        console.error(err);
                    }
                    if(feeds.length > 0) {
                        resolve(feeds);
                    } else {
                        reject('No feeds found');
                    }
                })
        })
    };

    /**
     * Iterates the feed to generate a custom feed
     * @param feeds
     * @return {Promise<any>}
     */
    let customFeedPromise = feeds => {
        return new Promise((resolve, reject) => {
            if(typeof feeds !== 'undefined') {
                let feedsPromise = [];

                feeds.forEach(feed => feedsPromise.push(customFeed(feed)));

                Promise
                    .all(feedsPromise)
                    .catch(err => console.error('Incomplete feeds. ' + err))
                    .then(data => resolve(data));
            } else {
                reject('No feeds provided');
            }
        })
    };

    /**
     * Create a new object based on the feed data
     * @param feed
     * @return {Promise<any>}
     */
    function customFeed(feed) {
        return new Promise(resolve => {
            let customFeedData = {};
            const today = moment().format("DD-MM-YYYY");
            const yesterday = moment().add(-1, 'day').format("DD-MM-YYYY");

            if(today === moment(feed.createdAt).format("DD-MM-YYYY"))
                customFeedData.createdAt = "Hoy";
            else if(yesterday === moment(feed.createdAt).format("DD-MM-YYYY"))
                customFeedData.createdAt = 'Ayer';
            else {
                const formatL = moment.utc(feed.createdAt).locale('es').format('LL');
                const n = formatL.lastIndexOf('de');
                customFeedData.createdAt = formatL.substring(n, 0);
            }

            customFeedData._id = feed._id;
            customFeedData.count = feed.likes.count;
            if(typeof feed.sender_id !== 'undefined') {
                customFeedData.sender_id = feed.sender_id;
            }
            if(typeof feed.senderName !== 'undefined') {
                customFeedData.senderName = feed.senderName.toLowerCase();
            }
            if(typeof feed.receiver_id !== 'undefined') {
                customFeedData.receiver_id = feed.receiver_id;
            }
            if(typeof feed.receiverName !== 'undefined') {
                customFeedData.receiverName = feed.receiverName.toLowerCase();
            }
            if(typeof feed.badgeSlug !== 'undefined') {
                customFeedData.badgeSlug = feed.badgeSlug;
            }
            if(typeof feed.reward_id !== 'undefined') {
                customFeedData.reward_id = feed.reward_id;
            }
            if(typeof feed.rewardName !== 'undefined') {
                customFeedData.rewardName = feed.rewardName;
            }
            if(typeof feed.rewardImage !== 'undefined') {
                customFeedData.rewardImage = feed.rewardImage;
            }
            if(typeof feed.rewardPoints !== 'undefined') {
                customFeedData.rewardPoints = feed.rewardPoints;
            }
            if(typeof feed.earnedReason !== 'undefined') {
                customFeedData.earnedReason = feed.earnedReason;
            }
            if(typeof feed.earnedPoints !== 'undefined') {
                customFeedData.earnedPoints = feed.earnedPoints;
            }
            if(typeof feed.message !== 'undefined') {
                customFeedData.message = feed.message;
            }
            if(typeof feed.rewardExpiresAt !== 'undefined') {
                customFeedData.rewardExpiresAt = moment.utc(feed.rewardExpiresAt).locale('es').format('LL');
            }
            if(typeof feed.comments !== 'undefined') {
                customFeedData.comments = feed.comments.sort(function (a, b) {
                    if(a.postedAt < b.postedAt)
                        return 1;
                    if(a.postedAt > b.postedAt)
                        return -1;
                    return 0;
                });
            }
            if(typeof feed.senderMessage !== 'undefined') {
                customFeedData.senderMessage = feed.senderMessage;
            }

            // set the like status if the user has done it before
            const userIndex = feed.likes.collaborator_id.indexOf(collaborator_id);
            if(userIndex > -1) {
                customFeedData.likeStatus = 'active';
            }

            if(customFeedData.receiver_id && (customFeedData.rewardName || customFeedData.earnedReason)) {
                if(customFeedData.earnedReason === "Desempeño" && !customFeedData.badgeSlug) {
                    //customFeedData.receiverName = feed.receiverName.toLowerCase();
                    customFeedData.badgeImage = "/assets/images/gp-desempeno.png";
                    customFeedData.type = 'imports';
                }
                else if(customFeedData.earnedReason === "upgrade" && !customFeedData.badgeSlug) {
                    //customFeedData.receiverName = feed.receiverName.toLowerCase();
                    customFeedData.message = feed.message;
                    customFeedData.type = 'imports';
                    if(feed.message === 'bronce' || feed.message === 'BRONCE' || feed.message === 'Bronce')
                        customFeedData.badgeImage = "/assets/images/upgrade-bronce.png";
                    else if(feed.message === 'plata' || feed.message === 'PLATA' || feed.message === 'Plata')
                        customFeedData.badgeImage = "/assets/images/upgrade-plata.png";
                    else if(feed.message === 'oro' || feed.message === 'ORO' || feed.message === 'Oro')
                        customFeedData.badgeImage = "/assets/images/upgrade-oro.png";
                    else if(feed.message === 'diamante' || feed.message === 'DIAMANTE' || feed.message === 'Diamante')
                        customFeedData.badgeImage = "/assets/images/upgrade-diamante.png";
                }
                else if(customFeedData.receiver_id && customFeedData.rewardImage && !customFeedData.badgeSlug) {
                    customFeedData.type = 'rewardRedeemed';
                    customFeedData.rewardImage = '/assets/images/rewards/' + feed.rewardImage;
                }
                else if(customFeedData.earnedReason === "seniority" && !customFeedData.badgeSlug) {
                    //customFeedData.receiverName = feed.receiverName.toLowerCase();
                    customFeedData.type = 'imports';
                }
            }

            if(customFeedData.reward_id && !customFeedData.receiver_id) {
                customFeedData.type = 'rewardCreated';
                customFeedData.rewardImage = "/assets/images/rewards/" + feed.rewardImage;
            }

            resolve(customFeedData);
        })
    }

    let receiverPromise = feeds => {
        return new Promise((resolve, reject) => {
            if(typeof feeds !== 'undefined') {
                let usersPromise = [];

                feeds.forEach(feed => usersPromise.push(getUser(feed)));

                Promise.all(usersPromise).then(data => resolve(data));
            } else {
                reject('No custom feeds provided');
            }
        })
    };

    function getUser(customFeed) {
        return new Promise(resolve => {
            let userQuery = { _id: customFeed.receiver_id };
            User
                .findOne(userQuery)
                .lean()
                .exec((err, user) => {
                    if(err)
                        console.error(err);
                    if(user) {
                        let data = customFeed;
                        data.receiverName = user.completeName.toLowerCase();
                        if(user.location === 'MEXICO') {
                            data.location = 'POLANCO';
                        }
                        else {
                            data.location = user.location;
                        }

                        if(customFeed.earnedReason === "seniority" && !customFeed.badgeSlug) {
                            data.seniority = user.seniority;
                            if(user.seniority !== 1)
                                data.badgeImage = "/assets/images/ico_" + user.seniority + '.png';
                            else
                                data.badgeImage = "/assets/images/aloha/aloha-a.png";
                        }

                        customFeed = Object.assign(customFeed, data);
                        resolve(customFeed);
                    } else {
                        resolve(customFeed);
                    }
                })
        })
    }

    let badgePromise = customFeeds => {
        return new Promise((resolve, reject) => {
            if(typeof customFeeds !== 'undefined') {
                let badgePromise = [];

                customFeeds.forEach(feed => badgePromise.push(getBadge(feed)));

                Promise
                    .all(badgePromise)
                    .then(data => resolve(data));
            } else {
                reject('No custom feeds provided for badge data');
            }
        })
    };

    function getBadge(customFeed) {
        return new Promise(resolve => {
            if(typeof customFeed.badgeSlug !== 'undefined') {
                const badgeQuery = { slug: customFeed.badgeSlug };
                Badge
                    .findOne(badgeQuery)
                    .lean()
                    .exec((err, badge) => {
                        if (err) {
                            console.error(err);
                            resolve(customFeed);
                        }
                        if (badge) {
                            let data = customFeed;

                            if (typeof customFeed.message !== 'undefined') {
                                if(customFeed.message  === 'ambassador') {
                                    data.type = "ambassador";
                                }
                            } else {
                                data.type = "badgeAcknowledge";
                            }

                            data.badgeName = badge.name;
                            data.badgeImage = "/assets/images/badges/" + badge.image;

                            customFeed = Object.assign(customFeed, data);
                            resolve(customFeed);
                        } else {
                            resolve(customFeed);
                        }
                    })
            } else {
                resolve(customFeed);
            }
        })
    }

    let senderPromise = customFeeds => {
        return new Promise(resolve => {
            if(typeof customFeeds !== 'undefined') {
                let usersPromise = [];
                customFeeds.forEach(feed => usersPromise.push(getReceiver(feed)));

                Promise.all(usersPromise).then(data => resolve(data));
            } else {
                reject('No custom feeds provided for get sender data');
            }
        })
    };

    function getReceiver(customFeed) {
        return new Promise(resolve => {
            if(typeof customFeed.sender_id !== 'undefined') {
                const userQuery = { _id: customFeed.sender_id };
                User
                    .findOne(userQuery)
                    .lean()
                    .exec((err, user) => {
                        if(err) {
                            console.error(err);
                            resolve(customFeed);
                        }
                        if(user) {
                            let data = customFeed;
                            data.senderName = user.completeName.toLowerCase();
                            if(user.location === 'MEXICO') {
                                data.senderlocation = 'POLANCO';
                            }
                            else {
                                data.senderlocation = user.location;
                            }

                            customFeed = Object.assign(customFeed, data);

                            resolve(customFeed);
                        } else {
                            resolve(customFeed);
                        }
                    })
            } else {
                resolve(customFeed);
            }
        })
    }

    function sendResponse(feeds) {
        console.log('sendResponse');
        let resData = {
            success: true,
            feeds: []
        };

        if(typeof feeds !== 'undefined') {
            resData.feeds = feeds;
            res.status(200).json(resData);
        } else {
            resData.message = 'No se encontró información';
            resData.success = false;
            res.status(404).json(resData)
        }
    }

    let query = {
        isActive: true
    };

    if(req.query.type === 'byId') {
        query.receiver_id = collaborator_id;
    }
    if(req.query._id) {
        query._id = {$lt: req.query._id};
    }
    if(req.query.type === 'byFeedId') {
        query._id = req.query._id;
    }

    feedPromise(query)
        .then(customFeedPromise)
        .then(receiverPromise)
        .then(badgePromise)
        .then(senderPromise)
        .catch(err => console.error(err))
        .then(sendResponse);
};

exports.putFeedLike = function (req, res) {
    const data = {
        collaborator_id: jwtValidation.getUserId(req.headers['x-access-token'])
    };
    const query = {
        likes: {$nin: [data.collaborator_id]}
    };

    if(req.query.feed_id)
        query._id = req.query.feed_id;

    Feed.findOneAndUpdate(query, {$addToSet: {"likes.collaborator_id": data.collaborator_id}, $inc: {"likes.count": 1}}, {new: true}, function (err, updatedFeed) {
        if(err)
            console.log('Error at adding like to feed. ' + err);
        if(updatedFeed) {
            updatedFeed.likeSender_id = data.collaborator_id;
            res.status(201).json({success: true});

            helpers.getUserById(data.collaborator_id)
                .then(user => {
                    if(typeof user !== 'undefined') {
                        const customFeed = updatedFeed;

                        customFeed.sender_id = user._id;
                        customFeed.receiverName = user.completeName;
                        customFeed.type = 'like';

                        notificationService.newNotification(customFeed);
                    }
                })
                .catch(err => console.error(err));

            Q.all(validateNotification(updatedFeed), onRejection)
                .then(searchLikeSender, onRejection)
                .then(searchBadgeName, onRejection)
                .fail(function (error) {
                    console.log('Promise fail. ' + error);
                })
                .done(function (emailData) {
                    if(emailData) {
                     //   //sendEmailNotification(emailData);
                    }
                });
        }
        else {
            res.status(400);
            res.end();
        }
    });

    function onRejection(reason) {
        console.log('Put like promise rejected, reason: ' + reason);
    }

    function validateNotification(feed) {
        let dfd = Q.defer();
        if(feed && (feed.receiver_id !== feed.likeSender_id)) {
            helpers.validateNotifications(feed.receiver_id, function (userData) {
                if(!!userData) {
                    if(!!userData.notifications.feedLike) {
                        let data = {
                            email: userData.email,
                            likeSender_id: feed.likeSender_id
                        };
                        if(feed.badgeSlug)
                            data.badgeSlug = feed.badgeSlug;
                        if(feed.earnedReason)
                            data.earnedReason = feed.earnedReason;
                        if(feed.rewardName)
                            data.earnedReason = 'reward';
                        if(feed.message === 'ambassador')
                            data.earnedReason = 'ambassador';
                        if(feed.message !== 'ambassdor' && feed.badgeSlug)
                            data.earnedReason = 'badge';

                        dfd.resolve(data);
                    } else
                        dfd.reject('Collaborator like notifications disabled');
                } else
                    dfd.reject('No collaborator email found.');
            });
        } else
            dfd.reject('Collaborator likes its post');

        return dfd.promise;
    }

    function searchLikeSender(data) {
        let dfd = Q.defer();
        if(data.likeSender_id) {
            User.findOne({_id: data.likeSender_id}, function (err, userLikeSender) {
                if(err)
                    console.log('Error at finding user. ' + err);
                if(userLikeSender) {
                    let info = data;
                    info.likeSenderName = userLikeSender.completeName;
                    dfd.resolve(info);
                }
                else
                    dfd.reject('Like sender not found.');
            });
        } else
            dfd.reject('Rejected before');

        return dfd.promise;
    }

    function searchBadgeName(data) {
        let dfd = Q.defer();
        if(data && data.badgeSlug) {
            Badge.findOne({slug: data.badgeSlug}, function (err, badge) {
                if(err)
                    console.log('Error at finding badge slug. ' + err);
                if(badge) {
                    let info = data;
                    info.badgeName = badge.name;
                    dfd.resolve(info);
                } else
                    dfd.reject('Badge slug not found.');
            });
        } else
            dfd.resolve(data);

        return dfd.promise;
    }

    function //sendEmailNotification(emailData) {
        let html = "<p>Has recibido un &quot;me gusta&quot; en un post relacionado contigo:</p>" +
            "<p>A " + emailData.likeSenderName + " le gusta tu actividad.</p>" +
            "<p>¿Deseas contestarle o agradecerle? Entra a la sección de &quot;Mi actividad&quot; y ahi podrás ver tus nuevas interacciones con los demás y desde ahi mismo podrás contestarles por medio de comentarios o un &quot;me gusta&quot;.</p>";

        mailgunEmail.send(emailData.email, 'Tu actividad en Valora', html);
    }
};

exports.deleteFeedLike = function (req, res) {
    var data = {
        collaborator_id: jwtValidation.getUserId(req.headers['x-access-token'])
    };
    var query = {};

    if(req.query.feed_id)
        query._id = req.query.feed_id;

    Feed.update(query, {$pull: {"likes.collaborator_id": {$in: [data.collaborator_id]}}, $inc: {"likes.count": -1}}, function (err) {
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
};

exports.adminGet = function (req, res) {
    let query = {
        isActive: true
    };
    if(req.query.lastId)
        query._id = {$lt: req.query.lastId};

    Feed.find(query)
        .sort({createdAt: -1})
        .limit(100)
        .exec(function (err, feeds) {
            if(err)
                console.log('FeedsCtrl - get. ' + err);
            if(feeds) {
                const feedsEdited = feeds.map(function (feed) {
                    return {
                        createdAt: moment(feed.createdAt).format('YYYY-MM-DD'),
                        _id: feed._id,
                        badgeSlug: feed.badgeSlug,
                        receiver_id: feed.receiver_id,
                        receiverName: feed.receiverName,
                        sender_id: feed.sender_id,
                        senderName: feed.senderName,
                        earnedReason: feed.earnedReason,
                        type: feed.type,
                        rewardName: feed.rewardName,
                        comments: feed.comments
                    };
                });
                //console.log(feedsEdited);
                res.status(200).json(feedsEdited);
                res.end();
            } else {
                res.status(400);
                res.end();
            }
        })
};

exports.adminDelete = function (req, res) {
    let query = {
        _id: req.query._id
    };

    Feed
        .update(query, {$set: {isActive: false}})
        .exec(function (err, result) {
            if(err)
                console.log('FeedsCtrl adminDelete. ' + err);
            if(result) {
                res.status(200).json({success: true});
                res.end();
            }
            else {
                res.status(400).json({success: false});
                res.end();
            }
        })
};

exports.getLikes = (req, res) => {
    // console.log('GET feeds likes');
    const fields = ['type', 'createdAt', 'receiverName', 'senderName', 'likes'];
    let rows = [];
    let resData = {
        success: false,
        feeds: []
    };

    if(typeof req.query.dateFrom !== 'undefined' && typeof req.query.dateTo !== 'undefined') {
        let feedsPromise = query => {
            return new Promise((resolve, reject) => {
                Feed
                    .find(query)
                    .sort({createdAt: -1})
                    .lean()
                    .exec((err, feeds) => {
                        if(err) {
                            console.error(err);
                        }
                        if(feeds.length > 0) {
                            resolve(feeds);
                        } else {
                            reject('Data not found');
                        }
                    })
            })
        };

        let customizeDataPromise = feeds => {
            return new Promise((resolve, reject) => {
                if (typeof feeds !== 'undefined') {
                    let feedPromises = [];

                    feeds.forEach(feed => {
                        feedPromises.push(customizeData(feed));
                    });

                    Promise.all(feedPromises).then(customFeeds => {
                        rows = customFeeds;
                        resolve(customFeeds);
                    })
                } else {
                    reject('No accounts received');
                }
            })
        };

        const dateFrom = new Date(req.query.dateFrom.split('T')[0]);
        const dateTo = new Date(req.query.dateTo.split('T')[0] + 'T23:59:59.999Z');
        let query = {
            isActive: true,
            "likes.count": { $gt: 0 },
            createdAt: { $gte: dateFrom, $lt: dateTo }
        };

        feedsPromise(query)
            .then(customizeDataPromise)
            .catch(err => console.error(err))
            .then(sendResponse)

    } else {
        resData.message = 'Proporciona un rango de fechas';
        res.status(500).json(resData);
    }

    function customizeData(feed) {
        return new Promise(resolve => {
            let customFeed = {
                receiverName: feed.receiverName,
                senderName: feed.senderName,
                likes: feed.likes.count,
                createdAt: moment.utc(feed.createdAt).locale('es').format('LL')
            };

            switch (feed.type) {
                case 'GP badge':
                    customFeed.type = 'Insignia GP';
                    customFeed.senderName = 'administrator';
                    break;
                case 'badge':
                    customFeed.type = 'Insignia';
                    break;
                case 'seniority':
                    customFeed.type = 'Antigüedad';
                    customFeed.senderName = '-';
                    break;
                case 'ambassador':
                    customFeed.type = 'Embajador';
                    customFeed.senderName = '-';
                    break;
                case 'upgrade':
                    customFeed.type = 'Upgrade';
                    customFeed.senderName = '-';
                    break;
                case 'Reward exchanged':
                    customFeed.type = 'Recompensa canjeada';
                    customFeed.senderName = '-';
                    break;
                case 'New reward':
                    customFeed.type = 'Nueva recompensa';
                    customFeed.senderName = '-';
                    break;
            }

            resolve(customFeed);
        })
    }

    function sendResponse(feeds) {
        if(typeof feeds !== 'undefined') {
            if(req.query.type === 'csv') {
                try {
                    json2csv({ data: rows, fields: fields }, function(err, csv) {
                        if (err) {
                            console.error(err);
                        }
                        res.set('Content-Type', 'text/csv;charset=utf-8;');
                        res.send(new Buffer(csv));
                    });
                } catch (err) {
                    console.error(err);
                }
            } else {
                resData.success = true;
                resData.feeds = feeds;
                res.status(200).json(resData);
            }
        } else {
            resData.message = 'No se encontró información';
            res.status(404).json(resData);
        }
    }
};

exports.getById = (req, res) => {
    const collaborator_id = jwtValidation.getUserId(req.headers['x-access-token']);
    let feedPromise = query => {
        return new Promise((resolve, reject) => {
            const projection = { createdAt: 1, type: 1, badgeSlug: 1, receiver_id: 1, receiverName:1, receiverLocation: 1,
                sender_id: 1, senderName: 1, senderLocation: 1, senderMessage: 1, comments: 1, likes: 1, earnedReason: 1,
                earnedPoints: 1, reward_id: 1, rewardName: 1, rewardImage: 1, rewardPoints: 1 };
            Feed
                .findOne(query, projection)
                .lean()
                .exec((err, feed) => {
                    if(err) {
                        console.error(err);
                    }
                    if(feed) {
                        let customFeedData = {};
                        const today = moment().format("DD-MM-YYYY");
                        const yesterday = moment().add(-1, 'day').format("DD-MM-YYYY");

                        if(today === moment(feed.createdAt).format("DD-MM-YYYY"))
                            customFeedData.createdAt = "Hoy";
                        else if(yesterday === moment(feed.createdAt).format("DD-MM-YYYY"))
                            customFeedData.createdAt = 'Ayer';
                        else {
                            const formatL = moment.utc(feed.createdAt).locale('es').format('LL');
                            const n = formatL.lastIndexOf('de');
                            customFeedData.createdAt = formatL.substring(n, 0);
                        }

                        customFeedData._id = feed._id;
                        customFeedData.count = feed.likes.count;
                        if(typeof feed.sender_id !== 'undefined') {
                            customFeedData.sender_id = feed.sender_id;
                        }
                        if(typeof feed.senderName !== 'undefined') {
                            customFeedData.senderName = feed.senderName.toLowerCase();
                        }
                        if(typeof feed.receiver_id !== 'undefined') {
                            customFeedData.receiver_id = feed.receiver_id;
                        }
                        if(typeof feed.receiverName !== 'undefined') {
                            customFeedData.receiverName = feed.receiverName.toLowerCase();
                        }
                        if(typeof feed.badgeSlug !== 'undefined') {
                            customFeedData.badgeSlug = feed.badgeSlug;
                        }
                        if(typeof feed.reward_id !== 'undefined') {
                            customFeedData.reward_id = feed.reward_id;
                        }
                        if(typeof feed.rewardName !== 'undefined') {
                            customFeedData.rewardName = feed.rewardName;
                        }
                        if(typeof feed.rewardImage !== 'undefined') {
                            customFeedData.rewardImage = feed.rewardImage;
                        }
                        if(typeof feed.rewardPoints !== 'undefined') {
                            customFeedData.rewardPoints = feed.rewardPoints;
                        }
                        if(typeof feed.earnedReason !== 'undefined') {
                            customFeedData.earnedReason = feed.earnedReason;
                        }
                        if(typeof feed.earnedPoints !== 'undefined') {
                            customFeedData.earnedPoints = feed.earnedPoints;
                        }
                        if(typeof feed.message !== 'undefined') {
                            customFeedData.message = feed.message;
                        }
                        if(typeof feed.rewardExpiresAt !== 'undefined') {
                            customFeedData.rewardExpiresAt = moment.utc(feed.rewardExpiresAt).locale('es').format('LL');
                        }
                        if(typeof feed.comments !== 'undefined') {
                            customFeedData.comments = feed.comments.sort(function (a, b) {
                                if(a.postedAt < b.postedAt)
                                    return 1;
                                if(a.postedAt > b.postedAt)
                                    return -1;
                                return 0;
                            });
                        }
                        if(typeof feed.senderMessage !== 'undefined') {
                            customFeedData.senderMessage = feed.senderMessage;
                        }

                        // set the like status if the user has done it before
                        const userIndex = feed.likes.collaborator_id.indexOf(collaborator_id);
                        if(userIndex > -1) {
                            customFeedData.likeStatus = 'active';
                        }

                        if(customFeedData.receiver_id && (customFeedData.rewardName || customFeedData.earnedReason)) {
                            if(customFeedData.earnedReason === "Desempeño" && !customFeedData.badgeSlug) {
                                //customFeedData.receiverName = feed.receiverName.toLowerCase();
                                customFeedData.badgeImage = "/assets/images/gp-desempeno.png";
                                customFeedData.type = 'imports';
                            }
                            else if(customFeedData.earnedReason === "upgrade" && !customFeedData.badgeSlug) {
                                //customFeedData.receiverName = feed.receiverName.toLowerCase();
                                customFeedData.message = feed.message;
                                customFeedData.type = 'imports';
                                if(feed.message === 'bronce' || feed.message === 'BRONCE' || feed.message === 'Bronce')
                                    customFeedData.badgeImage = "/assets/images/upgrade-bronce.png";
                                else if(feed.message === 'plata' || feed.message === 'PLATA' || feed.message === 'Plata')
                                    customFeedData.badgeImage = "/assets/images/upgrade-plata.png";
                                else if(feed.message === 'oro' || feed.message === 'ORO' || feed.message === 'Oro')
                                    customFeedData.badgeImage = "/assets/images/upgrade-oro.png";
                                else if(feed.message === 'diamante' || feed.message === 'DIAMANTE' || feed.message === 'Diamante')
                                    customFeedData.badgeImage = "/assets/images/upgrade-diamante.png";
                            }
                            else if(customFeedData.receiver_id && customFeedData.rewardImage && !customFeedData.badgeSlug) {
                                customFeedData.type = 'rewardRedeemed';
                                customFeedData.rewardImage = '/assets/images/rewards/' + feed.rewardImage;
                            }
                            else if(customFeedData.earnedReason === "seniority" && !customFeedData.badgeSlug) {
                                //customFeedData.receiverName = feed.receiverName.toLowerCase();
                                customFeedData.type = 'imports';
                            }
                        }

                        if(customFeedData.reward_id && !customFeedData.receiver_id) {
                            customFeedData.type = 'rewardCreated';
                            customFeedData.rewardImage = "/assets/images/rewards/" + feed.rewardImage;
                        }

                        resolve(customFeedData);
                    } else {
                        reject('No feed found');
                    }
                })
        })
    };

    let receiverPromise = customFeed => {
        return new Promise((resolve, reject) => {
            let userQuery = { _id: customFeed.receiver_id };
            const projection = { completeName: 1, location: 1, seniority: 1 };
            User
                .findOne(userQuery, projection)
                .lean()
                .exec((err, user) => {
                    if(err)
                        console.error(err);
                    if(user) {
                        let data = customFeed;
                        data.receiverName = user.completeName.toLowerCase();
                        if(user.location === 'MEXICO') {
                            data.location = 'POLANCO';
                        }
                        else {
                            data.location = user.location;
                        }

                        if(customFeed.earnedReason === "seniority" && !customFeed.badgeSlug) {
                            data.seniority = user.seniority;
                            if(user.seniority !== 1)
                                data.badgeImage = "/assets/images/ico_" + user.seniority + '.png';
                            else
                                data.badgeImage = "/assets/images/logo-valora-icono.png";
                        }

                        customFeed = Object.assign(customFeed, data);
                        resolve(customFeed);
                    } else {
                        resolve(customFeed);
                    }
                })
        })
    };

    let badgePromise = customFeed => {
        return new Promise(resolve => {
            if(typeof customFeed.badgeSlug !== 'undefined') {
                const badgeQuery = { slug: customFeed.badgeSlug };
                Badge
                    .findOne(badgeQuery, { name: 1, image: 1 })
                    .lean()
                    .exec((err, badge) => {
                        if (err)
                            console.error(err);
                        if (badge) {
                            let data = customFeed;

                            if (typeof customFeed.message !== 'undefined') {
                                if(customFeed.message  === 'ambassador') {
                                    data.type = "ambassador";
                                }
                            } else {
                                data.type = "badgeAcknowledge";
                            }

                            data.badgeName = badge.name;
                            data.badgeImage = "/assets/images/badges/" + badge.image;

                            customFeed = Object.assign(customFeed, data);
                            resolve(customFeed);
                        }
                    })
            } else {
                resolve(customFeed);
            }
        })
    };

    let senderPromise = customFeed => {
        return new Promise(resolve => {
            if(typeof customFeed.sender_id !== 'undefined') {
                const userQuery = { _id: customFeed.sender_id };
                const projection = { completeName: 1, location: 1, seniority: 1 };
                User
                    .findOne(userQuery, projection)
                    .lean()
                    .exec((err, user) => {
                        if(err) {
                            console.error(err);
                        }
                        if(user) {
                            let data = customFeed;
                            data.senderName = user.completeName.toLowerCase();
                            if(user.location === 'MEXICO') {
                                data.senderlocation = 'POLANCO';
                            }
                            else {
                                data.senderlocation = user.location;
                            }

                            customFeed = Object.assign(customFeed, data);

                            resolve(customFeed);
                        }
                    })
            } else {
                resolve(customFeed);
            }
        })
    };

    function sendResponse(customFeed) {
        let resData = {
            success: true,
            feed: {}
        };

        if(typeof customFeed !== 'undefined') {
            resData.feed = customFeed;
            res.status(200).json(resData);
        } else {
            resData.message = 'No se encontró información';
            resData.success = false;
            res.status(404).json(resData)
        }
    }

    let query = {};
    if(req.params.feed_id) {
        query._id = req.params.feed_id;
    }

    feedPromise(query)
        .then(receiverPromise)
        .then(badgePromise)
        .then(senderPromise)
        .then(sendResponse)
        .catch(err => console.error(err));
};