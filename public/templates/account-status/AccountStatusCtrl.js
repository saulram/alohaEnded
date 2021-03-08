/**
 * Created by Mordekaiser on 27/10/16.
 */
"use strict";
angular.module('valora')
    .controller('AccountStatusCtrl', ['$scope', 'AccountStatusService', 'AuthToken', AccountStatusCtrl]);

function AccountStatusCtrl($scope, AccountStatusService, AuthToken) {
    AccountStatusService.get({type: 'byId'}).then(function (data) {
        if(data) {
            $scope.accounts = data.accounts;
            $scope.previousPoints = data.previousPoints;
            $scope.currentPoints = AuthToken.getToken().points.current;
        }
    })
}