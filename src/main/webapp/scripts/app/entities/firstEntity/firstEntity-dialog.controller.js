'use strict';

angular.module('mycontractApp').controller('FirstEntityDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'FirstEntity',
        function($scope, $stateParams, $modalInstance, entity, FirstEntity) {

        $scope.firstEntity = entity;
        $scope.load = function(id) {
            FirstEntity.get({id : id}, function(result) {
                $scope.firstEntity = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:firstEntityUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.firstEntity.id != null) {
                FirstEntity.update($scope.firstEntity, onSaveFinished);
            } else {
                FirstEntity.save($scope.firstEntity, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.openEdit = function() {
            $modalInstance.close();
            $modal.open({
                templateUrl: 'scripts/app/entities/firstEntity/firstEntity-dialog.html',
                controller: 'FirstEntityDialogController',
                size: 'lg',
                resolve: {
                    entity: ['FirstEntity', function(FirstEntity) {
                        return FirstEntity.get({id : $stateParams.id});
                    }]
                }
            }).result.then(function(result) {
                $state.go('firstEntity', null, { reload: true });
            }, function() {
                $state.go('^');
            })
        };
}]);
