/**
 * Created by Mordekaiser on 24/11/16.
 */
'use strict';
const mongoose = require('mongoose'),
    User = mongoose.model('User'),
    soap = require('soap'),
    encrypt = require('../../services/v1/encrypto'),
    Feed = mongoose.model('Feed'),
    Account = mongoose.model('Account'),
    businessRules = require('../../services/v1/BusinessRules'),
    Q = require('q'),
    IWebServiceLog = mongoose.model('IWebServiceLog'),
    moment = require('moment'),
    mailgunEmail = require('../../services/v1/MailgunEmail');

exports.execute = function () {
    console.log('Renewing all collaborators temporal points at ' + new Date());

    let data = {
        "points.temporal" : 600
    };

    User.update({}, {$set: data}, {multi: true}, function (err, docs) {
        if(err)
            console.error('Errot at executing cron job. Error: ' + err + ' at ' + new Date());
        if(docs) {
            console.log(docs);
            console.log('Cron job executed correctly at ' + new Date());
        }
    })
};

exports.intelexion = function () {
    // console.log('Intelexion');
    const url = process.env.INTELEXION_HOST;
    Q.fcall(soapClient)
        .then(getEmployees)
        .then(syncEmployees)
        .catch(function (error) {
            console.log(error);
        })
        .done(function () {
            console.log('Cron task finished');
        });

    function soapClient() {
        // console.log('Client');
        let dfd = Q.defer();
        soap.createClient(url, function (err, client) {
            if(err) {
                console.log('renewTemporalPoint - soapClient. ' + err);
                let logData = {
                    category: 'Error',
                    error: err
                };
                registerLog(logData);
            }
            if(client)
                dfd.resolve(client);
            else {
                //console.log('reject');
                dfd.reject();
            }
        });

        return dfd.promise;
    }

    function getEmployees(client) {
        // console.log('Get employees');
        let dfd = Q.defer();
        client.GetListadoEmpleados(function (err, employees) {
            if(err) {
                console.log('renewTemporalPoint - getEmployees. ' + err);
                let logData = {
                    category: 'Error',
                    error: err
                };
                registerLog(logData);
            }
            if(employees) {
                console.log(employees.length);
                dfd.resolve(employees);
            } else {
                console.log('reject');
                dfd.reject();
            }
        }, {timeout: 10000});

        return dfd.promise;
    }

    function syncEmployees(employees) {
        let employeesArr = JSON.parse(employees.GetListadoEmpleadosResult);
        // console.log(employeesArr.length);
        if(employeesArr.length > 0) {
            let employeesAdded = 0;
            let employeesUpdated = 0;
            for(let i = 0; i < employeesArr.length; i++) {
                // add new collaborator when reaches first
                if(!!employeesArr[i].Status === true) {
                    searchEmployee(employeesArr[i].IdEmpleado, function (exists) {
                        if(!exists) {
                            employeesAdded++;
                            AddCollaborator(employeesArr[i]);
                        } else {
                            employeesUpdated++;
                            updateEmployeeData(employeesArr[i]);
                        }
                    });
                }
                else {
                    employeesUpdated++;
                    updateEmployeeData(employeesArr[i]);
                }

                if(i === Number(employeesArr.length -1)) {
                    console.log('Nuevos empleados: ' + employeesAdded);
                    console.log('Empleados actualizados: ' + employeesUpdated);
                }
            }
        } else {
            let logData = {
                category: 'Sin movimientos',
                error: 'No se recibieron registros de Intelexion'
            };
            registerLog(logData);
        }
    }

    function searchEmployee(id, callback) {
        User.findOne({employeeNumber: id}, function (err, collaborator) {
            if(err)
                console.log('renewTemporalPoints Service - searchEmployee. ' + err);
            return callback(!!collaborator);
        })
    }

    function AddCollaborator(employee) {
        const salt = encrypt.createSalt();
        const hash = encrypt.hashPwd(salt, 'demo');
        const points = businessRules.seniorityValidation(employee.antiguedad);
        let data = {
            completeName: employee.nombre + ' ' + employee.apellidoPat + ' ' + employee.apellidoMat,
            employeeNumber: employee.IdEmpleado,
            salt: salt,
            hashed_pwd: hash,
            seniority: employee.antiguedad,
            location: employee.Hotel,
            isActive: true,
            position: employee.nombrePuesto,
            points: {
                current: points,
                temporal: 600
            },
            department: employee.Departamento,
            area: employee.Direccion,
            roles: ['colaborador'],
            upgrade: {
                updatedAt: new Date(),
                result: 0,
                points: 0,
                badge: ''
            },
            groups: ['todos']
        };

        if(Number(employee.PersonasACargo) > 0) {
            data.roles.push('lider');
        }

        const logData = {
            completeName: data.completeName,
            employeeNumber: data.employeeNumber,
            category: 'Alta de colaborador',
            seniority: data.seniority
        };

        const iWebServiceLog = new IWebServiceLog(logData);
        iWebServiceLog.save(function (err) {
            if(err)
                console.log('Error at inserting Intelexion log. ' + err);
        });

        const user = new User(data);
        user.save(function (err, doc) {
            if(err)
                console.log(err);
            if(doc) {
                let data = {
                    receiver_id: doc._id,
                    receiverName: doc.completeName,
                    earnedReason: 'seniority',
                    earnedPoints: points,
                    type: 'seniority'
                };

                if(doc.seniority > 0) {
                    createFeed(data);
                }

                let info = {
                    user_id: doc._id,
                    earnedPoints: points,
                    earnedReason: 'Antigüedad',
                    earnedType: 'seniority'
                };
                createAccountBalance(info);
            }
        });
    }

    function updateEmployeeData(employee) {
        User.findOne({employeeNumber: employee.IdEmpleado}, function (err, collaborator) {
            if(err)
                console.log('renewTemporalPoints - updateEmployeeData. ' + err);
            if(collaborator) {
                let data = {};
                let logData = {};
                let points = 0;
                let earnedYear = false;

                if(employee.antiguedad > collaborator.seniority) {
                    points = businessRules.seniorityValidation(employee.antiguedad);
                    data.seniority = employee.antiguedad;
                    earnedYear = true;
                } else {
                    data.seniority = employee.antiguedad;
                }
                if(!!employee.Status !== collaborator.isActive)
                    data.isActive = employee.Status;
                if(employee.Hotel !== collaborator.location)
                    data.location = employee.Hotel;
                if(employee.nombrePuesto !== collaborator.position)
                    data.position = employee.nombrePuesto;
                if(employee.department !== collaborator.Direccion)
                    data.department = employee.Direccion;
                if(employee.area !== collaborator.Departamento)
                    data.area = employee.Departamento;

                if(!isEmpty(data)) {
                    logData = data;
                    logData.category = 'Colaborador actualizado';
                    logData.employeeNumber = collaborator.employeeNumber;
                    logData.completeName = collaborator.completeName;

                    data.updatedAt = moment().format('YYYY-MM-DD');
                    User.update({employeeNumber: collaborator.employeeNumber},{$set: data, $inc: {'points.current': points}}, function (err, updatedUser) {
                        if(err) {
                            console.log('Error at updating collaborator. ' + err);
                            let errorData = {
                                completeName: collaborator.completeName,
                                employeeNumber: collaborator.employeeNumber,
                                category: 'Error',
                                seniority: collaborator.seniority,
                                isActive: collaborator.isActive,
                                error: err
                            };
                            registerLog(errorData);
                        }
                        else {
                            registerLog(logData);
                        }

                        if(earnedYear) {
                            let earnedYearData = {
                                receiver_id: collaborator._id,
                                receiverName: employee.nombre + ' ' + employee.apellidoPat + ' ' + employee.apellidoMat,
                                earnedReason: 'seniority',
                                earnedPoints: points,
                                type: 'seniority'
                            };
                            if(collaborator.seniority > 0) {
                                createFeed(earnedYearData);
                            }

                            let info = {
                                user_id: collaborator._id,
                                earnedPoints: points,
                                earnedReason: 'Antigüedad',
                                earnedType: 'seniority'
                            };
                            createAccountBalance(info);

                            if(updatedUser.email) {
                                if(!!updatedUser.notifications.seniority) {
                                    const emailData = {
                                        completeName: updatedUser.completeName,
                                        email: updatedUser.email
                                    };
                                    //sendEmailNotification(emailData);
                                }
                            }
                        }
                    })
                } else {
                    // create log record
                }
            }
        })
    }

    function isEmpty(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    function createFeed(data) {
        var feed = new Feed(data);
        feed.save(function(err, doc) {
            if(err)
                console.log('Error at creating feed for seed. Error: ' + err);
        });
    }

    function createAccountBalance(data) {
        var account = new Account(data);
        account.save(function(err, doc) {
            if(err)
                console.log('Error at creating account balance for seed. Error: ' + err);
        });
    }

    function registerLog(logData) {
        const iWebServiceLog = new IWebServiceLog(logData);
        iWebServiceLog.save(function (err) {
            if(err)
                console.log('Error at inserting Intelexion log. ' + err);
        });
    }

    function //sendEmailNotification(emailData) {
        const html = "<p>¡Felicidades! " + emailData.completeName + " has cumplido un año más en Grupo Presidente y para festejarlo, ¡Valora te dá puntos extras! Entra <a href='https://valora-gp.com/' style='text-decoration: none'>aquí</a> y checa cuántos has recibido en tu estado de cuenta.</p>";
        console.log('Sending email notification for seniority');
        mailgunEmail.send(emailData.email, 'Tu actividad en Valora', html);
    }
};