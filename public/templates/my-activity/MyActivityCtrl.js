/**
 * Created by Mordekaiser on 21/11/16.
 */
"use strict";
angular.module('valora')
    .controller('MyActivityCtrl', ['$scope', 'FeedService', 'mvNotifier', '$state', 'NotificationService', MyActivityCtrl]);

function MyActivityCtrl($scope, FeedService, mvNotifier, $state, NotificationService) {
    getFeeds();

    $scope.viewDetails = function (notification) {
        if(typeof notification !== 'undefined') {

            NotificationService.put(notification._id);

            $state.go('myActivityDetails', { notificationTitle: notification.message, _id: notification.feed_id });
        }
    };

    function getFeeds() {
        FeedService.getMyActivity().then(function (data) {
            if(data.success) {
                $scope.notifications = data.notifications;
            }
        });
    }
}