'use strict';

angular.module('mycontractApp')
    .controller('ContractDetailController', function ($scope, $rootScope, $state, $stateParams, $timeout, entity, Contract) {
        $scope.contract = entity;

        $scope.load = function (id) {
            Contract.get(id, function(result) {
                $scope.contract = result;
                $scope.$apply();
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
    });
