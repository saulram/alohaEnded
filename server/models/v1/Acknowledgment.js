/**
 * Created by Mordekaiser on 09/11/16.
 */
// use to keep record when a collaborator shares a badge
"use strict";
const mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

// use to keep track of acknowledgements of collaborators with badges
const AcknowledgmentSchema = mongoose.Schema({
    badgeId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Badge'
    },
    badgeSlug: {type: String},
    badgePoints: {type: Number},
    sender_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    receiver_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

AcknowledgmentSchema.plugin(timestamps);

AcknowledgmentSchema.set('toObject', { getters: true, virtuals: true });

AcknowledgmentSchema.virtual('badge', {
    ref: 'Badge',
    localField: 'badgeId',
    foreignField: '_id',
    justOne: true
});

AcknowledgmentSchema.virtual('sender', {
    ref: 'User',
    localField: 'sender_id',
    foreignField: '_id',
    justOne: true
});

AcknowledgmentSchema.virtual('receiver', {
    ref: 'User',
    localField: 'receiver_id',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('Acknowledgment', AcknowledgmentSchema);