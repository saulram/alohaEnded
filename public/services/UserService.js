'use strict';
angular.module('valora')
    .factory('UserService', ['$q', '$http', '$location', 'AuthToken', UserService]);

function UserService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + ':5001/';
    var user = AuthToken.getToken();

    return {
        getActiveCollaborators: getActiveCollaborators,
        getTemporal: getTemporalPass,
        activateCollaborator: activateCollaborator
    };

    function getActiveCollaborators(query) {
        var dfd = $q.defer();
        $http({
            method: 'GET',
            url: host + 'api/v1/user-active',
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

    function getTemporalPass(query) {
        var dfd = $q.defer();
        $http({
            method: 'GET',
            url: host + 'api/v1/user-temporal',
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

    function activateCollaborator(_id) {
        var dfd = $q.defer();

        $http({
            method: 'PUT',
            url: host + 'api/v1/user-active/' + _id,
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
}