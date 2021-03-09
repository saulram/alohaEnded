/**
 * Created by Latin on 3/25/2017.
 */
'use strict';
angular.module('valora')
    .controller('IWebServiceLogCtrl', ['$scope', 'LogService', 'mvNotifier', IWebServiceLogCtrl]);

function IWebServiceLogCtrl($scope, LogService, mvNotifier) {
    $scope.searchLog = function () {
        if($scope.dateFrom) {
            const query = {
                dateFrom: new Date($scope.dateFrom).toISOString()
            };
            getLog(query);
        } else {
            mvNotifier.error('Selecciona una fecha');
        }
    };

    $scope.setOrder = function (model) {
        $scope.orderByModel = model;
    };

    function getLog(query) {
        $('#loader').css('display', 'block');
        $('#loaderBackground').css('display', 'block');
        LogService.getIntelexionLog(query).then(function (data) {
            $('#loader').css('display', 'none');
            $('#loaderBackground').css('display', 'none');
            if(data.success) {
                $scope.logs = data.logs;
            } else {
                $scope.logs = [];
                mvNotifier.error('No se encontró información.');
            }
        });
    }

    $scope.options = {
        showWeeks: true,
        dateFormat: 'dd-MMMM-yyyy'
    };
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
    $scope.format = $scope.formats[0];

    $scope.today = function() {
        $scope.expiresAt = new Date();
    };
    $scope.today();
}