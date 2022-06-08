/**
 * Created by Mordekaiser on 17/10/16.
 */
"use strict";
angular.module('valora')
    .factory('RewardsLikeService', ['$q', '$http', '$location', 'AuthToken', RewardsLikeService]);

function RewardsLikeService($q, $http, $location, AuthToken) {
    var host = 'https://' + $location.host() + '/';
    var user = AuthToken.getToken();
    return {
        put: put,
        delLike: deleteRewardsLike,
        getLikesReport: getLikesReport
    };

    function put(data) {
        var dfd = $q.defer();

        $http({
            method: 'PUT',
            url: host + 'api/v1/rewards-like',
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

    function deleteRewardsLike(data) {
        var dfd = $q.defer();

        $http({
            method: 'DELETE',
            url: host + 'api/v1/rewards-like',
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

    function getLikesReport(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/rewards-like-report',
            params: query,
            headers: {
                'Content-Type': 'text/csv;charset=utf-8;',
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data) {
                dfd.resolve(response.data, response.headers, response.status);
            }
        }, function errorCallback(response) {
            dfd.resolve(response.data);
        });

        return dfd.promise;
    }
}