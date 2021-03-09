'use strict';
angular.module('valora')
    .controller('ActiveCollaboratorsCtrl', ['$scope', 'UserService', 'mvNotifier', 'AuthToken', ActiveCollaboratorsCtrl]);

function ActiveCollaboratorsCtrl($scope, UserService, mvNotifier, AuthToken) {
    var user = AuthToken.getToken();
    $scope.getCollaborators = function () {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        var query = {
            webApp: 'valora'
        };

        if(typeof $scope.type !== 'undefined') {
            query.webApp = $scope.type;
        }

        if(user.roles.indexOf('admin') > -1) {
            query.location = user.location;
        }

        UserService.getActiveCollaborators(query).then(function (data) {
            if(data.success) {
                $scope.users = data.users;
            } else {
                mvNotifier.error(data.message);
            }

            $('#loader').css('display', 'none');
            $('#loaderBackground').css('display', 'none');
        })
    };

    $scope.csvCollaborators = function () {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        var query = {
            webApp: 'valora',
            type: 'csv'
        };

        if(typeof $scope.type !== 'undefined') {
            query.webApp = $scope.type;
        }

        if(user.roles.indexOf('admin') > -1) {
            query.location = user.location;
        }

        UserService.getActiveCollaborators(query).then(function (data) {
            if(data) {
                if (window.navigator.msSaveOrOpenBlob) {
                    var blob = new Blob([decodeURIComponent(encodeURI(data))], {
                        type: "text/csv;charset=utf-8;"
                    });
                    navigator.msSaveBlob(blob, 'active-collaborators.csv');
                } else {
                    var a = document.createElement('a');
                    a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(data);
                    a.target = '_blank';
                    a.download = 'active-collaborators.csv';
                    document.body.appendChild(a);
                    a.click();
                }
            } else {
                mvNotifier.watch(data.message);
            }
            $('#loader').css('display', 'none');
            $('#loaderBackground').css('display', 'none');
        })
    };
}