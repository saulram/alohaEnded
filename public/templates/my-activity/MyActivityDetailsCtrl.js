'use strict';
angular.module('valora')
    .controller('MyActivityDetailsCtrl', ['$scope', 'FeedService', 'mvNotifier', '$stateParams', MyActivityDetailsCtrl]);

function MyActivityDetailsCtrl($scope, FeedService, mvNotifier, $stateParams) {
    if($stateParams._id) {
        const query = {
            feed_id: $stateParams._id,
        };
        if(typeof $stateParams.notificationTitle !== 'undefined' && $stateParams.notificationTitle !== '') {
            $scope.notificationTitle = $stateParams.notificationTitle;
        }
        getFeedById(query);
    } else {
        mvNotifier.error('Url incorrecta');
    }

    function getFeedById(query) {
        FeedService.getById(query).then(function (data) {
            if(data.success) {
                $scope.feed = data.feed;
            } else {
                mvNotifier.notify(data.message);
            }
        })
    }
}