/**
 * Created by Mordekaiser on 31/10/16.
 */
"use strict";
angular.module('valora')
    .controller('AdminAccountCtrl', ['$scope', 'AccountStatusService', AdminAccountCtrl]);

function AdminAccountCtrl($scope, AccountStatusService) {
    AccountStatusService.getAccountRewards().then(function (data) {
        if(data) {
            $scope.accounts = data;
        }
    });

    $scope.setOrder = function (model) {
        $scope.orderByModel = model;
    };
}