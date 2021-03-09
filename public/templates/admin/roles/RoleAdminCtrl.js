/**
 * Created by Mordekaiser on 24/11/16.
 */
"use strict";
angular.module('valora')
    .controller('RoleAdminCtrl', ['$scope', 'mvNotifier', 'UserRolService', RoleAdminCtrl]);

function RoleAdminCtrl($scope, mvNotifier, UserRolService) {
    var query = {
        type: 'byAdmin'
    };

    getCollaborators(query);

    $scope.assignAdmin = function(id) {
        UserRolService.put({_id: id, action: 'add'}).then(function (success) {
            if(success) {
                mvNotifier.notify('Role cambiado exitosamente');
                getCollaborators();
            }
        })
    };

    $scope.deleteAdmin = function (id) {
        UserRolService.put({_id: id, action: 'remove'}).then(function (success) {
            if(success) {
                mvNotifier.notify('Role cambiado exitosamente');
                getCollaborators();
            }
        })
    };

    $scope.viewMore = function () {
        var query = {};

        if(typeof $scope.lastId !== 'undefined') {
            query.lastId = $scope.lastId;
        }
        getCollaborators(query);
    };

    function getCollaborators(query) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');

        UserRolService.get(query).then(function (data) {
            $('#loader').css('display', 'none');
            $('#loaderBackground').css('display', 'none');
            if(data.success) {
                if(typeof data.users !== 'undefined') {
                    $scope.collaborators = data.users;
                    var lastIndex = data.users.length;
                    $scope.lastId = data.users[lastIndex - 1]._id;
                }
            } else {
                mvNotifier.error(data.message);
            }
        })
    }
}