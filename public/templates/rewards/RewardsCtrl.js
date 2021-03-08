/**
 * Created by Mordekaiser on 10/10/16.
 */
"use strict";
angular.module('valora')
    .directive('enterPressedReward', enterPressedReward)
    .controller('RewardsCtrl', ['$scope', '$location', 'RewardService', 'WishListService', 'mvNotifier', 'RewardsLikeService', RewardsCtrl]);

function enterPressedReward() {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if(event.which === 13 && scope.myComment) {
                scope.$apply(function () {
                    scope.pushComment(scope.reward._id, scope.myComment);
                    scope.$eval(attrs.enterPressed);
                    scope.myComment = "";
                });

                event.preventDefault();
            }
        })
    }
}

function RewardsCtrl($scope, $location, RewardService, WishListService, mvNotifier, RewardsLikeService) {
    $scope.rewards = "";
    $scope.cart = [];
    $scope.currentPage = 1;
    RewardService.count().then(function (data) {
        $scope.totalPage = data;
        $scope.totalPageArray = new Array(data);
        getRewards({});
    });

    $scope.addToWishList = function (id) {
        WishListService.put({wishList: id}).then(function (success) {
            if(success) {
                mvNotifier.notify('Recompensa agregada a tu lista.');
                getRewards({});
            } else
                mvNotifier.error('Ocurrió un error al intentar agregar la recompensa a tu lista, inténtalo más tarde');
        })
    };

    $scope.removeFromWishList = function (id) {
        WishListService.delfwl({wishList: id}).then(function (success) {
            if(success) {
                mvNotifier.error('Recompensa eliminada de tu lista.');
                getRewards({});
            } else
                mvNotifier.error('Ocurrió un error al intentar agregar la recompensa a tu lista, inténtalo más tarde');
        })
    };

    $scope.addToLikes = function (id) {
        RewardsLikeService.put({likes: id}).then(function (success) {
            if(success) {
                mvNotifier.notify('Recompensa agregada a me gusta.');
                getRewards({});
            } else
                mvNotifier.error('Ocurrió un error al intentar dar me gusta, inténtalo más tarde');
        })
    };

    $scope.removeFromLikes = function (id) {
        RewardsLikeService.delLike({likes: id}).then(function (success) {
            if(success) {
                mvNotifier.error('Esta recompensa ya no te gusta.');
                getRewards({});
            } else
                mvNotifier.error('Ocurrió un error al intentar dar no me gusta, inténtalo más tarde');
        })
    };

    $scope.changePage = function (index) {
        if($scope.currentPage !== index) {
            getRewards({currentPage: index});
            $scope.currentPage = index;
        }
    };

    $scope.nextId = function () {
        if($scope.currentPage < $scope.totalPage) {
            getRewards({lastId: $scope.lastId});
            $scope.currentPage = $scope.currentPage + 1;
        }
    };

    $scope.previousId = function () {
        if($scope.currentPage > 1) {
            getRewards({prevId: $scope.lastId});
            $scope.currentPage = $scope.currentPage -1;
        }
    };

    // adds the rewards to the cart
    $scope.addToCart = function (id) {
        RewardService.setRewards(id);
    };

    $scope.checkout = function () {
        var cart = RewardService.getRewards();
        if(cart.length > 0) {
            $location.path('/checkout');
        } else
            mvNotifier.error('Selecciona al menos una recompensa');
    };

    $scope.openDetails = function (reward) {
        $('#rewardDetails').modal('show');
        $scope.rewardDetails = reward;
    };

    $('#rewardDetails').on('hidden.bs.modal', function (e) {
        $scope.rewardDetails = "";
    });

    $scope.setOrder = function (model) {
        $scope.sortOrder = !$scope.sortOrder;
        $scope.orderByModel = model;
    };

    $scope.isSelected = function(filter) {
        return $scope.orderByModel === filter;
    };


    function getRewards(query) {
        RewardService.get(query).then(function (data) {
            if(data.length > 0) {
                var lastIndex = data.length;
                $scope.lastId = data[lastIndex - 1]._id;
                $scope.rewards = data;
            }
        });
    }

    $scope.pushComment = function (reward_id, comment) {
        var query = {
            reward_id: reward_id
        };
        let data = {
            comment: comment,
            collaboratorName: $scope.myInfo.completeName
        };

        RewardService.postComment(query, data).then(function (comments) {
            if(comments) {
                mvNotifier.notify('Comentario publicado exitosamente');
                angular.forEach($scope.rewards, function (reward) {
                    if(reward._id === reward_id)
                        reward.comments = comments;
                })
            }
        })
    }
}