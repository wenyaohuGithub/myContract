'use strict';

angular.module('mycontractApp').controller('TestEntityDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'TestEntity',
        function($scope, $stateParams, $modalInstance, entity, TestEntity) {

        $scope.testEntity = entity;
        $scope.load = function(id) {
            TestEntity.get({id : id}, function(result) {
                $scope.testEntity = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:testEntityUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.testEntity.id != null) {
                TestEntity.update($scope.testEntity, onSaveFinished);
            } else {
                TestEntity.save($scope.testEntity, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
