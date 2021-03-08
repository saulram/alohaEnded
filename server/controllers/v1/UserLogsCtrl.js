'use strict';

const mongoose = require('mongoose');
const UserLog = mongoose.model('UserLog');
const moment = require('moment-timezone');
const json2csv = require('json2csv');

exports.get = async (req, res) => {
    if (req.body.dateFrom && req.body.dateTo) { return res.status(400).json({ success: false, userLogs: [] }) }

    const { dateFrom, dateTo, type } = req.query;
    const currentDate = moment(dateFrom).startOf('month').format('YYYY-MM-DD');
    const nextDate = moment(dateTo).add(1, 'M').startOf('month').format('YYYY-MM-DD');

    const aggregationQuery = [
        { $match: { createdAt: { $gte: new Date(currentDate), $lt: new Date(nextDate) }}},
        { $group: {
                _id: "$userId",
                count: { $sum: 1 }}},
        { $project: { _id: 1, count: 1 }},
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        }
    ];

    const aggregationUserLog = await UserLog
        .aggregate(aggregationQuery)
        .catch(err => console.error(err));

    if (type === 'csv') {
        const fields = ['completeName', 'employeeNumber', 'location', 'area', 'position', 'total'];
        const dataToFormat = aggregationUserLog.map(info => {
            return {
                completeName: info.user[0].completeName,
                employeeNumber: info.user[0].employeeNumber,
                location: info.user[0].location,
                area: info.user[0].area,
                position: info.user[0].position,
                total: info.count
            }
        });

        return json2csv({ data: dataToFormat, fields: fields }, function(err, csv) {
            if (err) {
                console.error(err);
            }
            res.set('Content-Type', 'text/csv;charset=utf-8;');
            return res.send(new Buffer(csv));
        });
    }

    if (aggregationUserLog && type !== 'csv') { return res.status(200).json({ success: true, userLogs: aggregationUserLog }) }

    return res.status(404).json({ success: false, userLogs: [] })
};