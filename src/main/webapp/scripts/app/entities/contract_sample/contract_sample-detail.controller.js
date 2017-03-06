'use strict';

angular.module('mycontractApp')
    .controller('Contract_sampleDetailController', function ($scope, $rootScope, $stateParams, $window, $modal, entity, Contract_sample, FileUpload) {
        $scope.contract_sample = entity;
        $scope.load = function (id) {
            Contract_sample.get({id: id}, function(result) {
                $scope.contract_sample = result;
            });
        };
        $rootScope.$on('mycontractApp:contract_sampleUpdate', function(event, result) {
            $scope.contract_sample = result;
        });
        $scope.previewFile = function () {
            FileUpload.download().downloadFile({id: $scope.contract_sample.id}, function(result){
                //$window.open(result.file);
                $modal.open({
                    templateUrl: 'scripts/app/entities/contract_sample/samplePDF.html',
                    controller: 'SamplePDFController',
                    size: 'lg',
                    resolve: {
                        content: function () {
                            return result.file;
                        }
                    }
                });
            });
                /*.then(function (result) {
                var file = new Blob([result.data], {type: 'application/pdf'});
                var fileURL = window.URL.createObjectURL(file);
                $window.open(fileURL);
            });*/
        }
    });
