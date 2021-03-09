/**
 * Created by Mordekaiser on 01/12/16.
 */
"use strict";
angular.module('valora')
    .controller('SpecialBadgesEditAdminCtrl', ['$scope', 'fileReader' ,'BadgeService', '$filter', 'mvNotifier', '$stateParams', '$location', SpecialBadgesEditAdminCtrl]);

function SpecialBadgesEditAdminCtrl($scope, fileReader, BadgeService, $filter, mvNotifier, $stateParams, $location) {
    if($stateParams.id) {
        BadgeService.get({type: 'byId', id: $stateParams.id}).then(function (data) {
            if(data) {
                $scope.category = data[0].category;
                $scope.badgeName = data[0].name;
                $scope.points = Number(data[0].points);
                $scope.imageSrc = data[0].image;
                $scope.expiresAt = new Date(data[0].expiresAt);
            }
        });

        $scope.editBadge = function () {
            var data = {};
            data.name = $scope.badgeName;
            if(!$scope.badgeForm.category.$pristine)
                data.category = $scope.category;
            if(!$scope.badgeForm.points.$pristine)
                data.points = $scope.points;
            if(!$scope.badgeForm.expiresAt.$pristine)
                data.expiresAt = $scope.expiresAt;
            if($scope.file)
                data.image = $scope.file;

            BadgeService.put({_id: $stateParams.id}, data).then(function (success) {
                if(success) {
                    mvNotifier.notify('Insignia actualizada exitosamente');
                    $location.path('/admin/special-badges');
                }
            })
        }
    }

    $scope.getFile = function () {
        $scope.progress = 0;
        fileReader.readAsDataUrl($scope.file, $scope)
            .then(function(result) {
                $scope.imageSrc = result;
            });
    };

    $scope.options = {
        showWeeks: true,
        dateFormat: 'dd-MMMM-yyyy'
    };
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
    $scope.format = $scope.formats[0];

    $scope.today = function() {
        $scope.expiresAt = new Date();
    };
    $scope.today();
}