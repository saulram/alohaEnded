'use strict';
angular.module('valora')
    .factory('LocationService', ['$q', '$http', '$location', 'AuthToken', LocationService]);

function LocationService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + '/';
    var user = AuthToken.getToken();

    return {
        get: get
    };

    function get(query) {
        var dfd = $q.defer();
        $http({
            method: 'GET',
            url: host + 'api/v1/location',
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