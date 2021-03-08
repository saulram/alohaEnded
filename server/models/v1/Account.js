/**
 * Created by Mordekaiser on 27/10/16.
 */
"use strict";
const mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');
// this schema tracks the expended and earned points like an bank account
const AccountSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    reward_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Reward'
    },
    exchangeCode: {type: String},
    expendedPoints: {type: Number},
    rewardName: {type: String},
    earnedPoints: {type: Number},
    earnedReason: {type: String},
    earnedType: {type: String},
    size: {type: String},
    gender: {type: String},
    color: {type: String},
    status: {type: String, default: 'En espera'},
    isActive: {
        type: Boolean,
        default: true
    }
});

AccountSchema.plugin(timestamps);

AccountSchema.set('toObject', { getters: true, virtuals: true });

AccountSchema.virtual('user', {
    ref: 'User',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true
});

AccountSchema.virtual('reward', {
    ref: 'Reward',
    localField: 'reward_id',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('Account', AccountSchema);