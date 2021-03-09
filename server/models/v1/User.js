/**
 * Created by Mordekaiser on 11/10/16.
 */
"use strict";
var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    encrypt = require('../../services/v1/encrypto'),
    seedDB = require('../../services/v1/SeedDB');

var UserSchema = mongoose.Schema({
    completeName: {
        type: String,
        required: 'Complete name required'
    },
    employeeNumber: {
        type: Number,
        required: 'Employee number required'
    },
    profileImage: {type: String},
    hashed_pwd: {
        type: String,
        required: 'Password (hash) required'
    },
    salt: {
        type: String,
        required: 'Password (salt) required'
    },
    roles: [{
        type: String,
        required: 'Rol required'
    }],
    seniority: {type: Number},
    location: {type: String},
    points: {
        current: {type: Number},
        temporal: {type: Number},
        expiresAt: {type: Date},
        updatedAt: {type: Date}
    },
    upgrade: {
        result: {type: Number},
        badge: {type: String},
        updatedAt: {type: Date},
        points: {type: Number}
    },
    performance: {type: Number},
    wishList: [{type: String}],
    likes: [{type: String}],
    position: {type: String},
    area: {type: String},
    department: {type: String},
    isActive: {
        type: Boolean,
        default: true
    },
    passChanged: {type: Boolean, default: false},
    email: {type: String},
    passRecovery: {
        uuid: {type: String}
    },
    notifications: {
        _id: false,
        badge: {type: Boolean, default: true},
        upgrade: {type: Boolean, default: true},
        performance: {type: Boolean, default: true},
        feedLike: {type: Boolean, default: true},
        seniority: {type: Boolean, default: true},
        ambassador: {type: Boolean, default: true},
        comments: { type: Boolean, default: true }
    },
    groups: [{type: String}],
    paths: [{type: String}]
});

UserSchema.plugin(timestamps);
UserSchema.methods = {
    authenticate: function (passwordToMatch) {
        return encrypt.hashPwd(this.salt, passwordToMatch) === this.hashed_pwd;
    }
    /*toJSON: function () {
        var user = this.toObject();
        delete user.hashed_pwd;
        delete user.salt;
        delete user.createdAt;
        delete user.updatedAt;
        delete user.isActive;
        return user;
    }*/
};
var user = mongoose.model('User', UserSchema);

function seedUsers() {
    user.find({employeeNumber: 211788}).exec(function (err, collection) {
        if(collection.length === 0) {
            console.log('Creating seed...');
            seedDB.start();
        }
    });
}

//exports.seedUsers = seedUsers;