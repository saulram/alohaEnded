/**
 * Created by Mordekaiser on 14/10/16.
 */
"use strict";
angular.module('valora')
    .factory('RewardService', ['$q', '$http', '$location', 'AuthToken', RewardService]);

function RewardService($q, $http, $location, AuthToken) {
    var host = 'https://' + $location.host() + '/';
    var user = AuthToken.getToken();
    var rewards = [];

    return {
        post: post,
        get: get,
        delReward: deleteReward,
        put: put,
        count: getCount,
        setRewards: addToCart,
        getRewards: getCart,
        clearCart: clearCart,
        getExchangedRewards: getMostExchangedRewards,
        postComment: postComment,
        exchangedByDate: exchangedByDate,
        deleteComment: deleteComment
    };

    function post(data) {
        var dfd = $q.defer();

        var fd = new FormData();
        for(var key in data) {
            fd.append(key, data[key]);
        }

        $http({
            method: 'POST',
            url: host + 'api/v1/rewards',
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
            response.success = false;
            dfd.resolve(response);
        });

        return dfd.promise;
    }

    function get(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/rewards',
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

    function deleteReward(query) {
        var dfd = $q.defer();

        //More information about the http service at: https://docs.angularjs.org/api/ng/service/$http
        $http({
            method: 'DELETE',
            url: host + 'api/v1/rewards',
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

    function put(query, data) {
        var dfd = $q.defer();

        var fd = new FormData();
        for(var key in data) {
            fd.append(key, data[key]);
        }

        $http({
            method: 'PUT',
            url: host + 'api/v1/rewards',
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

    function getCount() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/rewards-count',
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

    function getMostExchangedRewards(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/rewards-exchanged-report',
            params: query,
            headers: {
                'Content-Type': 'text/csv;charset=utf-8;',
                'x-access-token': user.token
            }
        }).then(function successCallback(response) {
            if(response.data) {
                dfd.resolve(response.data, response.headers, response.status);
            }
        }, function errorCallback(response) {
            dfd.resolve(response.data);
        });

        return dfd.promise;
    }
    
    function addToCart(id) {
        var index = rewards.indexOf(id);
        if(index > -1)
            rewards.splice(index, 1);
        else
            rewards.push(id)
    }

    function getCart() {
        return rewards;
    }

    function clearCart() {
        rewards = [];
    }

    function postComment(query, data) {
        var dfd = $q.defer();

        $http({
            method: 'POST',
            url: host + 'api/v1/rewards/comments',
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
            dfd.resolve(false);
        });

        return dfd.promise;
    }

    function exchangedByDate(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/rewards/exchanged-by-date',
            params: query,
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

    function deleteComment(query) {
        var dfd = $q.defer();

        $http({
            method: 'DELETE',
            url: host + 'api/v1/rewards/comments',
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
}