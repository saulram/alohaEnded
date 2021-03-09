/**
 * Created by Mordekaiser on 13/11/16.
 */
"use strict";
angular.module('valora')
    .controller('SpecialBadgesAdminCtrl', ['$scope', 'fileReader', '$filter', 'mvNotifier', 'BadgeService', SpecialBadgesAdminCtrl]);

function SpecialBadgesAdminCtrl($scope, fileReader, $filter, mvNotifier, BadgeService) {
    getAllBadges({type: 'all', category: 'especial'});
    $scope.addSpecialBadge = function () {
        var data = {
            name: $scope.name,
            image: $scope.file,
            points: $scope.points,
            rolAuth: $scope.role,
            expiresAt: $filter('date')($scope.expiresAt, 'yyyy-MM-d'),
            category: 'especial'
        };

        if($scope.file) {
            BadgeService.post(data).then(function (success) {
                if(success) {
                    mvNotifier.notify('Insignia creada correctamente');
                    getAllBadges({type: 'all', category: 'especial'});
                    $scope.name = "";
                    $scope.file = "";
                    $scope.points = "";
                    $scope.expiresAt = "";
                    $scope.imageSrc = "";
                    $scope.role = "";
                }
                else
                    mvNotifier.error('Ocurrió un error al intentar crear la insignia');
            })
        } else
            mvNotifier.error('Imagen de insginia requerida');
    };

    $scope.deleteBadge = function (id) {
        BadgeService.del({_id: id}).then(function (success) {
            if(success) {
                mvNotifier.notify('Insignia eliminada correctamente');
                getAllBadges({type: 'all', category: 'especial'});
            }
        })
    };

    function getAllBadges(query) {
        BadgeService.get(query).then(function (data) {
            if(data) {
                $scope.badges = data;
            }
        })
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