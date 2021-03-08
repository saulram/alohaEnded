/**
 * Created by latin on 1/5/2017.
 */
"use strict";
angular.module('valora')
    .controller('UserLogsReportCtrl', ['$scope', 'LogService', 'mvNotifier', UserLogsReportCtrl]);

function UserLogsReportCtrl($scope, LogService, mvNotifier) {
    $scope.searchLogs = function () {
        if (typeof $scope.fromDate !== 'undefined' && typeof $scope.toDate !== 'undefined') {
            var query = {
                dateFrom: new Date($scope.fromDate).toISOString(),
                dateTo: new Date($scope.toDate).toISOString()
            };
            getUserLogs(query);
        } else {
            mvNotifier.error('Selecciona un rango de fechas');
        }
    };

    $scope.csvLogs = function () {
        var query = {
            dateFrom: new Date($scope.fromDate).toISOString(),
            dateTo: new Date($scope.toDate).toISOString(),
            type: 'csv'
        };

        LogService.get(query).then(function (data) {
            if(data) {
                try
                {
                    if (window.navigator.msSaveOrOpenBlob) {
                        var blob = new Blob([decodeURIComponent(encodeURI(data))], {
                            type: "text/csv;charset=utf-8;"
                        });
                        navigator.msSaveBlob(blob, 'user-logs.csv');
                    } else {
                        var a = document.createElement('a');
                        a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(data);
                        a.target = '_blank';
                        a.download = 'user-logs.csv';
                        document.body.appendChild(a);
                        a.click();
                    }
                } catch(ex)
                {
                    console.log("saveBlob method failed with the following exception:");
                    console.log(ex);
                }
            } else {
                mvNotifier.error(data.message);
            }
        });
    };

    $scope.options = {
        showWeeks: true,
        maxDate: new Date(),
        dateFormat: 'dd-MMMM-yyyy'
    };

    function getUserLogs(query) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        LogService.get(query).then(function (data) {
            if(data.success) {
                $scope.logs = data.userLogs;
            } else {
                mvNotifier.error(data.message);
            }

            $('#loader').css('display', 'none');
            $('#loaderBackground').css('display', 'none');
        });
    }
}