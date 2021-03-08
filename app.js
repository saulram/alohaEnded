/**
 * Created by Mordekaiser on 27/09/16.
 */
'use strict';
var express = require('express'),
    cron = require('node-cron'),
    dotenv = require('dotenv').config();

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'staging';

var app = express();
var config = require('./server/config/configuration')[env];
require('./server/config/express')(app, config);
require('./server/config/mongoose')(config);
require('./server/config/routes')(app, config);

// 0 0 0 * * * every midnight
// 0 30 2 * * *
// */1 * * * * every minute
// 0 30 2 * * *
const services = require('./server/services/v1/renewTemporalPoints');
const upgradePts = require('./server/services/v1/upgradePoints');
const reset = require('./server/services/v1/ResetPasswords');

cron.schedule(config.renewTemporalPtsCron, function () {
    services.execute();
});

cron.schedule('0 0 0 * * *', function () {
    //services.intelexion();
    //reset.update();
});

/*cron.schedule('0 30 2 * * *', function () {
    upgradePts.reducePoints();
});*/

app.listen(config.port, function () {
    console.log('Gulp is running valora app on PORT: ' + config.port);
});

/**
 * Export the Express app so that it can be used by Chai
 */
module.exports = app;