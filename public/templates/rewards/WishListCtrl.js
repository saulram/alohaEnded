/**
 * Created by Mordekaiser on 17/10/16.
 */
"use strict";
angular.module('valora')
    .controller('WishListCtrl', ['$scope', '$location', 'WishListService', 'mvNotifier', WishListCtrl]);

function WishListCtrl($scope, $location, WishListService, mvNotifier) {
    getWishList();
    $scope.removeFromWishList = function (id) {
        WishListService.delfwl({wishList: id}).then(function (success) {
            if(success) {
                mvNotifier.notify('Recompensa eliminada de tu lista.');
                getWishList();
            } else
                mvNotifier.error('Ocurrió un error al intentar agregar la recompensa a tu lista, inténtalo más tarde');
        })
    };

    function getWishList() {
        $scope.myRewards = "";
        WishListService.get().then(function (data) {
            if(data) {
                $scope.myRewards = data;
            }
        });
    }
}