/**
 * Created by Mordekaiser on 27/09/16.
 */
"use strict";
angular.module('valora')
    .factory('AuthToken', ['$window', AuthToken]);

function AuthToken($window) {
    var storage = $window.localStorage;
    var cachedToken;
    var userToken = 'userToken';
    var cachedPoints;
    var points = 'points';

    var AuthToken = {
        setToken: function(token) {
            cachedToken = token;
            storage.setItem(userToken, angular.toJson(token));
        },
        getToken: function() {
            if(!cachedToken)
                cachedToken = storage.getItem(userToken);

            if(typeof cachedToken == 'string')
                return JSON.parse(cachedToken);
            else
                return cachedToken;
        },
        isAuthenticated: function() {
            return !!this.getToken();
        },
        isAuthorized: function (role) {
            var user = this.getToken()
            return !!user && user.roles.indexOf(role) > -1;
        },
        removeToken: function() {
            cachedToken = null;
            storage.removeItem(userToken);
        },
        setPoints: function (data) {
            cachedPoints = data;
            storage.setItem(points, angular.toJson(data));
        },
        getPoints: function () {
            if(!cachedPoints)
                cachedPoints = storage.getItem(points);

            if(typeof cachedPoints == 'string')
                return JSON.parse(cachedPoints);
            else
                return cachedPoints;
        },
        removePoints: function() {
            cachedPoints = null;
            storage.removeItem(points);
        }
    };

    return AuthToken;
}