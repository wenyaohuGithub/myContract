'use strict';

angular.module('mycontractApp').controller('Contract_sampleDialogController',
    ['$scope', '$stateParams', '$modalInstance', '$http', 'entity', 'Contract_sample', 'FileUpload',
        function($scope, $stateParams, $modalInstance, $http, entity, Contract_sample, FileUpload) {

        $scope.contract_sample = entity;
        $scope.load = function(id) {
            Contract_sample.get({id : id}, function(result) {
                $scope.contract_sample = result;
            });
        };

        var isFileUploaded = false;
        $scope.uploadedFile = null;

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:contract_sampleUpdate', result);
            $modalInstance.close(result);
        };

        var onUploadFinished = function(result){
            if(result.status == 'done'){
                $scope.$emit('mycontractApp:contract_sampleUpdate', result);
                $modalInstance.close(result);
            } else if(result.status = 'error'){
                console.log("error");
            }
        }

        $scope.save = function () {
            if ($scope.contract_sample.id != null) {
                Contract_sample.update($scope.contract_sample, onSaveFinished);
            } else {
                Contract_sample.save($scope.contract_sample, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $scope.uploadedFile = null;
            $modalInstance.dismiss('cancel');
        };

        $scope.uploadFile = function() {
            var file = $scope.uploadedFile;
            var fd = new FormData();
            fd.append('file', file);
            var params = {
                type: 'ContractSample',
                name : $scope.contract_sample.name,
                desc : $scope.contract_sample.description
            };
            if($scope.contract_sample.name){
                FileUpload.setParameter(params);
            }

            FileUpload.upload().uploadFile(fd, onUploadFinished);
        };

        $scope.isFileSelected = function() {
            if($scope.uploadedFile){
                return true;
            } else {
                return false;
            }
        };

        $scope.isFileUploaded = function() {
            return isFileUploaded;
        };

        $scope.selectFile = function(files){
            $scope.uploadedFile = files[0];
            $scope.$apply();
        };
}]);
