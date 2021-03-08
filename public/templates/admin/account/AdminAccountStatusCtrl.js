/**
 * Created by Mordekaiser on 12/11/16.
 */
"use strict";
angular.module('valora')
    .controller('AdminAccountStatusCtrl', ['$scope', 'AccountStatusService', '$stateParams', 'mvNotifier', '$state', AdminAccountStatusCtrl]);

function AdminAccountStatusCtrl($scope, AccountStatusService, $stateParams, mvNotifier, $state) {
    if($stateParams.id) {
        var query = {
            type: 'byId',
            id: $stateParams.id
        };

        AccountStatusService.getAccountRewards(query).then(function (data) {
            if(data) {
                $scope.status = data[0].status;
            }
        });

        $scope.editStatus = function () {
            var data = {};
            if(!$scope.statusForm.status.$pristine) {
                data.state = $scope.status;

                AccountStatusService.put({id: $stateParams.id}, data).then(function (success) {
                    if(success) {
                        mvNotifier.notify('Estado actualizado correctamente');
                        if($scope.identity.isAuthorized('superAdmin'))
                            $state.go('admin.account');
                        else
                            $state.go('admin.account-location');

                    }
                })
            }
        }
    }
}