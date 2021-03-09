/**
 * Created by Latin on 4/3/2017.
 */
'use strict';
angular.module('valora')
    .controller('ProfileCtrl', ['$scope', 'mvNotifier', 'AccountStatusService', ProfileCtrl]);

function ProfileCtrl($scope, mvNotifier, AccountStatusService) {
    getPreferences();

    $scope.saveChanges = function () {
        let data = {
            notifications: {}
        };
        if(!$scope.preferencesForm.email.$pristine)
            data.email = $scope.email;
        if(!$scope.preferencesForm.badge.$pristine)
            data.notifications.badge = $scope.badge;
        if(!$scope.preferencesForm.upgrade.$pristine)
            data.notifications.upgrade = $scope.upgrade;
        if(!$scope.preferencesForm.performance.$pristine)
            data.notifications.performance = $scope.performance;
        if(!$scope.preferencesForm.feedLike.$pristine)
            data.notifications.feedLike = $scope.feedLike;
        if(!$scope.preferencesForm.seniority.$pristine)
            data.notifications.seniority = $scope.seniority;
        if(!$scope.preferencesForm.ambassador.$pristine)
            data.notifications.ambassador = $scope.ambassador;

        if(!angular.equals(data.notifications, {}) || typeof data.email !== 'undefined')
            putPreferences(data);
    };

    function putPreferences(data) {
        AccountStatusService.putPreferences(data).then(function (success) {
            if(success) {
                mvNotifier.notify('Información actualizada correctamente');
                getPreferences();
            }
            else
                mvNotifier.error('No se pudo actualizar la información');
        })
    }

    function getPreferences() {
        AccountStatusService.getPreferences().then(function (data) {
            if(data) {
                $scope.email = data.email;
                $scope.badge = data.notifications.badge;
                $scope.upgrade = data.notifications.upgrade;
                $scope.performance = data.notifications.performance;
                $scope.feedLike = data.notifications.feedLike;
                $scope.seniority = data.notifications.seniority;
                $scope.ambassador = data.notifications.ambassador;
            } else
                mvNotifier.error('No se pudo obtener la información');
        })
    }
}