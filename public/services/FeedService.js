/**
 * Created by Mordekaiser on 10/11/16.
 */
"use strict";
angular.module('valora')
    .factory('FeedService', ['$q', '$http', '$location', 'AuthToken', FeedService]);

function FeedService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + '/';
    var user = AuthToken.getToken();

    return {
        get: get,
        putLikeFeed: putLikeFeed,
        delLike: delLike,
        getLikeCollaborators: getLikeCollaborators,
        getMyActivity: getMyActivity,
        adminGet: getForAdmin,
        deleteFeed: deleteFeed,
        postComment: postComment,
        deleteComment: deleteComment,
        getById: getById
    };

    function get(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/feeds',
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

    function putLikeFeed(query) {
        var dfd = $q.defer();

        $http({
            method: 'PUT',
            url: host + 'api/v1/feeds-like',
            params: query,
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

    function delLike(query) {
        var dfd = $q.defer();

        $http({
            method: 'DELETE',
            url: host + 'api/v1/feeds-like',
            params: query,
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

    function getLikeCollaborators(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/feeds-like-collaborator',
            params: query,
            headers: {
                'Content-Type': 'text/csv;charset=utf-8;',
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

    function getMyActivity() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/my-activity',
            headers: {
                'Content-Type': 'text/csv;charset=utf-8;',
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

    function getForAdmin(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/admin/feeds',
            params: query,
            headers: {
                'Content-Type': 'text/csv;charset=utf-8;',
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

    function deleteFeed(query) {
        var dfd = $q.defer();

        $http({
            method: 'DELETE',
            url: host + 'api/v1/admin/feeds',
            params: query,
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

    function postComment(query, data) {
        var dfd = $q.defer();

        $http({
            method: 'POST',
            url: host + 'api/v1/feeds/comments',
            params: query,
            data: data,
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

    function deleteComment(query) {
        var dfd = $q.defer();

        $http({
            method: 'DELETE',
            url: host + 'api/v1/feeds/comments',
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

    function getById(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/feeds/' + query.feed_id,
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
}