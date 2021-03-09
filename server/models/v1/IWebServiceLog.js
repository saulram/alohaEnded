/**
 * Created by Mordekaiser on 24/03/17.
 */
'use strict';
const mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

const IWebServiceLogSchema = mongoose.Schema({
    completeName: {type: String},
    employeeNumber: {type: Number},
    category: {type: String},
    seniority: {type: Number},
    isActive: {type: Boolean},
    location: {type: String},
    position: {type: String},
    department: {type: String},
    area: {type: String},
    error: {type: String}
});

IWebServiceLogSchema.plugin(timestamps);
module.exports = mongoose.model('IWebServiceLog', IWebServiceLogSchema);