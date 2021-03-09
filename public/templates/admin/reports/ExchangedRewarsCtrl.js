'use strict';
angular.module('valora')
    .controller('ExchangedRewardsCtrl', ['$scope', 'RewardService', 'mvNotifier', ExchangedRewardsCtrl]);

function ExchangedRewardsCtrl($scope, RewardService, mvNotifier) {
    $scope.getRewards = function () {
        if (typeof $scope.fromDate !== 'undefined' && typeof $scope.toDate !== 'undefined') {
            var query = {
                dateFrom: new Date($scope.fromDate).toISOString(),
                dateTo: new Date($scope.toDate).toISOString()
            };
            searchRewards(query);
        } else {
            mvNotifier.error('Selecciona un rango de fechas');
        }
    };

    $scope.csvRewards = function () {
        if (typeof $scope.fromDate !== 'undefined' && typeof $scope.toDate !== 'undefined') {
            var query = {
                dateFrom: new Date($scope.fromDate).toISOString(),
                dateTo: new Date($scope.toDate).toISOString(),
                type: 'csv'
            };
            getCSVRewards(query);
        } else {
            mvNotifier.error('Selecciona un rango de fechas');
        }
    };

    function searchRewards(query) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        RewardService.exchangedByDate(query).then(function (data) {
            if(data.success) {
                $scope.rewards = data.accounts;
            } else {
                mvNotifier.error(data.message);
            }

            $('#loader').css('display', 'none');
            $('#loaderBackground').css('display', 'none');
        })
    }

    function getCSVRewards(query) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        RewardService.exchangedByDate(query).then(function (data) {
            if(data) {
                if (window.navigator.msSaveOrOpenBlob) {
                    var blob = new Blob([decodeURIComponent(encodeURI(data))], {
                        type: "text/csv;charset=utf-8;"
                    });
                    navigator.msSaveBlob(blob, 'exchanged-rewards.csv');
                } else {
                    var a = document.createElement('a');
                    a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(data);
                    a.target = '_blank';
                    a.download = 'exchanged-rewards.csv';
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
}