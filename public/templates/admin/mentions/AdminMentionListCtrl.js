'use strict';

angular.module('valora')
    .controller('AdminMentionListCtrl', ['$scope', 'mvNotifier', 'MentionService', AdminMentionListCtrl]);

function AdminMentionListCtrl($scope, mvNotifier, MentionService) {
    getMentionList({type: 'admin'});
    $scope.draft = true;
    $scope.saveMention = function () {
        var data = {
            description: $scope.description,
            draft: $scope.draft
        };

        MentionService.post(data).then(function (success) {
            if(success) {
                mvNotifier.notify('Mención creada exitosamente');
                $scope.description = '';
                getMentionList({type: 'admin'})
            } else {
                mvNotifier.error('Ocurrió un error al crear la mención');
            }
        })
    };

    $scope.deleteMention = function (id) {
        MentionService.del({_id: id}).then(function (data) {
            if(data.success) {
                mvNotifier.notify('Mención borrada exitosamente');
            } else {
                mvNotifier.error('Ocurrió un error al intentar borrar la mención');
            }
        })
    };

    function getMentionList(query) {
        MentionService.get(query).then(function (data) {
            if(data.success) {
                $scope.mentions = data.mentions;
            } else {
                mvNotifier.error('No se encontraron menciones');
            }
        })
    }
}