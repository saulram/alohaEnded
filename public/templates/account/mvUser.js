/**
 * Created by Mordekaiser on 11/10/16.
 */
"use strict";
angular.module('valora').factory('mvUser', function ($resource) {
    var UserResource = $resource('/api/users/:id', {_id: "@id"});

    UserResource.prototype.isAdmin = function () {
        return this.roles && this.roles.indexOf('admin') > -1;
    };

    return UserResource;
});