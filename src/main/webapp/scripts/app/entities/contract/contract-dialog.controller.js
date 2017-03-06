'use strict';

angular.module('mycontractApp').controller('ContractDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Contract', 'Contract_party', 'Department', 'Category', 'Fund_source', 'Contract_sample', 'Process',
        function($scope, $stateParams, $modalInstance, entity, Contract, Contract_party, Department, Category, Fund_source, Contract_sample, Process) {

        $scope.contract = entity;
        $scope.contract_parties = Contract_party.query();
        $scope.departments = Department.query();
        $scope.categorys = Category.query();
        $scope.fund_sources = Fund_source.query();
        $scope.contract_samples = Contract_sample.query();
        $scope.addedRelatedInternvalDivisions = [];
        $scope.nextProcesses = [];

        $scope.getNextProcess = function(workflowId){
            Process.getAvailableProcesses({current: 1, workflow: workflowId}, function(result){
                $scope.nextProcesses = result;
                $scope.selectedStep = $scope.nextProcesses[0];
            });
        };

        $scope.load = function(id) {
            Contract.get(id, function(result) {
                $scope.contract = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:contractUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.contract.id != null) {
                Contract.update($scope.contract, onSaveFinished);
            } else {
                if($scope.contract.category){
                    $scope.contract.category = $scope.contract.category.id;
                }
                $scope.contract.contractParty = $scope.contract.contractParty.id;
                angular.forEach($scope.addedRelatedInternvalDivisions, function(value){
                    $scope.contract.relatedDepartments.push(value.id);
                });
                Contract.save($scope.contract, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.addParty = function(addedParty){
            if($scope.contract.contractParties == null){
                $scope.contract.contractParties = [];
            }
            $scope.contract.contractParties.push(addedParty.id);
        };

        $scope.addDivs = function(selectedDiv){
            if($scope.contract.relatedDepartments == null){
                $scope.contract.relatedDepartments = [];
            }
            $scope.addedRelatedInternvalDivisions.push(selectedDiv);
        };

        $scope.addProject = function(addedProject){
            if($scope.contract.projects == null){
                $scope.contract.projects = [];
            }
            $scope.contract.projects.push(addedProject.id);
        };

        $scope.categorySelected = function(){
            $scope.getNextProcess($scope.contract.category.workflow.id);
        };

        $scope.removeInternalDivs = function(removedDept){
            var index = $scope.addedRelatedInternvalDivisions.indexOf(removedDept);
            $scope.addedRelatedInternvalDivisions.splice(index, 1);
        };


}]);
