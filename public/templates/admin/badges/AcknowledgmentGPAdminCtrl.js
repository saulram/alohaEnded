/**
 * Created by Mordekaiser on 15/11/16.
 */
"use strict";
angular.module('valora')
    .controller('AcknowledgmentGPAdminCtrl', ['$scope', 'mvNotifier', 'BadgeService', 'AuthService', 'AcknowledgmentService', AcknowledgmentGPAdminCtrl]);

function AcknowledgmentGPAdminCtrl($scope, mvNotifier, BadgeService, AuthService, AcknowledgmentService) {
    getAllBadges({type: 'all', category: 'grupo presidente'});
    AuthService.get({type: 'byAdmin'}).then(function (data) {
        if(data.success) {
            $scope.collaborators = data.users;
        }
    });

    $scope.acknowledge = function () {
        var data = {
            badgeSlug: $scope.badgeSelected.slug,
            sender_id: 'grupo presidente',
            receiver_id: $scope.collaboratorSelected._id,
            badgePoints: $scope.badgeSelected.points
        };

        AcknowledgmentService.post(data).then(function (success) {
            if(success) {
                mvNotifier.notify('Insignia otorgada exitosamente');
                $scope.badgeSelected = "";
                $scope.collaboratorSelected = "";
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
}