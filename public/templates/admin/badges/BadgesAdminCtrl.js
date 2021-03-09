/**
 * Created by Mordekaiser on 26/10/16.
 */
"use strict";
angular.module('valora')
    .directive("ngFileSelect",function(){
        return {
            link: function($scope,el){
                el.bind("change", function(e){
                    $scope.file = (e.srcElement || e.target).files[0];
                    $scope.getFile();
                })
            }
        }
    })
    .controller('BadgesAdminCtrl', ['$scope', 'fileReader' ,'BadgeService', 'mvNotifier', BadgesAdminCtrl]);

function BadgesAdminCtrl($scope, fileReader, BadgeService, mvNotifier) {
    getAllBadges({type: 'all', category: 'valores'});

    $scope.addBadge = function () {
        var data = {
            name: $scope.badgeName.name,
            image: $scope.file,
            points: $scope.points,
            category: $scope.category
        };

        if($scope.file) {
            BadgeService.post(data).then(function (success) {
                if(success) {
                    mvNotifier.notify('Insignia creada correctamente');
                    getAllBadges({type: 'all', category: 'valores'});
                    $scope.badgeName.name = "";
                    $scope.file = "";
                    $scope.points = "";
                    $scope.category = "";
                    $scope.imageSrc = "";
                }
                else
                    mvNotifier.error('Ocurrió un error al intentar crear la insignia');
            })
        } else
            mvNotifier.error('Imagen de insginia requerida');
    };

    $scope.deleteBadge = function (id) {
        BadgeService.del({_id: id}).then(function (success) {
            if(success) {
                mvNotifier.notify('Insignia eliminada correctamente');
                getAllBadges({type: 'all', category: 'valores'});
            }
        })
    };

    $scope.getFile = function () {
        $scope.progress = 0;
        fileReader.readAsDataUrl($scope.file, $scope)
            .then(function(result) {
                $scope.imageSrc = result;
            });
    };

    function getAllBadges(query) {
        $scope.defaultBadges = [
            {
                category: 'valor',
                name: 'Respeto y Diversidad'
            },
            {
                category: 'valor',
                name: 'Orgullo Presidente'
            },
            {
                category: 'valor',
                name: 'Actitud de Servicio'
            },
            {
                category: 'valor',
                name: 'Lealtad y Justicia'
            },
            {
                category: 'valor',
                name: 'Honestidad e Integridad'
            },
            {
                category: 'valor',
                name: 'Responsabilidad Social'
            },
            {
                category: 'competencias',
                name: 'Adaptibilidad / Desarrollo de Talento'
            },
            {
                category: 'competencias',
                name: 'Compromiso con el Cliente'
            },
            {
                category: 'competencias',
                name: 'Comunicación Efectiva'
            },
            {
                category: 'competencias',
                name: 'Relaciones Personales / Creación de Equipos Eﬁcientes'
            },
            {
                category: 'competencias',
                name: 'Innovación y Mejora'
            },
            {
                category: 'competencias',
                name: 'Liderazgo e Inﬂuencia Eﬁcaz'
            },
            {
                category: 'competencias',
                name: 'Orientación a Resultados'
            },
            {
                category: 'competencias',
                name: 'Toma de Decisiones Oportunas'
            }
        ];
        BadgeService.get(query).then(function (data) {
            if(data) {
                $scope.badges = data;
            }
        })
    }
}