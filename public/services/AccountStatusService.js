/**
 * Created by Mordekaiser on 24/10/16.
 */
"use strict";
angular.module('valora')
    .factory('AccountStatusService', ['$q', '$http', '$location', 'AuthToken', AccountStatusService]);

function AccountStatusService($q, $http, $location, AuthToken) {
    var host = 'https://' + $location.host() + '/';
    const user = AuthToken.getToken();
    return {
        post: post,
        getAccountRewards: getAccountRewards,
        get: getAccountStatus,
        put: put,
        getByAdmin: getAccountStatusByLocation,
        putPreferences: putPreferences,
        getPreferences: getPreferences,
        getHistoryPoints: getHistoryPoints
    };

    function post(data) {
        var dfd = $q.defer();

        $http({
            method: 'POST',
            url: host + 'api/v1/account-status',
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
            dfd.resolve(response);
        });

        return dfd.promise;
    }

    function getAccountRewards(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/account-rewards',
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

    function put(query, data) {
        var dfd = $q.defer();

        $http({
            method: 'PUT',
            url: host + 'api/v1/account-status',
            params: query,
            data: data,
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

    function getAccountStatus(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/account-status',
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

    function getAccountStatusByLocation() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/account-rewards-location',
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

    function putPreferences(data) {
        let dfd = $q.defer();

        $http({
            method: 'PUT',
            url: host + 'api/v1/user-preferences',
            data: data,
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

    function getPreferences() {
        let dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/user-preferences',
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

    function getHistoryPoints(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/account-history-points',
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
}