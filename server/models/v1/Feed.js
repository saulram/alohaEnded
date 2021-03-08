/**
 * Created by Mordekaiser on 10/11/16.
 */
"use strict";
const mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

const FeedSchema = mongoose.Schema({
    // fields for grant a badge
    sender_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    senderName: {type: String},
    senderLocation: { type: String },
    senderMessage: { type: String },
    receiver_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    receiverName: {type: String},
    receiverLocation: { type: String },
    badgeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Badge'
    },
    badgeSlug: {type: String},
    // for reward exchanged and new rewards added
    reward_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Reward'
    },
    rewardName: {type: String},
    rewardImage: {type: String},
    rewardPoints: {type: Number},
    rewardExpiresAt: {type: Date},
    // for points earned from Upgrade, Evaluación and seniority
    earnedReason: {type: String},
    earnedPoints: {type: Number},
    // for analytics
    likes: {
        count: {type: Number, default: 0},
        collaborator_id: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }]
    },
    // for displaying copys
    message: {type: String},
    isActive: {
        type: Boolean,
        default: true
    },
    type: {type: String},
    comments: [
        {
            postedAt: {type: Date, default: new Date()},
            postedById: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            },
            collaborator: {
                id: {type: String},
                completeName: {type: String}
                },
            comment: {type: String}
        }
    ]
});

FeedSchema.plugin(timestamps);

FeedSchema.virtual('badge', {
    ref: 'Badge',
    localField: 'badgeId',
    foreignField: '_id',
    justOne: true
});

FeedSchema.virtual('reward', {
    ref: 'Reward',
    localField: 'reward_id',
    foreignField: '_id',
    justOne: true
});

FeedSchema.virtual('sender', {
    ref: 'User',
    localField: 'sender_id',
    foreignField: '_id',
    justOne: true
});

FeedSchema.virtual('receiver', {
    ref: 'User',
    localField: 'receiver_id',
    foreignField: '_id',
    justOne: true
});

FeedSchema.virtual('like', {
    ref: 'User',
    localField: 'likes.collaborator_id',
    foreignField: '_id',
    justOne: true
});

FeedSchema.virtual('postedBy', {
    ref: 'User',
    localField: 'comments.postedById',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('Feed', FeedSchema);