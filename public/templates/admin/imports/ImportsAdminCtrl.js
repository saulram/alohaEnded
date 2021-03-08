/**
 * Created by Mordekaiser on 24/10/16.
 */
"use strict";
angular.module('valora')
    .directive('fileUpgrade', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                elm.bind('change', function () {
                    $parse(attrs.fileUpgrade).assign(scope, elm[0].files[0]);
                    scope.$apply();
                })
            }
        }
    }])
    .directive('filePerformance', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                elm.bind('change', function () {
                    $parse(attrs.filePerformance).assign(scope, elm[0].files[0]);
                    scope.$apply();
                })
            }
        }
    }])
    .controller('ImportsAdminCtrl', ['$scope', 'ImportService', 'mvNotifier', 'AuthToken', ImportsAdminCtrl]);

function ImportsAdminCtrl($scope, ImportService, mvNotifier, AuthToken) {
    $scope.importUpgrade = function () {
        var data = {
            imports: $scope.files,
            type: 'upgrade'
        };

        ImportService.post({}, data).then(function (data) {
            if(data.success) {
                mvNotifier.notify('Archivo cargado correctamente');
                $scope.upgradeRes = data;
            } else
                mvNotifier.error('Ocurrió un error al subir el archivo');
        })
    };

    $scope.importPerformance = function () {
        var data = {
            imports: $scope.performanceFiles,
            type: 'performance'
        };

        ImportService.post({}, data).then(function (data) {
            if(data.success) {
                mvNotifier.notify('Archivo cargado correctamente');
                $scope.response = data;
            } else
                mvNotifier.error('Ocurrió un error al subir el archivo');
        })
    }
}