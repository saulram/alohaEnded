/**
 * Created by Mordekaiser on 20/10/16.
 */
"use strict";
angular.module('valora')
    .controller('CheckoutCtrl', ['$scope', 'RewardService', 'mvNotifier', 'AccountStatusService', '$location', CheckoutCtrl]);

function CheckoutCtrl($scope, RewardService, mvNotifier, AccountStatusService, $location) {
    $scope.sizeList = [];
    $scope.genderList = [];
    $scope.colorList = [];
    if(typeof $scope.rewards === 'undefined')
        $scope.rewards = RewardService.getRewards();

    getTotalPoints();

    $scope.removeFromList = function (reward) {
        var index = $scope.rewards.indexOf(reward);
        if(index > -1)
            $scope.rewards.splice(index, 1);
        getTotalPoints();
    };

    $scope.validatePoints = function () {
        if(Number($scope.myInfo.points.current) >= Number($scope.sumRewardPoints)){
            $('#myModal').modal('show');
        } else
            mvNotifier.error('No tienes suficientes puntos, para algunos productos. Ajusta tus productos borrandolos de la lista');
    };

    $scope.checkout = function () {
        $('#checkout').hide();
        var rewards = [];
        angular.forEach($scope.rewards, function (values, key) {
            var doc = {
                reward_id: values._id,
                points: values.points,
                rewardName: values.name,
                rewardImage: values.image
            };

            if(values.size.length > 0 && values.gender.length > 0) {
                doc.size = $scope.sizeList[key];
                doc.gender = $scope.genderList[key];
                doc.color = $scope.colorList[key];
            }

            rewards.push(doc);
        });

        AccountStatusService.post({rewards: rewards}).then(function (data) {
            if(data.success) {
                mvNotifier.notify('Canjeo de premios realizado correctamente.');
                $scope.code = data.exchangeCode;
                $('#myModal').modal('hide');
                $('#ticket').modal('show');
                $('#checkout').show();
            }
        });
    };

    $scope.printCode = function () {
        var printContents = document.getElementById('ticket').innerHTML;
        var printer = new Printer(printContents);
        printer.print();
    };

    // when user leaves controller need to clean the cart
    $scope.$on("$destroy", function() {
        RewardService.clearCart();
    });

    // calculates how many points user is going to spend
    function getTotalPoints() {
        $scope.totalPoints = Number($scope.myInfo.points.current);
        $scope.sumRewardPoints = 0;
        angular.forEach($scope.rewards, function (value, key) {
            $scope.sumRewardPoints = $scope.sumRewardPoints + Number(value.points);
            $scope.totalPoints = $scope.totalPoints - Number(value.points);
        });
    }

    $('#ticket').on('hidden.bs.modal', function (e) {
        $scope.$apply(function () {
            $location.path('/rewards');
        });
    });

    function Printer($c){
        var h = $c;
        return {
            print: function(){
                var d = $("<div>").html(h).appendTo("html");
                $("body").hide();
                window.print();
                d.remove();
                $("body").show();
            },
            setContent: function($c){
                h = $c;
            }
        };
    }
}