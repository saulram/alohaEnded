/**
 * Created by Mordekaiser on 15/11/16.
 */
"use strict";
angular.module('valora')
    .controller('gpBadgeAdminCtrl', ['$scope', 'fileReader' ,'BadgeService', 'mvNotifier', gpBadgeAdminCtrl]);

function gpBadgeAdminCtrl($scope, fileReader, BadgeService, mvNotifier) {
    getAllBadges({type: 'all', category: 'administrator'});
    $scope.addBadge = function () {
        var data = {
            name: $scope.name,
            points: $scope.points,
            image: $scope.file,
            category: 'administrator'
        };
        BadgeService.post(data).then(function (success) {
            if(success) {
                mvNotifier.notify('Insignia creada exitosamente');
                $scope.name = "";
                $scope.points = "";
                $scope.file = "";
                getAllBadges({type: 'all', category: 'administrator'});
            }
        })
    };

    $scope.deleteBadge = function (id) {
        BadgeService.del({_id: id}).then(function (success) {
            if(success) {
                mvNotifier.notify('Insignia eliminada correctamente');
                getAllBadges({type: 'all', category: 'administrator'});
            }
        })
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

    function getAllBadges(query) {
        BadgeService.get(query).then(function (data) {
            if(data) {
                $scope.badges = data;
            }
        })
    }
}