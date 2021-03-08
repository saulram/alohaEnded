/**
 * Created by Mordekaiser on 27/09/16.
 */
'use strict';
const express = require('express'),
    bodyParser = require('body-parser'),
    stylus = require('stylus'),
    nib = require('nib');

module.exports = function (app, config) {
    function compile(str, path) {
        return stylus(str)
            .set('filename', path)
            .use(nib())
    }
    const allowCrossDomain = function(req, res, next) {
        const whiteList = ['http://localhost:5001'];
        let origin = req.headers.origin;
        if(whiteList.indexOf(origin) > -1){
            res.setHeader('Access-Control-Allow-Origin', origin);
        }

        //res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, x-access-token');

        // intercept OPTIONS method
        if ('OPTIONS' === req.method) {
            res.status(200);
            next();
        }
        else {
            next();
        }
    };
    app.use(allowCrossDomain);
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(stylus.middleware({
        src: config.rootPath + '/public',
        compile: compile
    }));
    app.use(express.static(config.rootPath + 'public'));
    app.set('jwtTokenSecret', config.secret);
};