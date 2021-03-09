/**
 * Created by Mordekaiser on 07/10/16.
 */
"use strict";
angular.module('valora')
    .controller('LoginCtrl', ['$scope', '$window', 'mvNotifier', '$timeout', 'AuthService', 'Analytics', LoginCtrl]);

function LoginCtrl($scope, $window, mvNotifier, $timeout, AuthService, Analytics) {
    $scope.login = function () {
        Analytics.set('&uid', $scope.employeeNumber);
        Analytics.set('set', 'dimension1', $scope.employeeNumber);
        Analytics.pageView();
        var query = {
            employeeNumber: $scope.employeeNumber,
            password: $scope.password,
            webApp: 'valora'
        };

        AuthService.authenticate(query).then(function (data) {
            if(data.success) {
                mvNotifier.notify('Acceso exitoso');
                $timeout(function(){
                    $window.location.href = '/';
                },300);
            } else
                mvNotifier.error(data.message);
        });
    };

    $scope.forgottenPass = function (employeeNumber) {
        if(employeeNumber) {
            AuthService.forgottenPass({employeeNumber: employeeNumber}).then(function (data) {
                if(data.success) {
                    $('#forgottenPassModal').modal('hide');
                    mvNotifier.notify('Pronto recibiras un correo electrónico para el cambio de contraseña.');
                } else
                    mvNotifier.error('No se pudo realizar esa acción');
            })
        } else
            mvNotifier.error('Número de empleado requerido');
    }
}