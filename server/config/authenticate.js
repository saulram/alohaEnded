/**
 * Created by Mordekaiser on 11/10/16.
 */
"use strict";
const jwt = require('jsonwebtoken'),
    config = require('./configuration'),
    jwtValidate = require('../services/v1/jwtValidation');

exports.authenticate = function (req, res, next) {
    if(req.query.token) {
        jwt.verify(req.query.token, config.development.tokenSecret, function(err, decoded) {
            if(err) {
                console.log(err);
                res.status(401);
                res.end();
            }

            // console.log(decoded);
            next();
        });
    } else
        res.redirect('/login');
};

exports.requiresRole = function (role) {
    return function (req, res, next) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        var userRole = jwtValidate.getUserRol(token);
        var auth = false;

        userRole.forEach(function (usrRole) {
            if(role.indexOf(usrRole) !== -1)
                auth = true;
        });

        if(!auth) {
            res.status(403);
            res.end();
        } else {
            next();
        }
    };
};