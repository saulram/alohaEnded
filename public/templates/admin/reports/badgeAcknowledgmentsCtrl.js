"use strict";
angular.module('valora')
    .controller('badgeAcknowledgmentsCtrl', ['$scope', 'AcknowledgmentService', 'mvNotifier', badgeAcknowledgmentsCtrl]);

function badgeAcknowledgmentsCtrl($scope, AcknowledgmentService, mvNotifier) {
    $scope.badgeAcknowledgments = function () {
        if (typeof $scope.fromDate !== 'undefined' && typeof $scope.toDate !== 'undefined') {
            var query = {
                dateFrom: new Date($scope.fromDate).toISOString(),
                dateTo: new Date($scope.toDate).toISOString()
            };
            getBadgeAcknowledgments(query);
        } else {
            mvNotifier.error('Selecciona un rango de fechas');
        }
    };

    $scope.csvBadgeAcknowledgments = function () {
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

    function getBadgeAcknowledgments(query) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        AcknowledgmentService.getBadgeAcknowledgments(query).then(function (data) {
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
        AcknowledgmentService.getBadgeAcknowledgments(query).then(function (data) {
            if(data) {
                if (window.navigator.msSaveOrOpenBlob) {
                    var blob = new Blob([decodeURIComponent(encodeURI(data))], {
                        type: "text/csv;charset=utf-8;"
                    });
                    navigator.msSaveBlob(blob, 'badge-acknowledgments.csv');
                } else {
                    var a = document.createElement('a');
                    a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(data);
                    a.target = '_blank';
                    a.download = 'badge-acknowledgments.csv';
                    document.body.appendChild(a);
                    a.click();
                }
            } else {
                mvNotifier.notify(data.message);
            }
            $('#loader').css('display', 'none');
            $('#loaderBackground').css('display', 'none');
        })
    }
}