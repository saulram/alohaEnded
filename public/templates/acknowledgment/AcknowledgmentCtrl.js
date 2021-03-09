/**
 * Created by Mordekaiser on 26/10/16.
 */
"use strict";
angular.module('valora')
    .controller('AcknowledgmentCtrl', ['$scope', 'BadgeService', '$timeout', 'AuthService', 'AcknowledgmentService',
        'mvNotifier', 'AuthToken', AcknowledgmentCtrl]);

function AcknowledgmentCtrl($scope, BadgeService, $timeout, AuthService, AcknowledgmentService, mvNotifier, AuthToken) {
    $scope.userLocation = AuthToken.getToken().location;
    $scope.valuesActive = false;
    $scope.competencesActive = false;
    $scope.specialActive = false;
    $scope.modalBadge = "";
    var writePromise;

    BadgeService.get({type: 'byRol'}).then(function (data) {
        if(data) {
            $scope.values = [];
            $scope.competences = [];
            $scope.specialBadges = [];
            angular.forEach(data, function (values, key) {
                if(values.category === 'competencias')
                    $scope.competences.push(values);
                if(values.category === 'valor')
                    $scope.values.push(values);
                if(values.category === 'especial')
                    $scope.specialBadges.push(values);
            });
        }
    });

    $scope.recognize = function () {
        // data is send to create the document
        var data = {
            badgeSlug: $scope.modalBadge.slug,
            badgeName: $scope.modalBadge.name,
            badgePoints: $scope.modalBadge.points,
            badgeCategory: $scope.modalBadge.category,
            badgeId: $scope.modalBadge._id,
            receiver_id: $scope.collToBeRecognize._id,
            completeName: $scope.collToBeRecognize.completeName,
            receiverName: $scope.collToBeRecognize.completeName,
            receiverEmployeeNumber: $scope.collToBeRecognize.employeeNumber,
            receiverLocation: $scope.collToBeRecognize.location,
            receiverPosition: $scope.collToBeRecognize.position,
            receiverDepartment: $scope.collToBeRecognize.department,
            receiverArea: $scope.collToBeRecognize.area
        };

        if(typeof $scope.senderMessage !== 'undefined' && $scope.senderMessage) {
            data.senderMessage = $scope.senderMessage;
        }

        if(typeof $scope.myInfo.points.temporal === 'undefined' || $scope.myInfo.points.temporal === 0) {
            mvNotifier.error('No cuentas con puntos para otorgar insignias');
        } else {
            $scope.closePopup();
            AcknowledgmentService.post(data).then(function (data) {
                if(data.success) {
                    mvNotifier.notify('Insignia otorgada exitosamente');
                    updateCollaboratorInfo();
                } else {
                    mvNotifier.error(data.error);
                }
            })
        }
    };

    $scope.searchCollaborator = function (collaborator) {
        if(writePromise){
            $timeout.cancel(writePromise);
        }
        writePromise = $timeout(search(collaborator),1000);
    };

    function search(text) {
        if(text) {
            $scope.collToBeRecognize = "";
            $scope.collaborators = "";
            var query = {
                type: 'byCompleteName',
                completeName: text,
                location: $scope.userLocation
            };

            AuthService.get(query).then(function (data) {
                if(data.success) {
                    $scope.collaborators = data.users;
                } else {
                    mvNotifier.error(data.message);
                }
            })
        } else {
            $scope.collToBeRecognize = "";
            $scope.collaborators = "";
        }
    }

    $scope.selectCollaborator = function (collaborator) {
        $scope.collaborator = collaborator.completeName;
        $scope.collToBeRecognize = collaborator;
        $scope.collaborators = "";
    };

    $scope.openPopup = function (badge) {
        $scope.modalBadge = badge;
        //$('#recognize').show();
    };

    $scope.closePopup = function () {
        $('#recognize').hide();
        $scope.modalBadge = "";
        $scope.collToBeRecognize = "";
        $scope.collaborators = "";
        $scope.collaborator = "";
        $scope.personalMessage = "";
        $scope.senderMessage = "";
    };

    function updateCollaboratorInfo() {
        // gets the dynamic information of the collaborator
        AuthService.get({type: 'byCollaborator'}).then(function (data) {
            if(data) {
                $scope.myInfo = {
                    completeName: data.users[0].completeName,
                    employeeNumber: data.users[0].employeeNumber,
                    upgrade: data.users[0].upgrade,
                    profileImage: data.users[0].profileImage,
                    points: data.users[0].points
                }

            }
        });
    }

    $scope.categories = function (name) {
        if(name === 'values') {
            if($scope.valuesActive === false) {
                $scope.valuesActive = true;
                $scope.competencesActive = false;
                $scope.specialActive = false;
            }
            else if($scope.valuesActive === true) {
                $scope.valuesActive = false;
                $scope.competencesActive = false;
                $scope.specialActive = false;
            }
        }
        if(name === 'competences') {
            if($scope.competencesActive === false) {
                $scope.valuesActive = false;
                $scope.competencesActive = true;
                $scope.specialActive = false;
            }
            else if($scope.competencesActive === true) {
                $scope.valuesActive = false;
                $scope.competencesActive = false;
                $scope.specialActive = false;
            }
        }
        if(name === 'special') {
            if($scope.specialActive === false) {
                $scope.valuesActive = false;
                $scope.competencesActive = false;
                $scope.specialActive = true;
            }
            else if($scope.specialActive === true) {
                $scope.valuesActive = false;
                $scope.competencesActive = false;
                $scope.specialActive = false;
            }
        }
    }
}