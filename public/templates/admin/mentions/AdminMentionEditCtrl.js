'use strict';

angular.module('valora')
    .controller('AdminMentionEditCtrl', ['$scope', 'mvNotifier', 'MentionService', '$stateParams', '$state', AdminMentionEditCtrl]);

function AdminMentionEditCtrl($scope, mvNotifier, MentionService, $stateParams, $state) {
    if(typeof $stateParams.id !== 'undefined') {
        getCourseById($stateParams.id);

        $scope.saveMention = function () {
            var data = {};
            if(!$scope.mentionForm.description.$pristine) {
                data.description = $scope.description;
            }

            if(!$scope.mentionForm.draft.$pristine) {
                data.draft = $scope.draft;
            }

            MentionService.put($stateParams.id, data).then(function (data) {
                if(data.success) {
                    $state.go('admin.mention');
                } else {
                    mvNotifier.error(data.message);
                }
            })
        }
    }

    function getCourseById(_id) {
        MentionService.getById(_id).then(function (data) {
            if(data.success) {
                $scope.description = data.mention.description;
                $scope.draft = data.mention.draft;
            } else {
                mvNotifier.error(data.message);
            }
        })
    }
}