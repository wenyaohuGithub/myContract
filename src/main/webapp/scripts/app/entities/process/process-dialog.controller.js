'use strict';

angular.module('mycontractApp').controller('ProcessDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Process', 'Role',
        function($scope, $stateParams, $modalInstance, entity, Process, Role) {

        $scope.process = entity;
        $scope.roles = Role.query();
        $scope.load = function(id) {
            Process.get({id : id}, function(result) {
                $scope.process = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:processUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.process.id != null) {
                Process.update($scope.process, onSaveFinished);
            } else {
                Process.save($scope.process, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
