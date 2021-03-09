'use strict';
angular.module('valora')
    .controller('badgeGroupsPointsCtrl', ['$scope', 'mvNotifier', 'BadgeService', badgeGroupsPointsCtrl]);

function badgeGroupsPointsCtrl($scope, mvNotifier, BadgeService) {
    $scope.getData = function () {
        if (typeof $scope.fromDate !== 'undefined' && typeof $scope.toDate !== 'undefined') {
            var query = {
                dateFrom: new Date($scope.fromDate).toISOString(),
                dateTo: new Date($scope.toDate).toISOString()
            };
            getGroupPoints(query);
        } else {
            mvNotifier.error('Selecciona un rango de fechas');
        }
    };

    $scope.csvGroupPoints = function () {
        if (typeof $scope.fromDate !== 'undefined' && typeof $scope.toDate !== 'undefined') {
            var query = {
                dateFrom: new Date($scope.fromDate).toISOString(),
                dateTo: new Date($scope.toDate).toISOString(),
                type: 'csv'
            };
            getCSV(query);
        } else {
            mvNotifier.error('Selecciona un rango de fechas');
        }
    };

    function getGroupPoints(query) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        BadgeService.groupPoints(query).then(function (data) {
            if(data.success) {
                $scope.acknowledgments = data.acknowledgments;
            } else {
                mvNotifier.error(data.message);
            }
            $('#loader').css('display', 'none');
            $('#loaderBackground').css('display', 'none');
        })
    }

    function getCSV(query) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        BadgeService.groupPoints(query).then(function (data) {
            if(data) {
                if (window.navigator.msSaveOrOpenBlob) {
                    var blob = new Blob([decodeURIComponent(encodeURI(data))], {
                        type: "text/csv;charset=utf-8;"
                    });
                    navigator.msSaveBlob(blob, 'puntos-por-insignia.csv');
                } else {
                    var a = document.createElement('a');
                    a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(data);
                    a.target = '_blank';
                    a.download = 'puntos-por-insignia.csv';
                    document.body.appendChild(a);
                    a.click();
                }
            } else {
                mvNotifier.watch(data.message);
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