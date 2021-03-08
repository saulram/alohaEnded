/**
 * Created by Mordekaiser on 17/11/16.
 */
"use strict";
angular.module('valora')
    .controller('MyBadgesCtrl', ['$scope', 'AcknowledgmentService', 'AuthService', 'AuthToken', MyBadgesCtrl]);

function MyBadgesCtrl($scope, AcknowledgmentService, AuthService, AuthToken) {
    var user = AuthToken.getToken();
    $scope.myOtherBadges = [];
    $scope.gpBadges = [];
    $scope.myBadges = [];
    $scope.myAmbassadors = [];
    $scope.myEmbassys = [];
    $scope.myEmabssysName = [];
    $scope.badgeNames = [];

    AcknowledgmentService.getAmbassadors().then(function (ambassadors) {
        angular.forEach(ambassadors, function (ambassador, key) {
            if(ambassador.employeeNumber === user.employeeNumber) {
                $scope.myEmbassys.push(ambassador);
                $scope.myEmabssysName.push(ambassador.badgeName);
            }

            $scope.myAmbassadors.push(ambassador);
        });
        // gets all my badges
        AcknowledgmentService.get().then(function (myBadges) {
            if(myBadges.success) {
                angular.forEach(myBadges.badges, function (myBadge, key) {
                    $scope.badgeNames.push(myBadge.badgeName);
                    if($scope.myEmabssysName.indexOf(myBadge.badgeName) === -1) {
                        if(myBadge.category === 'grupo presidente')
                            $scope.gpBadges.push(myBadge);
                        if(myBadge.category === 'especial')
                            $scope.gpBadges.push(myBadge);
                        if(myBadge.category === 'valor' || myBadge.category === 'competencias')
                            $scope.myBadges.push(myBadge);
                    }
                });
                // push the badges that hasn't get the collaborator
                $scope.allBadges.filter(function (badge) {
                    if($scope.badgeNames.indexOf(badge.badgeName) === -1) {
                        $scope.myBadges.push(badge);
                        return badge;
                    }

                });
            } else {
                angular.forEach($scope.allBadges, function (item) {
                    $scope.myBadges.push(item);
                });
            }
        });
    });

    AuthService.get({type: 'byCollaborator'}).then(function (data) {
        if(data) {
            if(data.users[0].seniority) {
                var seniorityData = {
                    count: data.users[0].seniority,
                    image: '/assets/images/gp-antiguedad.png',
                    badgeName: 'Antigüedad'
                };
                $scope.myOtherBadges.push(seniorityData);
            }
            if(data.users[0].performance) {
                var performanceData = {
                    count: 1,
                    badgeName: 'Desempeño',
                    image: '/assets/images/gp-desempeno.png'
                };
                $scope.myOtherBadges.push(performanceData);
            }
            /*if(data.users[0].upgrade.badge) {
                var badgeData = {};
                if(data.users[0].upgrade.badge === 'BRONCE') {
                    badgeData.badgeName = 'Upgrade Bronce';
                    badgeData.image = '/assets/images/upgrade-bronce.png';
                }
                if(data.users[0].upgrade.badge === 'PLATA') {
                    badgeData.badgeName = 'Upgrade Plata';
                    badgeData.image = '/assets/images/upgrade-plata.png';
                }
                if(data.users[0].upgrade.badge === 'ORO') {
                    badgeData.badgeName = 'Upgrade Oro';
                    badgeData.image = '/assets/images/upgrade-oro.png';
                }
                if(data.users[0].upgrade.badge === 'DIAMANTE') {
                    badgeData.badgeName = 'Upgrade Diamante';
                    badgeData.image = '/assets/images/upgrade-diamante.png';
                }
                $scope.myOtherBadges.push(badgeData);
            }*/

        }
    });

    $scope.allBadges = [
        {
            badgeName: 'Respeto y Diversidad',
            category: 'valor',
            count: 0,
            image: '/assets/images/badges/respeto-y-diversidad'
        },
        {
            badgeName: 'Actitud de Servicio',
            category: 'valor',
            count: 0,
            image: '/assets/images/badges/actitud-de-servicio'
        },
        {
            badgeName: 'Lealtad y Justicia',
            category: 'valor',
            count: 0,
            image: '/assets/images/badges/lealtad-y-justicia'
        },
        {
            badgeName: 'Honestidad e Integridad',
            category: 'valor',
            count: 0,
            image: '/assets/images/badges/honestidad-e-integridad'
        },
        {
            badgeName: 'Responsabilidad Social',
            category: 'valor',
            count: 0,
            image: '/assets/images/badges/responsabilidad-social'
        },
        {
            badgeName: 'Adaptibilidad / Desarrollo de Talento',
            category: 'competencias',
            count: 0,
            image: '/assets/images/badges/adaptibilidad-desarrollo-de-talento'
        },
        {
            badgeName: 'Compromiso con el Cliente',
            category: 'competencias',
            count: 0,
            image: '/assets/images/badges/compromiso-con-el-cliente'
        },
        {
            badgeName: 'Comunicación Efectiva',
            category: 'competencias',
            count: 0,
            image: '/assets/images/badges/comunicacion-efectiva'
        },
        {
            badgeName: 'Relaciones Personales / Creación de Equipos Eﬁcientes',
            category: 'competencias',
            count: 0,
            image: '/assets/images/badges/relaciones-personales-creacion-de-equipos-e-cientes'
        },
        {
            badgeName: 'Innovación y Mejora',
            category: 'competencias',
            count: 0,
            image: '/assets/images/badges/innovacion-y-mejora'
        },
        {
            badgeName: 'Liderazgo e Inﬂuencia Eﬁcaz',
            category: 'competencias',
            count: 0,
            image: '/assets/images/badges/liderazgo-e-in-uencia-e-caz'
        },
        {
            badgeName: 'Orientación a Resultados',
            category: 'competencias',
            count: 0,
            image: '/assets/images/badges/orientacion-a-resultados'
        },
        {
            badgeName: 'Toma de Decisiones Oportunas',
            category: 'competencias',
            count: 0,
            image: '/assets/images/badges/orientacion-a-resultados'
        }
    ]
}
