/**
 * Created by Mordekaiser on 13/10/16.
 */
"use strict";
angular.module('valora')
    .controller('RewardsAdminCtrl', ['$scope', 'mvNotifier', '$filter', 'RewardService', 'fileReader', RewardsAdminCtrl]);

function RewardsAdminCtrl($scope, mvNotifier, $filter, RewardService, fileReader) {
    $scope.dateDirty = false;
    getRewards({type: 'all'});
    $scope.sizes = [{name: 'Xl'},{name: 'L'},{name: 'M'}, {name: 'S'}];
    $scope.genders = [{name: 'F'}, {name: 'M'}, {name: 'Unisex'}];

    $scope.addReward = function () {
        var data = {
            name: $scope.name,
            description: $scope.description,
            points: $scope.points,
            image: $scope.file,
            expiresAt: $filter('date')($scope.expiresAt, 'yyyy-MM-dd'),
            colors: [],
            sizes: [],
            genders: []
        };

        if($scope.category)
            data.category = $scope.category;
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

       if($scope.file) {
           RewardService.post(data).then(function (response) {
               if(response.success) {
                   mvNotifier.notify('Recompensa creada exitosamente');
                   clearScope();
               } else
                   mvNotifier.error('Ocurrio un error al crear la recompensa, error: ' + response.statusText);
           })
       } else
           mvNotifier.error('Imagen de recompensa requerida');
    };

    $scope.deleteReward = function (id) {
        var query = {
            _id: id
        };

        RewardService.delReward(query).then(function (success) {
            if(success) {
                mvNotifier.notify('Recompensa borrada exitosamente.');
                getRewards({type: 'all'});
            } else
                mvNotifier.error('Ocurrió un error al intentar borrar la recompensa.');
        })
    };

    $scope.editReward = function (id) {
        $scope.rewardId = id;
        var query = {
            _id: id,
            type: 'all'
        };

        RewardService.get(query).then(function (data) {
            if(data) {
                var reward = data[0];
                mvNotifier.notify('Información de recompensa cargada en el formulario');
                $scope.name = reward.name;
                $scope.description = reward.description;
                $scope.points = Number(reward.points);
                $scope.image = reward.image;
                // date picker is expecting an actual date object
                $scope.expiresAt = new Date(reward.expiresAt);
                $('#saveChanges').show();
                $('#addReward').hide();
            }
        })
    };

    $scope.getFile = function () {
        $scope.progress = 0;
        fileReader.readAsDataUrl($scope.file, $scope)
            .then(function(result) {
                $scope.imageSrc = result;
            });

        $scope.$on("fileProgress", function(e, progress) {
            $scope.progress = progress.loaded / progress.total;
        });
    };

    function getRewards(query) {
        RewardService.get(query).then(function (data) {
            if(data) {
                $scope.rewards = data;
            }
        })
    }

    $scope.deleteComment = function (reward_id, comment_id) {
        var query = {
            reward_id: reward_id,
            comment_id: comment_id
        };

        console.log(query);

        RewardService.deleteComment(query).then(function (comments) {
            if(comments) {
                mvNotifier.notify('Comentario borrado exitosamente.');
                angular.forEach($scope.rewards, function (reward) {
                    if(reward._id === reward_id)
                        reward.comments = comments;
                });
            } else
                mvNotifier.error('No se pudo borrar el comentario.');
        })
    };

    function clearScope() {
        $scope.name = "";
        $scope.description = "";
        $scope.points = "";
        $scope.expiresAt = "";
        $scope.files = "";
        $scope.image = "";
        $scope.colors = [];
        angular.forEach($scope.genders, function (gender) {
            gender.selected = false;
        });
        angular.forEach($scope.sizes, function (size) {
            size.selected = false;
        });
        getRewards({type: 'all'});
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