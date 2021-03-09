/**
 * Created by Mordekaiser on 02/11/16.
 */
"use strict";
angular.module('valora')
    .factory('BadgeService', ['$q', '$http', '$location', 'AuthToken', BadgeService]);

function BadgeService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + ':5001/';
    var user = AuthToken.getToken();

    return {
        post: post,
        get: get,
        put: put,
        del: deleteBadge,
        totalPtsReport: totalPtsReport,
        groupPoints: groupPoints
    };

    function post(data) {
        var dfd = $q.defer();

        var fd = new FormData();
        for(var key in data) {
            fd.append(key, data[key]);
        }

        $http({
            method: 'POST',
            url: host + 'api/v1/badges',
            data: fd,
            transformRequest: angular.indentity,
            headers: {
                'Content-Type': undefined,
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data.success) {
                dfd.resolve(true);
            }
        }, function errorCallback(response) {
            dfd.resolve(false);
        });

        return dfd.promise;
    }

    function get(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/badges',
            params: query,
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

    function put(query, data) {
        var dfd = $q.defer();

        var fd = new FormData();
        for(var key in data) {
            fd.append(key, data[key]);
        }

        $http({
            method: 'PUT',
            url: host + 'api/v1/badges',
            params: query,
            data: fd,
            transformRequest: angular.indentity,
            headers: {
                'Content-Type': undefined,
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data.success) {
                dfd.resolve(true);
            }
        }, function errorCallback(response) {
            dfd.resolve(false);
        });

        return dfd.promise;
    }

    function deleteBadge(query) {
        var dfd = $q.defer();

        $http({
            method: 'DELETE',
            url: host + 'api/v1/badges',
            params: query,
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            response.success = true;
            dfd.resolve(response);
        }, function errorCallback(response) {
            dfd.resolve(response);
        });

        return dfd.promise;
    }

    function totalPtsReport(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/users-badges-points',
            params: query,
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

    function groupPoints(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/badges-group',
            params: query,
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data) {
                dfd.resolve(response.data);
            }
        }, function errorCallback(response) {
            dfd.resolve(response.data);
        });

        return dfd.promise;
    }
}