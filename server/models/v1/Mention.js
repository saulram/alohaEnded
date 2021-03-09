'use strict';
const mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

const MentionSchema = mongoose.Schema({
    description: {
        type: String,
        required: 'Mención requerida'
    },
    draft: {type: Boolean, default: true},
    isActive: {
        type: Boolean,
        default: true
    }
});

MentionSchema.plugin(timestamps);
module.exports = mongoose.model('Mention', MentionSchema);