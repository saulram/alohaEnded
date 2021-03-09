/**
 * Created by Mordekaiser on 27/09/16.
 */
var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');

module.exports = {
    development: {
        db: process.env.DB_HOST,
        rootPath: rootPath,
        port: process.env.PORT || 5001,
        tokenSecret: process.env.API_TOKEN || 't54valora6p',
        api_key: process.env.API_KEY || 'key-597f13d5d66a5685e32c04e5a6a15187',
        rateLimits: {
            ttl: 10 * 60, // 10 min
            maxHits: 1500
        },
        renewTemporalPtsCron: '0 0 1 * *'
    },
    staging: {
        db: process.env.DB_HOST,
        rootPath: rootPath,
        port: process.env.PORT || 5400,
        tokenSecret: process.env.API_TOKEN || 't54valora6p',
        api_key: process.env.API_KEY || 'key-597f13d5d66a5685e32c04e5a6a15187',
        rateLimits: {
            ttl: 10 * 60, // 10 min
            maxHits: 1500
        },
        renewTemporalPtsCron: '0 0 1 * *'
    }
};