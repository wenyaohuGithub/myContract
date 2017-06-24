'use strict';

angular.module('mycontractApp').controller('ContractDetailAttachmentsController',
    ['$scope', '$stateParams', '$timeout', 'entity', 'Contract', 'FileUpload',
        function($scope, $stateParams, $timeout, entity, Contract, FileUpload) {
        $scope.contract = entity;

        $timeout(function(){
            if($scope.contract.id){
                Contract.getAttachments($scope.contract.id, function(result) {
                    $scope.contract_attachments = result;
                });
            }
        }, 500);

        $scope.load = function (id) {
            if($scope.contract.id){
                Contract.getAttachments($scope.contract.id, function(result) {
                    $scope.contract_attachments = result;
                });
            }
        };

        var isFileUploaded = false;
        $scope.uploadedFile = null;

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:contract_sampleUpdate', result);
            $modalInstance.close(result);
        };

        var onUploadFinished = function(result){
            if(result.status == 'done'){
                $scope.load($scope.contract.id);
                $scope.clear();
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
        };

        $scope.uploadFile = function() {
            var file = $scope.uploadedFile;
            var fd = new FormData();
            fd.append('file', file);
            var params = {
                type: 'ContractAttachment',
                id : $scope.contract.id
            };
            FileUpload.setParameter(params);
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

        $scope.deleteContractAttachment = function (attachId) {
            Contract.deleteContractAttachment($scope.contract.id, attachId,
                function(result){
                    $scope.load($scope.contract.id);
                });
        };

        $scope.downloadAttachment = function(id, filePath){
            Contract.downloadAttachment(id,
                function(result){
                    var file = null;
                    if(filePath.toLowerCase().endsWith('pdf')){
                        file = new Blob([result], { type: 'application/pdf' });
                    } else if(filePath.toLowerCase().endsWith('doc')){
                        file = new Blob([result], { type: 'application/doc' });
                    } else {
                        file = new Blob([result], { type: 'application/txt' });
                    }

                    window.open(URL.createObjectURL(file));
                });
        }
}]);
