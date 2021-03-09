/**
 * Created by Mordekaiser on 27/09/16.
 */
const mongoose = require('mongoose'),
    BannerModel = require('../models/v1/Banner'),
    UserModel = require('../models/v1/User'),
    RewardModel = require('../models/v1/Reward'),
    AccountModel = require('../models/v1/Account'),
    BadgeModel = require('../models/v1/Badge'),
    Acknowledgment = require('../models/v1/Acknowledgment'),
    Feed = require('../models/v1/Feed'),
    UserLog = require('../models/v1/UserLog'),
    RateBucket = require('../models/v1/RateBucket'),
    IWebServiceLog = require('../models/v1/IWebServiceLog'),
    Mention = require('../models/v1/Mention'),
    FeedMessage = require('../models/v1/FeedMessage'),
    Notification = require('../models/v1/Notification'),
    moment = require('moment'),
    AcknowledgmentReport = require('../models/v1/AcknowledgmentReport');

module.exports = function (config) {
    const options = {
        server: {
            auto_reconnect: true,
            socketOptions: {
                connectTimeoutMS: 0,
                socketTimeoutMS: 0
            }
        }
    };
try {
console.log(config.db);
    mongoose.connect(config.db, { useNewUrlParser: true });
    const db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error...'));
    db.once('open', function callback() {
        console.log('Aloha-staging DB opened...');
    });
} catch(e) {
console.log('error db', e);
}
    //UserModel.seedUsers();
};
