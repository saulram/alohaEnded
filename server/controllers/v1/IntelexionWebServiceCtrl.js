/**
 * Created by Latin on 3/25/2017.
 */
'use strict';
const mongoose = require('mongoose'),
    IntelexionLog = mongoose.model('IWebServiceLog'),
    moment = require('moment');

exports.get = function (req, res) {
    let query = {};
    if(req.query.dateFrom) {
        const dateTo = new Date(req.query.dateFrom.split('T')[0] + 'T23:59:59.999Z');
        query.createdAt = {$gte: req.query.dateFrom.split('T')[0], $lt: dateTo};
    }

    IntelexionLog.find(query, function (err, logs) {
        if(err) {
            console.error('Error en obtener logs. ' + err);
        }

        if(logs.length > 0) {
            const resData = {
                success: true,
                logs: logs.map(log => {
                    return {
                        completeName: log.completeName,
                        employeeNumber: log.employeeNumber,
                        category: log.category,
                        seniority: log.seniority,
                        isActive: log.isActive,
                        location: log.location,
                        position: log.position,
                        department: log.department,
                        area: log.area,
                        error: log.error,
                        updatedAt: moment.utc(log.updatedAt).locale('es').format('LL')
                    }
                })
            };
            res.status(200).json(resData);
        } else {
            res.status(404).json({success: false, message: 'No se encontró más información'});
        }
    })
};