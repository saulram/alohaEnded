'use strict';
angular.module('valora')
    .controller('TemporalPassCtrl', ['$scope', 'UserService', 'LocationService', 'mvNotifier', TemporalPassCtrl]);

function TemporalPassCtrl($scope, UserService, LocationService, mvNotifier) {
    getLocations();
    $scope.searchUser = function () {
        var query = {};

        if(!$scope.temporalForm.selectedLocation.$pristine && $scope.selectedLocation !== "") {
            query.location = $scope.selectedLocation;
        }

        if(!$scope.temporalForm.completeName.$pristine) {
            query.completeName = $scope.completeName;
        }

        if(!$scope.temporalForm.employeeNumber.$pristine) {
            query.employeeNumber = $scope.employeeNumber;
        }

        searchTemporalPass(query);
    };

    function searchTemporalPass(query) {
        UserService.getTemporal(query).then(function (data) {
            if(data.success) {
                $scope.users = data.users;
            } else {
                mvNotifier.error(data.message);
            }
        })
    }

    function getLocations() {
        LocationService.get({}).then(function (data) {
            if(data.success) {
                $scope.locations = data.locations;
            } else {
                mvNotifier.error(data.message);
            }
        })
    }

    $scope.activate = function (user_id) {
        UserService.activateCollaborator(user_id).then(function (data) {
            if(data.success) {
                mvNotifier.notify('Collaborador activado');
                $scope.users = [];
                $scope.users.push(data.user);
            } else {
                mvNotifier.error(data.message);
            }
        })
    }
}