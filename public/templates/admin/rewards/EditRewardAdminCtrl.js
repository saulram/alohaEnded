/**
 * Created by Mordekaiser on 20/11/16.
 */
"use strict";
angular.module('valora')
    .controller('EditRewardAdminCtrl', ['$scope', 'mvNotifier', '$state', 'RewardService', 'fileReader', '$stateParams', EditRewardAdminCtrl]);

function EditRewardAdminCtrl($scope, mvNotifier, $state, RewardService, fileReader, $stateParams) {
    $scope.sizes = [{name: 'Xl'},{name: 'L'},{name: 'M'}, {name: 'S'}];
    $scope.genders = [{name: 'F'}, {name: 'M'}, {name: 'Unisex'}];
    $scope.file = '';

    if($stateParams.id) {
        RewardService.get({_id: $stateParams.id, type: 'byId'}).then(function (data) {
            if(data) {
                var reward = data[0];
                $scope.name = reward.name;
                $scope.description = reward.description;
                $scope.points = Number(reward.points);
                $scope.imageSrc = reward.image;
                $scope.category = reward.category;
                $scope.colors = reward.color;

                angular.forEach(reward.size, function (size) {
                    for(var i = 0; i < $scope.sizes.length; i++) {
                        if($scope.sizes[i].name === size)
                            $scope.sizes[i].selected = true;
                    }
                });
                angular.forEach(reward.gender, function (gender) {
                    for(var i = 0; i < $scope.genders.length; i++) {
                        if($scope.genders[i].name === gender)
                            $scope.genders[i].selected = true;
                    }
                });
                // date picker is expecting an actual date object
                $scope.expiresAt = new Date(reward.expiresAt);
            }
        });

        $scope.saveChanges = function () {
            var data = {};
            var query = {
                _id: $stateParams.id
            };

            if(!$scope.rewardForm.name.$pristine)
                data.name = $scope.name;
            if(!$scope.rewardForm.description.$pristine)
                data.description = $scope.description;
            if(!$scope.rewardForm.points.$pristine)
                data.points = $scope.points;
            if($scope.file) {
                data.image = $scope.file;
            }
            if(!$scope.rewardForm.expiresAt.$pristine)
                data.expiresAt = $scope.expiresAt;

            if($scope.category === 'ropa') {
                $scope.sizeArray = [];
                angular.forEach($scope.sizes, function (size) {
                    if(size.selected)
                        $scope.sizeArray.push(size.name);
                });
                data.sizes = $scope.sizeArray;

                $scope.genderArray = [];
                angular.forEach($scope.genders, function (gender) {
                    if(gender.selected)
                        $scope.genderArray.push(gender.name);
                });
                data.genders = $scope.genderArray;

                if($scope.colors)
                    data.colors = $scope.colors;
            }

            RewardService.put(query, data).then(function (success) {
                if(success) {
                    mvNotifier.notify('Recompensa modificada exitosamente.');
                    $state.go('admin.rewards');
                }
            })
        };
    }

    $scope.getFile = function () {
        $scope.progress = 0;
        fileReader.readAsDataUrl($scope.file, $scope)
            .then(function(result) {
                $scope.imageSrc = result;
            });
    };

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