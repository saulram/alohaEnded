'use strict';
angular.module('valora')
    .factory('FeedMessageService', ['$q', '$http', '$location', 'AuthToken', FeedMessageService]);

function FeedMessageService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + ':5001/';
    var user = AuthToken.getToken();

    return {
        post: post
    };

    function post(data) {
        var dfd = $q.defer();

        $http({
            method: 'POST',
            url: host + 'api/v1/feed-message',
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
            dfd.resolve(false);
        });

        return dfd.promise;
    }
}