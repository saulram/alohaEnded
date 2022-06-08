/**
 * Created by Mordekaiser on 09/11/16.
 */
"use strict";
angular.module('valora')
    .factory('DashboardService', ['$q', '$http', '$location', 'AuthToken', DashboardService]);

function DashboardService($q, $http, $location, AuthToken) {
    var host = 'https://' + $location.host() + ':5001/';
    var user = AuthToken.getToken();

    return {
        getGeneralMetrics,
        getActiveUsers,
        getUsersByZone,
        getUsersByLocation,
        getBadgesByZone,
        getBadgesByLocation,
        getValues,
        getCompetences,
        getSpecial,
        getEmbassyValues,
        getEmbassyCompetences
    };

    //Generals
    function getGeneralMetrics(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/dashboard/generals',
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
    function getActiveUsers() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/ambassadors',
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
    function getUsersByZone() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/ambassadors',
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
    function getUsersByLocation() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/ambassadors',
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

    // Badges
    function getBadgesByZone() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/ambassadors',
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
    function getBadgesByLocation() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/ambassadors',
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
    function getValues() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/ambassadors',
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
    function getCompetences() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/ambassadors',
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
    function getSpecial() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/ambassadors',
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
    // Embassies
    function getEmbassyValues() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/ambassadors',
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
    function getEmbassyCompetences() {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/ambassadors',
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