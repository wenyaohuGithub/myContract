'use strict';

angular.module('mycontractApp').controller('WorkflowDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Workflow', 'Process',
        function($scope, $stateParams, $modalInstance, entity, Workflow, Process) {

        $scope.workflow = entity;
        $scope.processs = Process.query();
        $scope.load = function(id) {
            Workflow.get({id : id}, function(result) {
                $scope.workflow = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:workflowUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.workflow.id != null) {
                Workflow.update($scope.workflow, onSaveFinished);
            } else {
                Workflow.save($scope.workflow, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
