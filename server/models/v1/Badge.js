/**
 * Created by Mordekaiser on 01/11/16.
 */
"use strict";
var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

var BadgeSchema = mongoose.Schema({
    name: {type: String},
    slug: {type: String},
    image: {type: String},
    points: {type: String},
    category: {type: String},
    expiresAt: {type: Date},
    rolAuth: {type: String, default: 'colaborador'},
    isActive: {
        type: Boolean,
        default: true
    }
});

BadgeSchema.plugin(timestamps);
module.exports = mongoose.model('Badge', BadgeSchema);