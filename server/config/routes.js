/**
 * Created by Mordekaiser on 27/09/16.
 */
'use strict';
const multer = require('multer'),
    getSlug = require('speakingurl'),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/assets/images/badges/');
        },
        filename: function (req, file, cb) {
            cb(null, getSlug(req.body.name, {lang: 'es'}));
        }
    });

const bannerImages = multer({dest: 'public/assets/images/banners/'}),
    rewardImages = multer({dest: 'public/assets/images/rewards/'}),
    badgeImages = multer({storage: storage}),
    profileImage = multer({dest: 'public/assets/images/users'}),
    bannerCtrl = require('../controllers/v1/BannersCtrl'),
    auth = require('./authenticate'),
    userCtrl = require('../controllers/v1/UsersCtrl'),
    jwt = require('../services/v1/jwtValidation'),
    rewardsCtrl = require('../controllers/v1/RewardsCtrl'),
    wishListCtrl = require('../controllers/v1/WishListsCtrl'),
    rewardsLikeCtrl = require('../controllers/v1/RewardsLikeCtrl'),
    importsCtrl = require('../controllers/v1/ImportsCtrl'),
    importedFiles = multer({dest: 'server/imported-files/'}),
    accountStatusCtrl = require('../controllers/v1/AccountStatusCtrl'),
    badgesCtrl = require('../controllers/v1/BadgesCtrl'),
    acknowledgmentCtrl = require('../controllers/v1/AcknowledgmentCtrl'),
    feedCtrl = require('../controllers/v1/FeedsCtrl'),
    userLogsCtrl = require('../controllers/v1/UserLogsCtrl'),
    reportsCtrl = require('../controllers/v1/ReportsCtrl'),
    throttle = require('../services/v1/Throttle'),
    IntelexionWebServiceCtrl = require('../controllers/v1/IntelexionWebServiceCtrl'),
    myActivityCtrl = require('../controllers/v1/MyActivityCtrl'),
    feedCommentsCtrl = require('../controllers/v1/FeedCommentsCtrl'),
    rewardCommentsCtrl = require('../controllers/v1/RewardCommentsCtrl'),
    userUpgradePointsCtrl = require('../controllers/v1/UserUpgradePointsCtrl'),
    usersGroupCtrl = require('../controllers/v1/UsersGroupCtrl'),
    mentionCtrl = require('../controllers/v1/MentionCtrl'),
    userRolCtrl = require('../controllers/v1/UserRolCtrl'),
    feedMessageCtrl = require('../controllers/v1/FeedMessageCtrl'),
    notificationsCtrl = require('../controllers/v1/NotificationsCtrl'),
    dashboardCtrl = require('../controllers/v1/DashboardCtrl');

