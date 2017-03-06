'use strict';

angular.module('mycontractApp').controller('CategoryDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Category',
        function($scope, $stateParams, $modalInstance, entity, Category) {

        $scope.category = entity;
        $scope.load = function(id) {
            Category.get({id : id}, function(result) {
                $scope.category = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:categoryUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.category.id != null) {
                Category.update($scope.category, onSaveFinished);
            } else {
                Category.save($scope.category, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
