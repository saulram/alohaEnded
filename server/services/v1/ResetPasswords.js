/**
 * Created by miguel.ramirez on 6/28/17.
 */
'use strict';
const mongoose = require('mongoose'),
    User = mongoose.model('User'),
    encrypt = require('./encrypto'),
    shortid = require('shortid');

exports.update = () => {
    const query = {
        location: 'GUADALAJARA',
        isActive: true
    };

    User.find(query, (err, users) => {
        if(err) {
            console.log(err);
        }
        if(users.length > 0) {
            for(let i=0; i < users.length; i++) {
                let randomString = shortid.generate();
                const salt = encrypt.createSalt();
                const hash = encrypt.hashPwd(salt, randomString);
                const updateQuery = {
                    _id: users[i]._id.toString()
                };

                User.findOneAndUpdate(updateQuery, {$set: {passChanged: false, salt: salt, hashed_pwd: hash, "passRecovery.uuid": randomString}}, {new: true}, (err, result) => {
                    if(err) {
                        console.log(err);
                    }
                    if(result) {
                        console.log('EmployeeNumber: ' + result.employeeNumber + ' Temporal pass: ' + result.passRecovery.uuid);
                    }
                });
            }
        }
    });
};