module.exports = function (app, config) {
    app.post('/api/v1/banners', jwt.jwtValidate, auth.requiresRole('superAdmin'), bannerImages.single('image'), bannerCtrl.post);
    app.get('/api/v1/banners', jwt.jwtValidate, bannerCtrl.get);
    app.delete('/api/v1/banners', jwt.jwtValidate, auth.requiresRole('superAdmin'), bannerCtrl.delBanner);
    app.put('/api/v1/banners', jwt.jwtValidate, auth.requiresRole('superAdmin'), bannerImages.single('image'), bannerCtrl.put);

    app.post('/api/v1/rewards', jwt.jwtValidate, auth.requiresRole('superAdmin'), rewardImages.single('image'), rewardsCtrl.post);
    app.get('/api/v1/rewards', jwt.jwtValidate, rewardsCtrl.get);
    app.delete('/api/v1/rewards', jwt.jwtValidate, auth.requiresRole('superAdmin'), rewardsCtrl.del);
    app.put('/api/v1/rewards', jwt.jwtValidate, auth.requiresRole('superAdmin'), rewardImages.single('image'), rewardsCtrl.put);
    app.get('/api/v1/rewards-count', jwt.jwtValidate, rewardsCtrl.count);
    app.post('/api/v1/rewards/comments', jwt.jwtValidate, rewardCommentsCtrl.post);
    app.delete('/api/v1/rewards/comments', jwt.jwtValidate, rewardCommentsCtrl.del);

    app.put('/api/v1/wish-list', jwt.jwtValidate, wishListCtrl.put);
    app.delete('/api/v1/wish-list', jwt.jwtValidate, wishListCtrl.del);
    app.get('/api/v1/wish-list', jwt.jwtValidate, wishListCtrl.get);

    app.put('/api/v1/rewards-like', jwt.jwtValidate, rewardsLikeCtrl.put);
    app.delete('/api/v1/rewards-like', jwt.jwtValidate, rewardsLikeCtrl.del);
    app.get('/api/v1/rewards-like-report', jwt.jwtValidate, rewardsLikeCtrl.getReport);
    app.get('/api/v1/rewards-exchanged-report', jwt.jwtValidate, rewardsCtrl.getExchangedReport);
    app.get('/api/v1/rewards/exchanged-by-date', jwt.jwtValidate, rewardsCtrl.exchangedRewards);

    app.post('/api/v1/imports', jwt.jwtValidate, auth.requiresRole('superAdmin'), importedFiles.single('imports'), importsCtrl.post);
    app.post('/api/v1/import-collaborators', jwt.jwtValidate, auth.requiresRole('superAdmin'), importedFiles.single('imports'), importsCtrl.addCollaborators);
    app.delete('/api/v1/import-collaborators', jwt.jwtValidate, auth.requiresRole('superAdmin'), importedFiles.single('imports'), importsCtrl.removeCollaborators);

    app.post('/api/v1/account-status', jwt.jwtValidate, accountStatusCtrl.post);
    app.get('/api/v1/account-status', jwt.jwtValidate, accountStatusCtrl.get);
    app.get('/api/v1/account-rewards', jwt.jwtValidate, auth.requiresRole(['superAdmin', 'admin']), rewardsCtrl.getRewardStatus);
    app.get('/api/v1/account-rewards-location', jwt.jwtValidate, auth.requiresRole('admin'), rewardsCtrl.getRewardStatusLocation);
    app.put('/api/v1/account-status', jwt.jwtValidate, accountStatusCtrl.put);
    app.get('/api/v1/account-history-points', jwt.jwtValidate, auth.requiresRole(['superAdmin', 'admin']), accountStatusCtrl.accountHistoryPoints);
    
    app.get('/api/v1/dashboard/generals', jwt.jwtValidate, auth.requiresRole(['superAdmin', 'admin']), dashboardCtrl.getGeneralsMetrics);



    app.post('/api/v1/badges', jwt.jwtValidate, auth.requiresRole('superAdmin'), badgeImages.single('image'), badgesCtrl.post);
    app.get('/api/v1/badges', jwt.jwtValidate, badgesCtrl.get);
    app.put('/api/v1/badges', jwt.jwtValidate, auth.requiresRole('superAdmin'), badgeImages.single('image'), badgesCtrl.put);
    app.delete('/api/v1/badges', jwt.jwtValidate, auth.requiresRole('superAdmin'), badgesCtrl.del);
    app.get('/api/v1/badges-group', jwt.jwtValidate, auth.requiresRole(['superAdmin', 'admin']), badgesCtrl.badgeGroup);

    app.get('/api/v1/users', jwt.jwtValidate, userCtrl.get);
    app.put('/api/v1/users', jwt.jwtValidate, profileImage.single('image'), userCtrl.put);
    app.get('/api/v1/user-preferences', jwt.jwtValidate, userCtrl.getPreferences);
    app.put('/api/v1/user-preferences', jwt.jwtValidate, userCtrl.putPreferences);
    app.get('/api/v1/users-roles', jwt.jwtValidate, userRolCtrl.get);
    app.put('/api/v1/users-roles', jwt.jwtValidate, userRolCtrl.put);
    app.put('/api/v1/users-pass', jwt.jwtValidate, userCtrl.putPass);
    app.get('/api/v1/users-report', jwt.jwtValidate, auth.requiresRole('superAdmin'), reportsCtrl.generalReport);
    app.get('/api/v1/users-forgotten-pass', userCtrl.forgottenPass);
    app.get('/api/v1/users-badges-points', jwt.jwtValidate, auth.requiresRole('superAdmin'), reportsCtrl.badgesPoints);
    app.post('/api/v1/user-upgrade-points', jwt.jwtValidate, userUpgradePointsCtrl.post);
    app.get('/api/v1/user-upgrade-points/:user_id', jwt.jwtValidate, userUpgradePointsCtrl.getByUser);
    app.get('/api/v1/user-upgrade-points', jwt.jwtValidate, userUpgradePointsCtrl.get);
    app.get('/api/v1/user-active', jwt.jwtValidate, userCtrl.getActiveCollaborators);
    app.put('/api/v1/user-active/:_id', jwt.jwtValidate, userCtrl.activate);
    app.get('/api/v1/user-temporal', jwt.jwtValidate, userCtrl.getTemporalPass);
    // routes for setting the users groups
    // app.get('/api/v1/users-group', jwt.jwtValidate, usersGroupCtrl.get);
    // app.put('/api/v1/users-group', usersGroupCtrl.put);

    app.post('/api/v1/acknowledgments', jwt.jwtValidate, acknowledgmentCtrl.post);
    app.get('/api/v1/acknowledgments', jwt.jwtValidate, acknowledgmentCtrl.get);
    app.get('/api/v1/acknowledgments/report', jwt.jwtValidate, reportsCtrl.badgePointsReport);
    app.get('/api/v1/acknowledgments/admin-report', jwt.jwtValidate, acknowledgmentCtrl.adminBadgesReport);
    app.get('/api/v1/acknowledgments-report', jwt.jwtValidate, auth.requiresRole(['superAdmin', 'admin']), acknowledgmentCtrl.badgesAcknowledgment);
    app.get('/api/v1/acknowledgments-senders', jwt.jwtValidate, acknowledgmentCtrl.getSenders);

    app.get('/api/v1/ambassadors', jwt.jwtValidate, acknowledgmentCtrl.getNationalAmbassadors);

    app.get('/api/v1/feeds', jwt.jwtValidate, feedCtrl.get);
    app.get('/api/v1/feeds/:feed_id', jwt.jwtValidate, feedCtrl.getById);
    app.get('/api/v1/feeds-like', jwt.jwtValidate, feedCtrl.getLikes);
    app.put('/api/v1/feeds-like', jwt.jwtValidate, feedCtrl.putFeedLike);
    app.delete('/api/v1/feeds-like', jwt.jwtValidate, feedCtrl.deleteFeedLike);
    app.get('/api/v1/admin/feeds', jwt.jwtValidate, auth.requiresRole('superAdmin'), feedCtrl.adminGet);
    app.delete('/api/v1/admin/feeds', jwt.jwtValidate, auth.requiresRole('superAdmin'), feedCtrl.adminDelete);
    app.post('/api/v1/feeds/comments', jwt.jwtValidate, feedCommentsCtrl.post);
    app.delete('/api/v1/feeds/comments', jwt.jwtValidate, feedCommentsCtrl.del);

    app.get('/api/v1/my-activity', jwt.jwtValidate, myActivityCtrl.get);

    app.get('/api/v1/logs', jwt.jwtValidate, auth.requiresRole(['superAdmin', 'admin']), userLogsCtrl.get);
    app.get('/api/v1/intelexion-logs', jwt.jwtValidate, auth.requiresRole('superAdmin'), IntelexionWebServiceCtrl.get);

    app.post('/api/v1/mention', jwt.jwtValidate, mentionCtrl.post);
    app.get('/api/v1/mention', jwt.jwtValidate, mentionCtrl.get);
    app.get('/api/v1/mention/:_id', jwt.jwtValidate, mentionCtrl.getById);
    app.put('/api/v1/mention/:_id', jwt.jwtValidate, mentionCtrl.put);
    app.delete('/api/v1/mention/:_id', jwt.jwtValidate, mentionCtrl.del);

    app.post('/api/v1/feed-message', jwt.jwtValidate, feedMessageCtrl.post);

    app.get('/api/v1/location', jwt.jwtValidate, userCtrl.getLocation);

    app.put('/api/v1/notifications/:_id', jwt.jwtValidate, notificationsCtrl.put);

    app.post('/api/v1/login', throttle.limit, userCtrl.login);

    app.get('*', function (req, res) {
        res.sendFile(config.rootPath + 'public/home.html');
    });
};