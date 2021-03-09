/**
 * Created by Latin on 3/17/2017.
 */
'use strict';
var mongoose = require('mongoose'),
    config = require('../../config/configuration');

var RateBucketSchema = new mongoose.Schema({
    createdAt: {type: Date, required: true, default: Date.now, expires: config.development.rateLimits.ttl},
    ip: {type: String, required: true, trim: true, match: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/},
    hits: {type: Number, default: 1, required: true, max: config.development.rateLimits.maxHits, min: 0}
});

module.exports = mongoose.model('RateBucket', RateBucketSchema);