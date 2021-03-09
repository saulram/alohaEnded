 /**
 * Created by Mordekaiser on 15/11/16.
 */
 "use strict";
 angular.module('valora')
     .controller('EditGPBadgeCtrl', ['$scope', 'fileReader' ,'BadgeService', 'mvNotifier', '$stateParams', '$state', EditGPBadgeCtrl]);

 function EditGPBadgeCtrl($scope, fileReader, BadgeService, mvNotifier, $stateParams, $state) {
     if($stateParams.id) {
         BadgeService.get({type: 'byId', id: $stateParams.id}).then(function (data) {
             if(data) {
                 $scope.name = data[0].name;
                 $scope.points = Number(data[0].points);
                 $scope.imageSrc = data[0].image;
             }
         });

         $scope.editBadge = function () {
             var data = {};
             data.name = $scope.name;
             if(!$scope.gpForm.points.$pristine)
                 data.points = $scope.points;
             if($scope.file)
                 data.image = $scope.file;

             BadgeService.put({_id: $stateParams.id}, data).then(function (success) {
                 if(success) {
                     mvNotifier.notify('Insignia actualizada exitosamente');
                     $state.go('admin.gpBadges');
                 }
             })
         }
     }

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
 }