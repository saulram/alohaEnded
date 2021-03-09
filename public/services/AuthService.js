/**
 * Created by Mordekaiser on 11/10/16.
 */
"use strict";
angular.module('valora')
    .factory('AuthService', ['$q', '$http', '$location', 'AuthToken', AuthService]);

function AuthService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + '/';
    var user = AuthToken.getToken();

    return {
        authenticate: loginUser,
        get: getUserByName,
        put: putProfileImg,
        putPass: putPass,
        forgottenPass: forgottenPass
    };

    function loginUser(query) {
        var dfd = $q.defer();
        $http({
            method: 'POST',
            url: host + 'api/v1/login',
            params: query,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function successCallback(response) {
            if(response.data.success) {
                // set the token and the user to local storage
                AuthToken.setToken(response.data);
                // set the points to global variable
                AuthToken.setPoints(response.data.points);
                dfd.resolve(response.data);
            }
        }, function errorCallback(response) {
            dfd.resolve(response.data);
        });

        return dfd.promise;
    }

    function getUserByName(query) {
        var dfd = $q.defer();
        $http({
            method: 'GET',
            url: host + 'api/v1/users',
            params: query,
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data.success) {
                dfd.resolve(response.data);
            }
        }, function errorCallback(response) {
            dfd.resolve(response.data);
        });

        return dfd.promise;
    }

    function putProfileImg(data) {
        var dfd = $q.defer();

        var fd = new FormData();
        for(var key in data) {
            fd.append(key, data[key]);
        }

        $http({
            method: 'PUT',
            url: host + 'api/v1/users',
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

    function putPass(data) {
        var dfd = $q.defer();

        $http({
            method: 'PUT',
            url: host + 'api/v1/users-pass',
            data: data,
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data.success) {
                dfd.resolve(response.data);
            }
        }, function errorCallback(response) {
            dfd.resolve(response.data);
        });

        return dfd.promise;
    }

    function forgottenPass(query) {
        var dfd = $q.defer();
        $http({
            method: 'GET',
            url: host + 'api/v1/users-forgotten-pass',
            params: query,
            headers: {
                'Content-Type': 'application/json'
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