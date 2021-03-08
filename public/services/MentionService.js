'use strict';
angular.module('valora')
    .factory('MentionService', ['$q', '$http', '$location', 'AuthToken', MentionService]);

function MentionService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + '/';
    var user = AuthToken.getToken();

    return {
        post: post,
        get: get,
        getById: getById,
        put: put,
        del: del
    };

    function post(data) {
        var dfd = $q.defer();

        $http({
            method: 'POST',
            url: host + 'api/v1/mention',
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
            response.success = false;
            dfd.resolve(response.data);
        });

        return dfd.promise;
    }

    function get(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/mention',
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

    function getById(_id) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/mention/' + _id,
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data.success) {
                dfd.resolve(response.data);
            }
        }, function errorCallback() {
            dfd.resolve(false);
        });

        return dfd.promise;
    }

    function put(_id, data) {
        var dfd = $q.defer();

        $http({
            method: 'PUT',
            url: host + 'api/v1/mention/' + _id,
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

    function del(query) {
        var dfd = $q.defer();

        $http({
            method: 'DELETE',
            url: host + 'api/v1/mention/' + query._id,
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