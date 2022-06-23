'use strict';

var app = angular.module('valora')
    .controller('DashboardCtrl', ['$scope', 'mvNotifier', 'DashboardService', DashboardCtrl]);

function DashboardCtrl($scope, mvNotifier, DashboardService) {

    $scope.getData = function() {

        getDataGeneral()
    };

    $scope.downloadPNG = function(id) {
        downloadPNG(id)
    };


    getDataGeneral();
    function getDataGeneral() {

        var query = {
            dateFrom: new Date(Date.parse("12/01/2018")).toISOString(),
            dateTo: new Date(Date.now()).toISOString()
        };
        
        DashboardService.getGeneralMetrics(query).then(function (data) {
            console.log(data)
            if(data.success) {
                $scope.acknowledgments = data.acknowledgments;
            } else {
                mvNotifier.error(data.message);
            }

        })
    }

    function downloadPNG(id){
        /*Get image of canvas element*/
        var canvas = document.getElementById(id);
        canvas.backgroundColor = "#CCC"

        var url_base64jp = canvas.toDataURL('image/png', 1.0)
        /*get download button (tag: <a></a>) */
        var x = document.getElementsByClassName("btn-download");
 
        for (var i = 0; i < x.length; i++) {
          x[i].href = url_base64jp;
        }
        /*insert chart image url to download button (tag: <a></a>) */
       
 
    }



    
}
app.directive('chartactiveusers', ["$interval", function ($interval) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {          

            var myChart = new Chart(elem, {
                type: 'line',
                backgroundColor: '#000',
                data: {
                    labels: ['Enero 2022', 'Febrero 2022', 'Marzo 2022', 'Abril 2022', 'Mayo 2022', 'Junio 2022'],
                    datasets: [{
                        label: '# Usuarios',
                        fill: false,
                        borderColor: "#00a2d7",
                        pointStyle: 'circle',
    
                        data: [5800, 5870, 6980, 8110, 8400, 9000],
                        backgroundColor: [
                            '#e2001d',
                            '#43b8a1',
                            '#ffd000',
                            '#00b15b',
                            '#f27400'
                        ],
                        pointRadius : 5

                    }]
                },
                options: {
                    spanGaps : true,
                }
            });
        }
    };
}]);

app.directive('chartzones', ["$interval", function ($interval) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {          

            var myChart = new Chart(elem, {
                type: 'horizontalBar',
                data: {
                    labels: ['Norte', 'Bajío', 'Centro', 'Metro', 'Sur'],
                    datasets: [{
                        label: '# Usuarios',
                        barThickness: 6,
                maxBarThickness: 8,
                        data: [2300, 1800, 3200, 1950, 550],
                        backgroundColor: [
                            '#e2001d',
                            '#43b8a1',
                            '#ffd000',
                            '#00b15b',
                            '#f27400'
                        ]
                    }]
                },
                options: {
                    plugins: {
                        labels: {
                            render: 'value',
                           
                          }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
    };
}]);

app.directive('chartinsignia', ["$interval", function ($interval) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {          

            var myChart = new Chart(elem, {
                type: 'horizontalBar',
                data: {
                    labels: ['Norte', 'Bajío', 'Centro', 'Metro', 'Sur'],
                    datasets: [{
                        label: '# Usuarios',
                        barThickness: 6,
                maxBarThickness: 8,
                        data: [680, 500, 800, 520, 175],
                        backgroundColor: '#e2001d'
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
    };
}]);


const doughnutOptions = {  
    responsive : false, 
legend: {
    display: true,
    position: 'left'
  },
    plugins: {
        labels: {
            render: 'percentage',
            fontColor: 'white',
            fontStyle: 'bold',
            precision: 2
          }
    },
    cutoutPercentage: 25
}

app.directive('chartvalues', ["$interval", function ($interval) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {          

            document.myChart = new Chart(elem, {
                type: 'doughnut',
                data: {
                    labels: ['Actitud ganadora', 'Liderazgo involucrado', 'Servicio Sorprendente',
                             'Espiritu colaborativo', 'Atención al detalle', 'Celebra y diviertete'],
                    datasets: [{
                        label: '% Usuarios',
                        data: [32, 8, 22, 18, 8, 12],
                        backgroundColor: [
                            '#e2001d',
                            '#43b8a1',
                            '#7e461b',
                            '#ffd000',
                            '#00b15b',
                            '#f27400'
                        ]
                    }]
                },
                options: doughnutOptions
            });
        }
    };
}]);

app.directive('chartcompetences', ["$interval", function ($interval) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {          

            document.myChart = new Chart(elem, {
                type: 'doughnut',
                data: {
                    labels: ['Estrategia del mes', 'Creatividad en equipo', 'Comunicación efectiva',
                             'Visión a futuro', 'Responsable socialmente'],
                    datasets: [{
                        label: '% Usuarios',
                        data: [20, 8, 15, 17, 8],
                        backgroundColor: [
                            '#e2001d',
                            '#43b8a1',
                            '#7e461b',
                            '#ffd000',
                            '#00b15b',
                            '#f27400'
                        ]
                    }]
                },
                options: doughnutOptions
            });
        }
    };
}]);

app.directive('chartspecials', ["$interval", function ($interval) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {          

            document.myChart = new Chart(elem, {
                type: 'doughnut',
                data: {
                    labels: ['Cumpleaños', 'Vendedor del mes         ', 'Meta del mes',
                             'Service week', 'Programa especial'],
                    datasets: [{
                        label: '% Usuarios',
                        data: [32, 8, 22, 18, 8, 32],
                        backgroundColor: [
                            '#e2001d',
                            '#43b8a1',
                            '#7e461b',
                            '#ffd000',
                            '#00b15b',
                            '#f27400'
                        ]
                    }]
                },
                options: doughnutOptions
            });
        }
    };
}]);

//scope.getBadgeAcknowledgments();

