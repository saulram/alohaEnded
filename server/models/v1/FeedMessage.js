'use strict';

const mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

const FeedMessageSchema = mongoose.Schema({
    message: {
        type: String,
        required: 'Message required'
    },
    type: {
        type: String,
        required: 'Message type is required',
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

FeedMessageSchema.plugin(timestamps);
module.exports = mongoose.model('FeedMessage', FeedMessageSchema);