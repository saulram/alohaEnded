/**
 * Created by Latin on 3/17/2017.
 */
'use strict';
var config = require('../../config/configuration'),
    mongoose = require('mongoose'),
    RateBucket = mongoose.model('RateBucket');

exports.limit = function (request, response, next) {
    let ip;

    var forwardedIpsStr = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress;

    if (forwardedIpsStr) {
        // 'x-forwarded-for' header may return multiple IP addresses in
        // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
        // the first one
        var forwardedIps = forwardedIpsStr.split(',');
        ip = forwardedIps[0];
        if (ip.substr(0, 7) == "::ffff:")
            ip = ip.substr(7);
    }
    if (!ip) {
        // Ensure getting client IP address still works in
        // staging environment
        ip = req.connection.remoteAddress;
    }

    //ip = '127.0.0.1';
    RateBucket
        .findOneAndUpdate({ip: ip}, {$inc: {hits: 1}}, {upsert: false})
        .exec(function (err, rateBucket) {
            if(err) {
                response.status(500);
                response.end();
                return next(err);
            }
            if(!rateBucket) {
                rateBucket = new RateBucket({
                    createdAt: new Date(),
                    ip: ip
                });
                rateBucket.save(function (err, rateBucket) {
                    if(err) {
                        response.statusCode = 500;
                        return next(err);
                    }
                    if(!rateBucket) {
                        response.statusCode = 500;
                        return response.json({err: "RateLimit", message: 'Cant\' create rate limit bucket'});
                    }
                    var timeUntilReset = config.staging.rateLimits.ttl - (new Date().getTime() - rateBucket.createdAt.getTime());
                    // the rate limit ceiling for that given request
                    response.set('X-Rate-Limit-Limit', config.staging.rateLimits.maxHits);
                    // the number of requests left for the time window
                    response.set('X-Rate-Limit-Remaining', config.staging.rateLimits.maxHits - 1);
                    // the remaining window before the rate limit resets in miliseconds
                    response.set('X-Rate-Limit-Reset', timeUntilReset);
                    // Return bucket so other routes can use it
                    request.rateBucket = rateBucket;
                    return next();
                })
            } else {
                var timeUntilReset = config.staging.rateLimits.ttl - (new Date().getTime() - rateBucket.createdAt.getTime());
                var remaining =  Math.max(0, (config.staging.rateLimits.maxHits - rateBucket.hits));
                // the rate limit ceiling for that given request
                response.set('X-Rate-Limit-Limit', config.staging.rateLimits.maxHits);
                // the number of requests left for the time window
                response.set('X-Rate-Limit-Remaining', remaining);
                // the remaining window before the rate limit resets in miliseconds
                response.set('X-Rate-Limit-Reset', timeUntilReset);
                // Return bucket so other routes can use it
                request.rateBucket = rateBucket;
                // Reject or allow
                if(rateBucket.hits < config.staging.rateLimits.maxHits) {
                    return next();
                } else {
                    response.statusCode = 429;
                    return response.json({error: "RateLimit", message: 'Too Many Requests'});
                }
            }
        })
};
