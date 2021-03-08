'use strict';
angular.module('valora')
    .controller('historyPointsCtrl', ['$scope', 'mvNotifier', 'AccountStatusService', historyPointsCtrl]);

function historyPointsCtrl($scope, mvNotifier, AccountStatusService) {
    $scope.getData = function () {
        var query;

        if (typeof $scope.fromDate !== 'undefined' && typeof $scope.toDate !== 'undefined') {
            query = {
                dateFrom: new Date($scope.fromDate).toISOString(),
                dateTo: new Date($scope.toDate).toISOString()
            };
            getHistoryPoints(query);
        } else {
            query = {};
            getHistoryPoints(query);
        }
    };

    $scope.csvTotalPoints = function () {
        getCsvHistoryPoints({type: 'csv'});
    };

    function getHistoryPoints(query) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        AccountStatusService.getHistoryPoints(query).then(function (data) {
            if(data.success) {
                $scope.users = data.users;
            } else {
                mvNotifier.error(data.message);
            }
            $('#loader').css('display', 'none');
            $('#loaderBackground').css('display', 'none');
        })
    }

    function getCsvHistoryPoints(query) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        AccountStatusService.getHistoryPoints(query).then(function (data) {
            if(data) {
                if (window.navigator.msSaveOrOpenBlob) {
                    var blob = new Blob([decodeURIComponent(encodeURI(data))], {
                        type: "text/csv;charset=utf-8;"
                    });
                    navigator.msSaveBlob(blob, 'history-points.csv');
                } else {
                    var a = document.createElement('a');
                    a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(data);
                    a.target = '_blank';
                    a.download = 'history-points.csv';
                    document.body.appendChild(a);
                    a.click();
                }
            } else {
                mvNotifier.error(data.message);
            }
            $('#loader').css('display', 'none');
            $('#loaderBackground').css('display', 'none');
        })
    }

    $scope.setOrder = function (model) {
        $scope.orderByModel = model;
        $scope.sortAscDesc = !$scope.sortAscDesc;
    };
}