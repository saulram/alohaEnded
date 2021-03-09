/**
 * Created by Mordekaiser on 17/10/16.
 */
"use strict";
angular.module('valora')
    .factory('WishListService', ['$q', '$http', '$location', 'AuthToken', WishListService]);

function WishListService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + ':5001/';
    var user = AuthToken.getToken();
    return {
        put: put,
        delfwl: deleteFromWishList,
        get: get
    };

    function put(data) {
        var dfd = $q.defer();

        $http({
            method: 'PUT',
            url: host + 'api/v1/wish-list',
            data: data,
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data.success) {
                dfd.resolve(true);
            }
        }, function errorCallback() {
            dfd.resolve(false);
        });

        return dfd.promise;
    }

    function deleteFromWishList(data) {
        var dfd = $q.defer();

        $http({
            method: 'DELETE',
            url: host + 'api/v1/wish-list',
            data: data,
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data.success) {
                dfd.resolve(true);
            }
        }, function errorCallback() {
            dfd.resolve(false);
        });

        return dfd.promise;
    }

    function get() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/wish-list',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data) {
                dfd.resolve(response.data);
            }
        }, function errorCallback() {
            dfd.resolve(false);
        });

        return dfd.promise;
    }
}