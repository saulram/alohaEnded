/**
 * Created by Latin on 4/21/2017.
 */
'use strict';
angular.module('valora')
    .controller('FeedsCtrl', ['$scope', 'FeedService', 'mvNotifier', FeedsCtrl]);

function FeedsCtrl($scope, FeedService, mvNotifier) {
    getFeeds({});

    $scope.moreData = function () {
        var query = {
            lastId: $scope.lastId
        };

        getFeeds(query);
    };

    $scope.deletePublication = function (id) {
        var query = {
            _id: id
        };

        FeedService.deleteFeed(query).then(function (success) {
            if(success) {
                mvNotifier.notify('Publicación borrada exitosamente');
                getFeeds({});
            }
            else
                mvNotifier.error('No se pudo borrar la publicación.')
        })
    };

    $scope.setOrder = function (model) {
        $scope.orderByModel = model;
    };

    $scope.deleteComment = function (feed_id ,comment_id) {
        var query = {
            feed_id: feed_id,
            comment_id: comment_id
        };
        FeedService.deleteComment(query).then(function (comments) {
            if(comments) {
                mvNotifier.notify('Comentario borrado exitosamente.');
                angular.forEach($scope.feeds, function (feed) {
                    if(feed._id === feed_id)
                        feed.comments = comments;
                });
            } else
                mvNotifier.error('No se pudo borrar el comentario.');
        })
    };

    function getFeeds(query) {
        FeedService.adminGet(query).then(function (data) {
            if(data) {
                var index = data.length;
                if(data[index - 1])
                    $scope.lastId = data[index - 1]._id;

                $scope.feeds = data;
            }
        })
    }
}