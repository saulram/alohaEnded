/**
 * Created by latin on 1/5/2017.
 */
"use strict";
const mongoose = require('mongoose');
const moment = require('moment-timezone');

const UserLogSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: { type: Date, default: moment().tz('America/Mexico_City').format().replace('-06:00', '.00Z') },
    isActive: { type: Boolean, default: true }
});

UserLogSchema.virtual('createAtFormat').get(function () {
    return moment(this.createdAt).tz('America/Mexico_City').locale('es').format('LL')
});

module.exports = mongoose.model('UserLog', UserLogSchema);