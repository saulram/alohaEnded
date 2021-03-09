/**
 * Created by Mordekaiser on 11/10/16.
 */
"use strict";
angular .module('valora').factory('mvIdentity', function (mvUser, AuthToken) {
    var currentUser;
    // if there is a token, we get the user
    if(AuthToken.getToken()) {
        currentUser = new mvUser();
        angular.extend(currentUser, AuthToken.getToken());
    }
    return {
        currentUser: currentUser,
        isAuthenticated: function () {
            return !!this.currentUser;
        },
        isAuthorized: function (role) {
            return !!this.currentUser && this.currentUser.roles.indexOf(role) > -1;
        }
    }
});