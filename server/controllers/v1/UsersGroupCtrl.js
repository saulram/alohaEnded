/**
 * Created by miguel.ramirez on 6/21/17.
 */
'use strict';
const mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.get = (req, res) => {
    // console.log('Users list');
    let query = {
        isActive: true
    };

    if(req.query.location) {
        query.location = req.query.location;
    }
    if(req.query.area) {
        query.area = req.query.area;
    }
    if(req.query.department) {
        query.department = req.query.department;
    }
    if(req.query.completeName) {
        query.completeName = new RegExp('^' + req.query.completeName + '$', "i");
    }

    if(req.query.groups) {
        query.groups = { $in: [req.query.groups] };
    }

    // console.log(query);

    User.find(query, (err, users) => {
        if(err) {
            console.log('UsersGroupCtrl - GET - find');
            console.log(err);
        }
        if(users.length > 0) {
            const data = {
                success: true
            };
            data.users = users.map(user => {
                let customUser = {
                    completeName: user.completeName,
                    employeeNumber: user.employeeNumber,
                    _id: user._id
                };

                if(typeof req.query.users_id !== 'undefined' && req.query.users_id.indexOf(user._id.toString()) !== -1) {
                    customUser.selected = true;
                }
                /*if(req.query.slug === 'todos' && req.query.users_id.indexOf(user._id.toString()) !== -1) {
                    customUser.selected = true;
                }*/
                //console.log(customUser);
                return customUser;
            });
            res.status(200).json(data);
        } else {
            res.status(404).json({ success: false, message: 'No se encontraron usuarios' });
        }
    })
};

exports.put = (req, res) => {
    let query = {
        isActive: true
    };

    if(req.query.location) {
        query.location = req.query.location;
    }
    if(req.query.area) {
        query.area = req.query.area;
    }
    if(req.query.department) {
        query.department = req.query.department;
    }
    if(req.query.completeName) {
        query.completeName = new RegExp('^' + req.query.completeName + '$', "i");
    }

    if(typeof query.location !== 'undefined' || typeof query.area !== 'undefined'
        || typeof query.department !== 'undefined' || typeof req.query.group !== 'undefined') {
        const data = {
            $addToSet: { groups: req.query.group }
        };

        User
            .update(query, data, {multi: true})
            .exec((err, result) => {
                if(err) {
                    console.error(err);
                }
                if(result) {
                    res.status(201).json({success: true});
                } else {
                    res.status(404).json({success: false, message: 'Listado no encontrado'});
                }
            })
    } else {
        res.status(500).json({success: false, message: 'No se encontró el listado de usuarios'});
    }
};