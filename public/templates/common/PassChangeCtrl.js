/**
 * Created by Mordekaiser on 09/12/16.
 */
"use strict";
angular.module('valora')
    .directive('pwCheck', [function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.pwCheck;
                elem.add(firstPassword).on('keyup', function () {
                    scope.$apply(function () {
                        var v = elem.val()===$(firstPassword).val();
                        ctrl.$setValidity('pwmatch', v);
                    });
                });
            }
        }
    }])
    .controller('PassChangeCtrl', ['$scope', 'AuthService', 'mvNotifier', 'AuthToken', '$timeout', '$location', '$window',
        PassChangeCtrl]);

function PassChangeCtrl($scope, AuthService, mvNotifier, AuthToken, $timeout, $location, $window) {
    var user = AuthToken.getToken();
    if(typeof user.email !== 'undefined') {
        $scope.email = user.email;
    }
    $scope.changePass = function () {
        var data = {};
        if($scope.password && $scope.newPass) {
            data.newPass = $scope.newPass;
        }
        if($scope.email) {
            data.email = $scope.email;
        }

        AuthService.putPass(data).then(function (success) {
            if(success) {
                mvNotifier.notify('Cambio de contraseña exitoso');
                $scope.password = "";
                $scope.newPass = "";
                $scope.email = "";
                AuthToken.removeToken();
                $timeout(function(){
                    $location.path('/');
                    $window.location.reload();
                },300);
            } else
                mvNotifier('Ocurrió un error al cambiar la contraseña');
        })
    };
}