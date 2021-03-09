/**
 * Created by Mordekaiser on 13/11/16.
 */
"use strict";
angular.module('valora')
    .directive("ngFileSelect",function(){
        return {
            link: function($scope,el){
                el.bind("change", function(e){
                    $scope.file = (e.srcElement || e.target).files[0];
                    $scope.getFile();
                })
            }
        }
    })
    .controller('ProfileImgCtrl', ['$scope', 'fileReader', 'mvNotifier', 'AuthService', ProfileImgCtrl]);

function ProfileImgCtrl($scope, fileReader, mvNotifier, AuthService) {
    $scope.changeImg = function () {
        if($scope.file) {
            AuthService.put({image: $scope.file}).then(function (success) {
                if(success) {
                    mvNotifier.notify('Imagen cambiada correctamente');
                }
            })
        }
    };

    $scope.getFile = function () {
        $scope.progress = 0;
        fileReader.readAsDataUrl($scope.file, $scope)
            .then(function(result) {
                $scope.imageSrc = result;
            });

        $scope.$on("fileProgress", function(e, progress) {
            $scope.progress = progress.loaded / progress.total;
        });
    };
}