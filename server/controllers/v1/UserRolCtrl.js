'use strict';
const mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.get = (req, res) => {
    // console.log('User rol');
    let userPromise = (userQuery) => {
        return new Promise((resolve, reject) => {
            User
                .find(userQuery)
                .limit(500)
                .exec((err, users) => {
                    if (err) {
                        console.error(err);
                    }
                    if (users.length > 0) {
                        resolve(users);
                    } else {
                        reject({success: false, message: 'No users found'});
                    }
                })
        })
    };

    function sendResponse(users) {
        if(typeof users !== 'undefined') {
            const resData = {
                success: true,
                users: users
            };

            res.status(201).json(resData);
        } else {
            res.status(404).json({success: false, message: 'No hay más resultados'});
        }
    }

    const userQuery = {
        isActive: true,
        seniority: {$gte: 1}
    };

    if(req.query.lastId) {
        userQuery._id = {$gt: req.query.lastId};
    }

    userPromise(userQuery)
        .catch(error => {
            console.error(error);
        })
        .then(sendResponse);
};

exports.put = function (req, res) {
    // console.log('PUT Admin role');
    let query = {};
    let data = {};
    if(req.query.action === 'remove')
        data = {$pull: {roles: 'admin'}};
    else
        data = {$addToSet: {roles: 'admin'}};
    if(req.query._id)
        query._id = req.query._id;

    User.update(query, data, function (err, docs) {
        if(err) {
            console.dir('Ocurrió un error: ' + err, {colors: true});
            res.status(500).json({success: false});
            res.end();
        }

        if(docs) {
            res.status(200).json({success: true});
            res.end();
        }
    })
};