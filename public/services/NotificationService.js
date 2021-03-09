'use strict';
angular.module('valora')
    .factory('NotificationService', ['$q', '$http', '$location', 'AuthToken', NotificationService]);

function NotificationService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + '/';
    var user = AuthToken.getToken();

    return {
        put: put
    };

    function put(_id) {
        var dfd = $q.defer();

        $http({
            method: 'PUT',
            url: host + 'api/v1/notifications/' + _id,
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