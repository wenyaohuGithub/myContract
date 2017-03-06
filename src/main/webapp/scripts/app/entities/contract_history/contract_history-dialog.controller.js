'use strict';

angular.module('mycontractApp').controller('Contract_historyDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Contract_history', 'Contract', 'User', 'Process',
        function($scope, $stateParams, $modalInstance, entity, Contract_history, Contract, User, Process) {

        $scope.contract_history = entity;
        $scope.contracts = Contract.query();
        $scope.users = User.query();
        $scope.processs = Process.query();
        $scope.load = function(id) {
            Contract_history.get({id : id}, function(result) {
                $scope.contract_history = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:contract_historyUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.contract_history.id != null) {
                Contract_history.update($scope.contract_history, onSaveFinished);
            } else {
                Contract_history.save($scope.contract_history, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
