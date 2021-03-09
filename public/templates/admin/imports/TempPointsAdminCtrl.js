/**
 * Created by Mordekaiser on 07/11/16.
 */
"use strict";
angular.module('valora')
    .controller('TempPointsAdminCtrl', ['$scope', 'ImportService', 'mvNotifier', '$filter', 'AuthToken', TempPointsAdminCtrl]);

function TempPointsAdminCtrl($scope, ImportService, mvNotifier, $filter, AuthToken) {
    $scope.importPoints = function () {
        var query = {
            role: $scope.role
        };
        var data = {
            points: $scope.points,
            type: 'points'
        };

        ImportService.post(query, data).then(function (success) {
            if(success) {
                mvNotifier.notify('Asignación de datos realizada correctamente');
            }
        })
    };
}