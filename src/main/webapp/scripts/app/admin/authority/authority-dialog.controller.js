'use strict';

angular.module('mycontractApp').controller('AuthorityDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Role',
        function($scope, $stateParams, $modalInstance, entity, Authority) {

        $scope.authority = entity;
        $scope.load = function(id) {
            Authority.get({id : id}, function(result) {
                $scope.authority = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:roleUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.authority.id != null) {
                Authority.update($scope.authority, onSaveFinished);
            } else {
                Authority.save($scope.authority, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
