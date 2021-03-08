/**
 * Created by Mordekaiser on 08/11/16.
 */
"use strict";
angular.module('valora')
    .controller('EditBadgeAdminCtrl', ['$scope', 'fileReader' ,'BadgeService', 'mvNotifier', '$stateParams', '$location', EditBadgeAdminCtrl]);

function EditBadgeAdminCtrl($scope, fileReader, BadgeService, mvNotifier, $stateParams, $location) {
    if($stateParams.id) {
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
        BadgeService.get({type: 'byId', id: $stateParams.id}).then(function (data) {
            if(data) {
                $scope.category = data[0].category;
                $scope.badgeName = {category: data[0].category, name: data[0].name};
                $scope.points = Number(data[0].points);
                $scope.imageSrc = data[0].image;
            }
        });

        $scope.editBadge = function () {
            // the name is send in order that multer overwrites the file
            var query = {
                _id: $stateParams.id
            };
            var data = {};
            data.name = $scope.badgeName.name;
            if(!$scope.badgeForm.category.$pristine)
                data.category = $scope.category;
            if(!$scope.badgeForm.points.$pristine)
                data.points = $scope.points;
            if($scope.file)
                data.image = $scope.file;

            BadgeService.put(query, data).then(function (success) {
                if(success) {
                    mvNotifier.notify('Insignia actualizada exitosamente');
                    $location.path('/admin/badges');
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
    };
}