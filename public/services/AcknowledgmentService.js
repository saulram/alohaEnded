/**
 * Created by Mordekaiser on 09/11/16.
 */
"use strict";
angular.module('valora')
    .factory('AcknowledgmentService', ['$q', '$http', '$location', 'AuthToken', AcknowledgmentService]);

function AcknowledgmentService($q, $http, $location, AuthToken) {
    var host = 'http://' + $location.host() + ':5001/';
    var user = AuthToken.getToken();

    return {
        post: post,
        get: get,
        getAmbassadors: getAmbassadors,
        getReport: getReport,
        getBadgeAcknowledgments: getBadgeAcknowledgments,
        getSenders: getSenders
    };

    function post(data) {
        var dfd = $q.defer();

        $http({
            method: 'POST',
            url: host + 'api/v1/acknowledgments',
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
            dfd.resolve(response.data);
        });

        return dfd.promise;
    }

    function get(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/acknowledgments',
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

    function getAmbassadors() {
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

    function getReport(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/acknowledgments/report',
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

    function getBadgeAcknowledgments(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/acknowledgments-report',
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

    function getSenders(query) {
        var dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/acknowledgments-senders',
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