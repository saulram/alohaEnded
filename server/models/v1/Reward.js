/**
 * Created by Mordekaiser on 14/10/16.
 */
"use strict";
const mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

const RewardSchema = mongoose.Schema({
    name: {
        type: String,
        required: 'Reward name required'
    },
    slug: {type: String},
    image: {type: String},
    description: {type: String},
    points: {
        type: Number,
        required: 'Reward points required'
    },
    likes: {
        type: Number,
        default: 0
    },
    expiresAt: {type: Date},
    size: [{type: String}],
    gender: [{type: String}],
    category: {type: String},
    color: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    comments: [
        {
            postedAt: {type: Date, default: new Date()},
            collaborator: {
                id: {type: String},
                completeName: {type: String}
            },
            comment: {type: String}
        }
    ]
});

RewardSchema.plugin(timestamps);
module.exports = mongoose.model('Reward', RewardSchema);