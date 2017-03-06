'use strict';

angular.module('mycontractApp').controller('TaskDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Task', 'Contract', 'Process', 'Department', 'User',
        function($scope, $stateParams, $modalInstance, entity, Task, Contract, Process, Department, User) {

        $scope.task = entity;
        $scope.contracts = Contract.query();
        $scope.processs = Process.query();
        $scope.departments = Department.query();
        $scope.users = User.query();
        $scope.load = function(id) {
            Task.get({id : id}, function(result) {
                $scope.task = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:taskUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.task.id != null) {
                Task.update($scope.task, onSaveFinished);
            } else {
                Task.save($scope.task, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
