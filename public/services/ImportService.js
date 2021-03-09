/**
 * Created by Mordekaiser on 24/10/16.
 */
"use strict";
angular.module('valora')
    .factory('ImportService', ['$q', '$http', '$location', 'AuthToken', ImportService]);

function ImportService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + ':5001/';
    var user = AuthToken.getToken();

    return {
        post: post,
        postCollaborators: postCollaborators,
        deleteCollaborators: deleteCollaborators
    };

    function post(query, data) {
        var dfd = $q.defer();

        var fd = new FormData();
        for(var key in data) {
            fd.append(key, data[key]);
        }

        $http({
            method: 'POST',
            url: host + 'api/v1/imports',
            params: query,
            data: fd,
            transformRequest: angular.indentity,
            headers: {
                'Content-Type': undefined,
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data.success) {
                dfd.resolve(response.data);
            }
        }, function errorCallback(response) {
            dfd.resolve(false);
        });

        return dfd.promise;
    }

    function postCollaborators(query, data) {
        var dfd = $q.defer();

        var fd = new FormData();
        for(var key in data) {
            fd.append(key, data[key]);
        }

        $http({
            method: 'POST',
            url: host + 'api/v1/import-collaborators',
            params: query,
            data: fd,
            transformRequest: angular.indentity,
            headers: {
                'Content-Type': undefined,
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data.success) {
                dfd.resolve(response.data);
            }
        }, function errorCallback(response) {
            dfd.resolve(false);
        });

        return dfd.promise;
    }

    function deleteCollaborators(data) {
        var dfd = $q.defer();

        var fd = new FormData();
        for(var key in data) {
            fd.append(key, data[key]);
        }

        $http({
            method: 'DELETE',
            url: host + 'api/v1/import-collaborators',
            data: fd,
            transformRequest: angular.indentity,
            headers: {
                'Content-Type': undefined,
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data.success) {
                dfd.resolve(response.data);
            }
        }, function errorCallback(response) {
            dfd.resolve(false);
        });

        return dfd.promise;
    }
}