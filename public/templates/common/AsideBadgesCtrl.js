'use strict';
angular.module('valora')
    .controller('AsideBadgesCtrl', ['$scope', 'mvNotifier', 'AuthToken', 'AcknowledgmentService', AsideBadgesCtrl]);

function AsideBadgesCtrl($scope, mvNotifier, AuthToken, AcknowledgmentService) {
    var user = AuthToken.getToken();
    $scope.closeSenderModal = function () {
        $scope.senders = [];
    };

    $scope.openSenderModal = function (badgeSlug) {
        AcknowledgmentService.getSenders({badgeSlug: badgeSlug}).then(function (response) {
            if(response.success) {
                $scope.senders = response.users;
                $('#senderModal').modal('show');
            }
        })
    };

    if(user != null) {
        $scope.myBadgesColumn = [];
        $scope.myEmbassysColumn = [];
        $scope.emabssysNameColumn = [];

        // gets the ambassadors
        AcknowledgmentService.getAmbassadors().then(function (ambassadors) {
            angular.forEach(ambassadors, function (ambassador, key) {
                if(ambassador.employeeNumber === user.employeeNumber) {
                    $scope.myEmbassysColumn.push(ambassador);
                    $scope.emabssysNameColumn.push(ambassador.badgeName);
                }
            });
            // gets all my badges
            AcknowledgmentService.get().then(function (myBadges) {
                if(myBadges.success) {
                    angular.forEach(myBadges.badges, function (myBadge, key) {
                        if($scope.emabssysNameColumn.indexOf(myBadge.badgeName) === -1)
                            if(myBadge.category === 'valor' || myBadge.category === 'competencias')
                                $scope.myBadgesColumn.push(myBadge);
                    });
                } else {
                    mvNotifier.notify(myBadges.message);
                }
            });
        });
    }
}