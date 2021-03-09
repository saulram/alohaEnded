'use strict';

angular.module('valora')
    .directive('enterPressed', enterPressed)
    .controller('FeedBlockCtrl', ['$scope', 'mvNotifier', 'AuthToken', '$timeout', '$location', '$window', '$rootScope',
        'FeedService', 'fileReader', 'AuthService', FeedBlockCtrl]);

function enterPressed() {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if(event.which === 13 && scope.feed.newComment && (scope.feed.newComment.length <= 114)
              && (scope.feed.newComment.length > 2)) {
                scope.$apply(function () {
                    scope.pushComment(scope.feed._id, scope.feed.newComment);
                    scope.$eval(attrs.enterPressed);
                    scope.feed.newComment = "";
                });

                event.preventDefault();
            }
        })
    }
}

function FeedBlockCtrl($scope, mvNotifier, AuthToken, $timeout, $location, $window, $rootScope,
                  FeedService, fileReader, AuthService) {
    var writePromise;
    $scope.openComments = true;
    $scope.searchNameActive = false;
    $scope.searchName = '';
    $scope.newComment = '';
    $scope.atIndex = -1;
    $scope.mentionNames = [];

    $scope.pushComment = function (feed_id, comment, feed) {
        $scope.currentFeed = feed;
        var query = {
            feed_id: feed_id
        };
        let data = {
            comment: comment,
            collaboratorName: $scope.myInfo.completeName
        };

        angular.forEach($scope.mentionNames, function (value, key) {
            if(comment.indexOf(value) === -1) {
                $scope.mentionNames.splice(key, 1);
            }
        });

        if($scope.mentionNames.length > 0) {
            data.mentionNames = $scope.mentionNames;
        }

        FeedService.postComment(query, data).then(function (data) {
            if(data.success) {
                mvNotifier.notify('Comentario publicado exitosamente');
                angular.forEach($scope.feeds, function (feedItem) {
                    if(feedItem._id === feed_id) {
                        feedItem.comments = data.comments;
                    }
                });
                if (typeof $scope.currentFeed.newComment !== 'undefined') {
                    $scope.currentFeed.newComment = '';
                }
                $scope.mentionNames = [];
            } else {
                mvNotifier.notify(data.message);
            }
        })
    };

    $scope.searchCollaborator = function (text, feed, index) {
        if(writePromise) {
            // console.log('cancel promise');
            $timeout.cancel(writePromise);
        }

        if(text.indexOf('@') > -1) {
            $scope.mentionArray = text.split('@');
            $scope.currentFeed = feed;

            if(typeof $scope.mentionArray[$scope.mentionArray.length - 1] !== 'undefined') {
                $scope.atIndex = text.lastIndexOf('@');
                $scope.tempComment = text;
                writePromise = $timeout(search($scope.mentionArray[$scope.mentionArray.length - 1]),1000);
            }
        } else {
            $scope.mentionIds = [];
        }
    };

    function search(text) {
        return new Promise((resolve, reject) => {
            var query = {
                type: 'byCompleteName',
                completeName: text
            };

            AuthService.get(query).then(function (data) {
                if(data.success) {
                    $scope.currentFeed.usersModalActive = true;
                    $scope.collaborators = data.users;
                    resolve();
                } else {
                    $scope.collaboratorsModalIsActive = false;
                    reject();
                }
            })
        })
    }

    $scope.pasteCollaborator = function (collaborator) {
        $scope.mentionNames.push(collaborator.completeName);
        $scope.currentFeed.newComment = $scope.tempComment.replaceAt($scope.atIndex + 1, collaborator.completeName);
        $scope.atIndex = -1;
        $scope.currentFeed.usersModalActive = false;
        $scope.mentionArray = 'undefined';
        $scope.collaborators = [];
    };

    String.prototype.replaceAt = function (index, replacement) {
        return this.substring(0, index) + replacement + this.substring(index + replacement.length);
    };

    $scope.closeCollaboratorsList = function (feed) {
        $scope.currentFeed = feed;
        $scope.currentFeed.usersModalActive = false;
    }
}