/**
 * Created by Mordekaiser on 28/09/16.
 */
'use strict';
var mongoose = require('mongoose'),
    Banner = mongoose.model('Banner'),
    getSlug = require('speakingurl'),
    _ = require('underscore');

exports.post = function(req, res) {
    console.log('POST Banner');
    var data = {};

    if(req.body.name) {
        data.name = req.body.name;
        data.slug = getSlug(req.body.name, {lang: 'es'});
    }
    if(req.body.description)
        data.description = req.body.description;
    if(req.file)
        data.image = req.file.filename;

    var banner = new Banner(data);
    banner.save(function(err, doc) {
        if(err) {
            res.status(500).json({success:false});
            res.end();
        } else {
            res.status(201).json({success: true});
            res.end();
        }
    });
};

exports.get = function (req, res) {
    if(typeof req.query._id !== 'undefined') {
        let query = {
            _id: req.query._id,
            isActive: true
        };

        Banner
            .findOne(query)
            .lean()
            .exec((err, banner) => {
                if(err) {
                    console.error(err);
                }

                if(banner) {
                    banner.image = "/assets/images/banners/" + banner.image;
                    res.status(200).json({success: true, banner: banner});
                } else {
                    res.status(404).json({success: false, banner: {}});
                }
            })
    } else {
        // find all
        Banner
            .find({isActive: true})
            .sort({createdAt: 1})
            .lean()
            .exec((err, banners) => {
                if(err) {
                    console.log(err);
                }

                if(banners.length > 0) {
                    const customBanners = _.map(banners, banner => {
                        return {
                            _id: banner._id,
                            image: "/assets/images/banners/" + banner.image,
                            name: banner.name,
                            description: banner.description
                        }
                    });

                    res.status(200).json({success: true, banners: customBanners});
                } else {
                    res.status(404).json({success: false, message: 'Banners no encontrados', banners: []});
                }
            });
    }
};

exports.delBanner = function (req, res) {
    console.log('DELETE Banner');
    var data = {
        isActive: false
    };

    var query = {
        _id: req.query._id
    };

    Banner.update(query, {$set: data}, function (err) {
        if (err) {
            console.log(err);
            res.status(401).json({success: false, error: err});
        } else {
            res.status(201).json({success: true});
            res.end();
        }
    });
};

exports.put = function (req, res) {
    console.log('PUT Banner');
    var data = {};
    var query = {
        _id: req.query._id
    };

    if(req.body.name)
        data.name = req.body.name;
    if(req.body.description)
        data.description = req.body.description;
    if(req.file)
        data.image = req.file.filename;

    Banner.update(query, {$set: data}, function (err) {
        if (err) {
            console.log(err);
            res.status(401).json({success: false, error: err});
        } else {
            res.status(201).json({success: true});
            res.end();
        }
    });
};