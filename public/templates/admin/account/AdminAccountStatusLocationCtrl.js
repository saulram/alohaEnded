/**
 * Created by Mordekaiser on 07/12/16.
 */
"use strict";
angular.module('valora')
    .controller('AdminAccountStatusLocationCtrl', ['$scope', 'AccountStatusService', 'mvNotifier', AdminAccountStatusLocationCtrl]);

function AdminAccountStatusLocationCtrl($scope, AccountStatusService, mvNotifier) {
    $('#loader').css('display', 'block');
    $('#loaderBackground').css('display', 'block');
    AccountStatusService.getByAdmin().then(function (data) {
        if(data.success) {
            $scope.accountsLocation = data.accounts;
        } else {
            mvNotifier.error(data.message);
        }
        $('#loader').css('display', 'none');
        $('#loaderBackground').css('display', 'none');
    });

    $scope.setOrder = function (model) {
        $scope.orderByModel = model;
    };
}