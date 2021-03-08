/**
 * Created by Mordekaiser on 13/10/16.
 */
"use strict";
angular.module('valora')
    .controller('HomeCtrl', ['$scope', 'mvNotifier', 'AuthToken', '$timeout', '$location', '$window', '$rootScope',
        'FeedService', 'fileReader', 'AuthService', '$state', 'MentionService', HomeCtrl]);

function HomeCtrl($scope, mvNotifier, AuthToken, $timeout, $location, $window, $rootScope,
                  FeedService, fileReader, AuthService, $state, MentionService) {
    $scope.identity = AuthToken;
    $scope.feeds = [];
    $scope.myActivitiesCount = 0;
    var user = AuthToken.getToken();

    if(user !== null) {
        getMentionList();
        updateCollaboratorInfo();
    }


    $('#videoModal').on('hide.bs.modal', function (e) {
        const video = $("#playerid").attr("src");
        $("#playerid").attr("src","");
        $("#playerid").attr("src",video);
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(user) {
            myActivitiesCount();
        }
        if(user && !user.passChanged) {
            $state.go('passChange');
        }
        if(user != null && toState.name === "home") {
            $('#videoModal').modal('show');
            $scope.feeds = [];
            updateCollaboratorInfo();
            getFeeds({});
        }
    });

    $scope.isAdmin = function() {
        return $location.path().indexOf('/admin') > -1;
    };

    $scope.isLogin = function () {
        return $location.path().indexOf('/login') > -1;
    };

    $scope.logout = function() {
        mvNotifier.error('Sesión finalizada');
        AuthToken.removeToken();
        $timeout(function(){
            $location.path('/');
            $window.location.reload();
        },300);
    };

    $scope.addToLikes = async function (id) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        await FeedService.putLikeFeed({feed_id: id}).then(function (success) {
            if(success) {
                getFeeds({type: 'byFeedId', _id: id});
            } else
                mvNotifier.error('Ocurrió un error al intentar dar me gusta, inténtalo más tarde');
        })
    };

    $scope.removeFromLikes = function (id) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        FeedService.delLike({feed_id: id}).then(function (success) {
            if(success) {
                getFeeds({type: 'byFeedId', _id: id});
            } else
                mvNotifier.error('Ocurrió un error al intentar dar no me gusta, inténtalo más tarde');
        })
    };

    $scope.changeImg = function () {
        if($scope.file) {
            AuthService.put({image: $scope.file}).then(function (success) {
                if(success) {
                    mvNotifier.notify('Imagen cambiada correctamente');
                    updateCollaboratorInfo();
                    $scope.imageSrc = "";
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
    };

    $scope.viewMore = function () {
        if($scope.feedLastId)
            getFeeds({_id: $scope.feedLastId});
        else
            mvNotifier.error('No hay más actividades');
    };

    $scope.setLocationValue = function (location) {
        $scope.locationFilter = {location: location};
        $scope.selected = location;
    };

    $scope.isSelected = function(location) {
        return $scope.selected === location;
    };

    $scope.openLikeModal = function (feed_id) {
        FeedService.getLikeCollaborators({_id: feed_id}).then(function (data) {
            if(data) {
                $scope.likeCollaborators = data;
                $('#likeModal').modal('show');
            }
        });
    };

    $scope.closeLikeModal = function () {
        $scope.likeCollaborators = [];
    };

    function updateCollaboratorInfo() {
        // gets the dynamic information of the collaborator
        AuthService.get({type: 'byCollaborator'}).then(function (data) {
            if(data.success) {
                $scope.myInfo = {
                    completeName: data.users[0].completeName,
                    employeeNumber: data.users[0].employeeNumber,
                    upgrade: data.users[0].upgrade,
                    profileImage: data.users[0].profileImage,
                    points: data.users[0].points,
                    location: data.users[0].location
                };
            } else {
                mvNotifier.notify(data.message);
            }
        });
    }

    function getMentionList() {
        MentionService.get({}).then(function (data) {
            if(data.success) {
                $scope.mentions = data.mentions;
            }
        })
    }

    function getFeeds(query) {
        FeedService.get(query).then(function (data) {
            if(data.success) {
                // clear the scope so it doesn't duplicate data
                if(!query._id) {
                    $scope.feeds = [];
                }

                var index = data.feeds.length;
                // only save the last index if view more was click
                if(data.feeds[index - 1] && query.type !== 'byFeedId') {
                    $scope.feedLastId = data.feeds[index - 1]._id;
                }
                // if was a like update, only replace the feed
                if(query.type === 'byFeedId') {
                    angular.forEach($scope.feeds, function (feed, key) {
                        if(feed._id === data.feeds[0]._id) {
                            $scope.feeds[key] = data.feeds[0];
                        }
                    })
                } else {
                    angular.forEach(data.feeds, function (feed, key) {
                        $scope.feeds.push(feed);
                    })
                }
                $('#loader').css('display', 'none');
                $('#loaderBackground').css('display', 'none');
            }
        });
    }

    function myActivitiesCount() {
        FeedService.getMyActivity().then(function (data) {
            if(data.success) {
                $scope.myActivitiesCount = data.notifications.filter(function (notification) {
                    if(!notification.isRead) {
                        return notification;
                    }
                })
            }
        });
    }
}