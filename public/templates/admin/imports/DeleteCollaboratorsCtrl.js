/**
 * Created by Mordekaiser on 17/04/17.
 */
'use strict';
angular.module('valora')
    .directive('fileCollaborators', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                elm.bind('change', function () {
                    $parse(attrs.fileCollaborators).assign(scope, elm[0].files[0]);
                    scope.$apply();
                })
            }
        }
    }])
    .controller('DeleteCollaboratorsCtrl', ['$scope', 'ImportService', 'mvNotifier', DeleteCollaboratorsCtrl]);

function DeleteCollaboratorsCtrl($scope, ImportService, mvNotifier) {
    $scope.deleteCollaborators = function () {
        const data = {
            imports: $scope.files
        };

        ImportService.deleteCollaborators(data).then(function (data) {
            if(data.success) {
                mvNotifier.notify('Archivo cargado correctamente');
                $scope.result = data;
            } else
                mvNotifier.error('Ocurrió un error al subir el archivo');
        })
    }
}