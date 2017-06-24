'use strict';

angular.module('mycontractApp')
    .controller('ContractDetailController', function ($scope, $rootScope, $state, $stateParams, $timeout, $http, entity, FileUpload, Contract) {
        $scope.contract = entity;

        $scope.load = function (id) {
            Contract.get(id).then(function(result) {
                $scope.contract = result;
            });
        };
        $rootScope.$on('mycontractApp:contractUpdate', function(event, result) {
            $scope.contract = result;
        });

        $scope.submitToNextProcess = function () {
            $('#submitToNextProcess_Confirmation').modal('show');
        };

        $scope.confirmToNextProcess = function(){
            Contract.submit($scope.contract.id, $scope.note, function (result) {
                $scope.clear();
                $scope.contract = result;
            });
            $('#submitToNextProcess_Confirmation').modal('hide');
        };

        $scope.rejectContractRequest = function() {
            $('#rejectRequest_Confirmation').modal('show');
        };

        $scope.approveContractRequest = function() {
            $('#approveRequest_Confirmation').modal('show');
        };


        $scope.confirmToReject = function(){
            Contract.reject($scope.contract.id, $scope.note, function (result) {
                $scope.clear();
                $scope.contract = result;
                $('#rejectRequest_Confirmation').modal('hide');
            });
        };

        $scope.confirmToApprove = function(){
            Contract.approve($scope.contract.id, $scope.note, function (result) {
                $scope.clear();
                $scope.contract = result;
                $('#approveRequest_Confirmation').modal('hide');
            });
        };

        $scope.clear = function () {
            //$scope.contract = {name: null, review_identifier: null, contract_identifier: null, contracting_method: null, amount: null, amount_written: null, currency: null, amount_current_year: null, submit_date: null, start_date: null, end_date: null, expire_date: null, is_multi_year: null, status: null, state: null, approve_date: null, sign_date: null, archive_date: null, id: null};
            //$('#submitNextProcess_Confirmation').modal('close');
        };

        $scope.viewContractFile = function(){
            Contract.download($scope.contract.id,
                function(result){
                    var file = null;
                    if($scope.contract.contractFilePath.endsWith('pdf')){
                        file = new Blob([result], { type: 'application/pdf' });
                    } else if($scope.contract.contractFilePath.endsWith('doc')){
                        file = new Blob([result], { type: 'application/doc' });
                    } else {
                        file = new Blob([result], { type: 'application/txt' });
                    }

                    window.open(URL.createObjectURL(file));
                });
        };

        $scope.deleteContractFile = function () {
            $('#deleteContractFile_Confirmation').modal('show');
        };

        $scope.confirmUploadFile = function () {
            if($scope.uploadedFile){
                var file = $scope.uploadedFile;
                var fd = new FormData();
                fd.append('file', file);
                var params = {
                    type: 'ContractContent',
                    id : $scope.contract.id
                };
                FileUpload.setParameter(params);
                FileUpload.upload().uploadFile(fd, onUploadFinished);
            }
        };

        $scope.confirmDeleteFile = function () {
            Contract.deleteContractFile($scope.contract.id,
                function(result){
                    $('#deleteContractFile_Confirmation').modal('hide');
                    $scope.load($scope.contract.id);
                })
        };

        $scope.selectFile = function(files){
            $scope.uploadedFile = files[0];
            $('#uploadFile_Confirmation').modal('show');
            $scope.$apply();
        };
        var onUploadFinished = function(result){
            if(result.status == 'done'){
                $('#uploadFile_Confirmation').modal('hide');
                $scope.load($scope.contract.id);
            } else if(result.status = 'error'){
                console.log("error");
            }
        };
        $scope.isFileSelected = function() {
            if($scope.uploadedFile){
                return true;
            } else {
                return false;
            }
        };

    });
