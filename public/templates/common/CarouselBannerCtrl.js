/**
 * Created by Mordekaiser on 06/10/16.
 */
"use strict";
angular.module('valora')
    .controller('CarouselBannerCtrl', ['$scope', 'BannerService', 'AuthToken', CarouselBannerCtrl]);

function CarouselBannerCtrl($scope, BannerService, AuthToken) {
    var user = AuthToken.getToken();
    if(user) {
        BannerService.get({}).then(function (data) {
            if(data.success) {
                $scope.banners = data.banners;
            }
        })
    }
}