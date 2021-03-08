'use strict';

angular.module('valora')
  .controller('CourseDetailCtrl', ['$scope', '$location', 'mvNotifier', CourseDetailCtrl]);

function CourseDetailCtrl($scope, $location, mvNotifier) {
  $scope.loadVideo = function (video) {
    var myVideo = document.getElementsByTagName('video')[0];
    myVideo.src = `../../../assets/videos/enpowerment/${video}`;
    myVideo.load();
    myVideo.play();
  }
}