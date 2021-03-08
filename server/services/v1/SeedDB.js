/**
 * Created by Latin on 2/2/2017.
 */
'use strict';
exports.start = function () {
    const mongoose = require('mongoose'),
        User = mongoose.model('User'),
        encrypt = require('../../services/v1/encrypto'),
        csv = require('fast-csv');
    const Feed = mongoose.model('Feed'),
        Account = mongoose.model('Account'),
        businessRules = require('../../services/v1/BusinessRules');
    csv.fromPath('../valora/dumps/csv/justone.csv', {headers: true})
        .on('data', function (data) {
            createUser(data);
        })
        .on('end', function () {
            console.log('finished');
        });

    function createUser(usr) {
        if(usr.seniority > 0) {
            let salt, hash;
            salt = encrypt.createSalt();
            hash = encrypt.hashPwd(salt, 'demo');
            const points = businessRules.seniorityValidation(usr.seniority);

            let data = {
                completeName: usr.completeName,
                employeeNumber: usr.employeeNumber,
                seniority: usr.seniority,
                location: usr.location,
                position: usr.position,
                area: usr.area,
                department: usr.department,
                salt: salt,
                hashed_pwd: hash,
                points: {
                    current: points
                }
            };

            if(usr.isLeader === 'Si')
                data.roles = ['colaborador', 'lider'];
            else
                data.roles = ['colaborador'];

            //console.log(data);
            var user = new User(data);
            user.save(function (err, doc) {
                if(err)
                    console.log(err);
                if(doc) {
                    var data = {
                        receiver_id: doc._id,
                        receiverName: doc.completeName,
                        earnedReason: 'seniority',
                        earnedPoints: points
                    };

                    createFeed(data);
                    var info = {
                        user_id: doc._id,
                        earnedPoints: points,
                        earnedReason: 'Antigüedad',
                        earnedType: 'seniority'
                    };
                    createAccountBalance(info);
                }
            });
        }
    }

    function createFeed(data) {
        var feed = new Feed(data);
        feed.save(function(err, doc) {
            if(err)
                console.log('Error at creating feed for seed. Error: ' + err);
            if(doc) {
                console.log('Feed created with _id: ' + doc._id);
            }
        });
    }

    function createAccountBalance(data) {
        var account = new Account(data);
        account.save(function(err, doc) {
            if(err)
                console.log('Error at creating account balance for seed. Error: ' + err);
            if(doc) {
                console.log('Feed created with _id: ' + doc._id);
            }
        });
    }
};