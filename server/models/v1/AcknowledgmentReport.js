/**
 * Created by Mordekaiser on 27/08/18.
 */
// use to keep track of acknowledgements of collaborators with badges
'use strict';
const mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

const AcknowledgmentReportSchema = mongoose.Schema({
    badgeName: {type: String},
    badgePoints: {type: Number},
    badgeCategory: { type: String },
    sender_id: {type: String},
    senderEmployeeNumber: { type: String },
    senderName: { type: String },
    senderLocation: { type: String },
    senderPosition: { type: String },
    senderDepartment: { type: String },
    senderArea: { type: String },
    receiver_id: {type: String},
    receiverEmployeeNumber: { type: String },
    receiverName: { type: String },
    receiverLocation: { type: String },
    receiverPosition: { type: String },
    receiverDepartment: { type: String },
    receiverArea: { type: String },
    isActive: {
        type: Boolean,
        default: true
    }
});

AcknowledgmentReportSchema.plugin(timestamps);
module.exports = mongoose.model('AcknowledgmentReport', AcknowledgmentReportSchema);