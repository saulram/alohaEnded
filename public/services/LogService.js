/**
 * Created by latin on 1/5/2017.
 */
"use strict";
angular.module('valora')
    .factory('LogService', ['$q', '$http', '$location', 'AuthToken', LogService]);

function LogService($q, $http, $location, AuthToken) {
    var host = 'https://' + $location.host() + '/';
    var user = AuthToken.getToken();

    return {
        get: get,
        generalReport: generalReport,
        getIntelexionLog: getIntelexionLog
    };

    function get(query) {
        let dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/logs',
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

    function generalReport(query) {
        let dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/users-report',
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

    function getIntelexionLog(query) {
        let dfd = $q.defer();

        $http({
            method: 'GET',
            url: host + 'api/v1/intelexion-logs',
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