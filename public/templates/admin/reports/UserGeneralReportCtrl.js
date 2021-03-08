/**
 * Created by Latin on 2/13/2017.
 */
"use strict";
angular.module('valora')
    .controller('UserGeneralReportCtrl', ['$scope', 'mvNotifier', 'LogService', UserGeneralReportCtrl]);

function UserGeneralReportCtrl($scope, mvNotifier, LogService) {
    $scope.collaborator = {};

    $scope.moreData = function () {
        let query = {
            lastId: $scope.lastId
        };

        searchUsersPoints(query);
    };

    $scope.searchUsers = function () {
        if (typeof $scope.dateFrom !== 'undefined' && typeof $scope.dateTo !== 'undefined') {
            if (new Date($scope.dateFrom) <= new Date($scope.dateTo)) {
                const query = {
                    dateFrom: new Date($scope.dateFrom).toISOString(),
                    dateTo: new Date($scope.dateTo).toISOString()
                };

                searchUsersPoints(query);
            } else {
                mvNotifier.error('Selecciona un rango de fechas válido');
            }
        } else {
            mvNotifier.error('Selecciona un rango de fechas');
        }
    };

    $scope.setOrder = function (model) {
        $scope.orderByModel = model;
    };

    $scope.getCsv = function () {
        if (typeof $scope.dateFrom !== 'undefined' && typeof $scope.dateTo !== 'undefined') {
            if (new Date($scope.dateFrom) <= new Date($scope.dateTo)) {
                $('#loader').css('display', 'block');
                $('#loaderBackground').css('display', 'block');
                var query = {
                    type: 'csv',
                    dateFrom: new Date($scope.dateFrom).toISOString(),
                    dateTo: new Date($scope.dateTo).toISOString()
                };
                LogService.generalReport(query).then(function (data) {
                    if(data) {
                        var csvData = new Blob([{"hello" : "bye"}], {type: 'text/csv;charset=utf-8;'});

                        if (navigator.msSaveBlob) {
                            navigator.msSaveBlob(csvData, 'badge-report.csv');
                            //navigator.msSaveBlob(blob, 'insignias-colaboradores.csv');
                        } else {
                            let a = document.createElement('a');
                            a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(data);
                            a.target = '_blank';
                            a.download = 'badge-report.csv';
                            document.body.appendChild(a);
                            a.click();
                        }
                    }
                    $('#loader').css('display', 'none');
                    $('#loaderBackground').css('display', 'none');
                });
            } else {
                mvNotifier.error('Selecciona un rango de fechas válido');
            }
        } else {
            mvNotifier.error('Selecciona un rango de fechas');
        }
    };

    function searchUsersPoints(query) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        LogService.generalReport(query).then(function (data) {
            if(data.success) {
                $scope.users = data.accounts;
            } else {
                mvNotifier.error(data.message);
            }
            $('#loader').css('display', 'none');
            $('#loaderBackground').css('display', 'none');
        });
    }
}