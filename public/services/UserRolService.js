'use strict';
angular.module('valora')
    .factory('UserRolService', ['$q', '$http', '$location', 'AuthToken', UserRolService]);

function UserRolService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + '/';
    var user = AuthToken.getToken();

    return {
        get: get,
        put: put
    };

    function get(query) {
        var dfd = $q.defer();
        $http({
            method: 'GET',
            url: host + 'api/v1/users-roles',
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
            dfd.resolve(response.data);
        });

        return dfd.promise;
    }

    function put(query) {
        var dfd = $q.defer();

        $http({
            method: 'PUT',
            url: host + 'api/v1/users-roles',
            params: query,
            headers: {
                'Content-Type': 'application/json',
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
}