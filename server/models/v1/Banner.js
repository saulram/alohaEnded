/**
 * Created by Mordekaiser on 28/09/16.
 */
"use strict";
var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

var BannerSchema = mongoose.Schema({
    name: {
        type: String,
        required: 'Nombre requerido'
    },
    slug: {type: String},
    image: {type: String},
    description: {type: String},
    isActive: {
        type: Boolean,
        default: true
    }
});

BannerSchema.plugin(timestamps);
module.exports = mongoose.model('Banner', BannerSchema);