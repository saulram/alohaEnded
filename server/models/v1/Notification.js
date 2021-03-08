'use strict';
const mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

const NotificationSchema = mongoose.Schema({
    feed_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Feed',
        required: 'Feed_id required'
    },
    receiver_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'Receiver_id required'
    },
    sender_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: 'Message required'
    },
    content: { type: String },
    isRead: {
        type: Boolean,
        default: false
    },
    type: { type: String },
    isActive: { type: Boolean, default: true }
});

NotificationSchema.plugin(timestamps);

NotificationSchema.virtual('feed', {
    ref: 'Feed',
    localField: 'feed_id',
    foreignField: '_id',
    justOne: true
});

NotificationSchema.virtual('sender', {
    ref: 'User',
    localField: 'sender_id',
    foreignField: '_id',
    justOne: true
});

NotificationSchema.virtual('receiver', {
    ref: 'User',
    localField: 'receiver_id',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('Notification', NotificationSchema);