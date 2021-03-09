'use strict';

angular.module('valora')
    .controller('AdminFeedMessageListCtrl', ['$scope', 'mvNotifier', 'FeedMessageService', AdminFeedMessageListCtrl]);

function AdminFeedMessageListCtrl($scope, mvNotifier, FeedMessageService) {
    $scope.saveMessage = function () {
        var data = {
            type: $scope.type
        };
        if($scope.type === 'upgrade') {
            if($scope.message.indexOf('receiverName') > -1 && $scope.message.indexOf('badgeName') > -1) {
                data.message = $scope.message;
                FeedMessageService.post(data).then(function (data) {
                    if(data.success) {
                        mvNotifier.notify('Mensaje creado exitosamente');
                    } else {
                        mvNotifier.error('Ocurrió un error al intentar crear el mensaje');
                    }
                })
            } else {
                mvNotifier.error('La palabra receiverName y badgeName son necesarias en el texto');
            }
        }
    }
}