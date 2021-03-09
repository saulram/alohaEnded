/**
 * Created by Mordekaiser on 28/09/16.
 */
"use strict";
angular.module('valora')
    .controller('BannersCtrl', ['$scope', 'BannerService', 'mvNotifier', 'fileReader', BannersCtrl]);

function BannersCtrl($scope, BannerService, mvNotifier, fileReader) {
    getBanners({});
    $scope.addBanner = function () {
        var data = {
            name: $scope.name,
            description: $scope.description,
            image: $scope.file
        };

        BannerService.post(data).then(function (success) {
            if(success) {
                getBanners({});
                mvNotifier.notify('Banner creado correctamente');
            } else {
                mvNotifier.error('No se pudo crear el banner');
            }
        });
    };

    $scope.deleteBanner = function (id) {
        BannerService.delBanner({_id: id}).then(function (response) {
            if(response.success) {
                mvNotifier.notify('Banner borrado correctamente.');
                getBanners({});
            } else
                mvNotifier.error(response.error.message);
        })
    };

    $scope.editBanner = function (id) {
        BannerService.get({_id: id}).then(function (data) {
            if(data.success) {
                $scope.id = data.banner._id;
                $scope.name = data.banner.name;
                $scope.description = data.banner.description;
                $scope.imageSrc = data.banner.image;
                $('#addBanner').hide();
                $('#editBanner').show();
            } else {
                mvNotifier.error(data.message);
            }
        });
    };
    
    $scope.saveUpdate = function () {
        var query = {
            _id: $scope.id
        };

        var data = {};
        if(!$scope.bannerForm.name.$pristine)
            data.name = $scope.name;
        if(!$scope.bannerForm.description.$pristine)
            data.description = $scope.description;
        if($scope.file)
            data.image = $scope.file;

        BannerService.put(query, data).then(function (success) {
            if(success) {
                $('#editBanner').hide();
                $('#addBanner').show();
                $scope.name = "";
                $scope.id = "";
                $scope.description = "";
                $scope.image = "";
                $scope.files = "";
                $('#image').val('');
                getBanners({});
                mvNotifier.notify('Banner modificado correctamente.');
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

    function getBanners(query) {
        BannerService.get(query).then(function (data) {
            if(data.success) {
                $scope.banners = data.banners;
            } else {
                mvNotifier.error(data.message);
            }
        })
    }
}