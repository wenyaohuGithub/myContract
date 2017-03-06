'use strict';

angular.module('mycontractApp').controller('Contract_processDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Contract_process', 'Contract', 'Process', 'Department', 'User',
        function($scope, $stateParams, $modalInstance, entity, Contract_process, Contract, Process, Department, User) {

        $scope.contract_process = entity;
        $scope.contracts = Contract.query();
        $scope.processs = Process.query();
        $scope.departments = Department.query();
        $scope.users = User.query();
        $scope.load = function(id) {
            Contract_process.get({id : id}, function(result) {
                $scope.contract_process = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:contract_processUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.contract_process.id != null) {
                Contract_process.update($scope.contract_process, onSaveFinished);
            } else {
                Contract_process.save($scope.contract_process, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
