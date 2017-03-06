'use strict';

angular.module('mycontractApp').controller('RoleDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Role',
        function($scope, $stateParams, $modalInstance, entity, Role) {

        $scope.role = entity;
        $scope.load = function(id) {
            Role.get({id : id}, function(result) {
                $scope.role = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:roleUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.role.id != null) {
                Role.update($scope.role, onSaveFinished);
            } else {
                Role.save($scope.role, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
