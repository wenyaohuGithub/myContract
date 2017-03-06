'use strict';

angular.module('mycontractApp').controller('UserDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'User',
        function($scope, $stateParams, $modalInstance, entity, User) {

        $scope.user = entity;
        $scope.data = {
            selectedDept:null
        };

        $scope.load = function(id) {
            User.getUser().getUser({id : id}, function(result) {
                $scope.user = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:userUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.user.id != null) {
                User.updateUser().updateUser({id: $scope.user.id}, $scope.user, onSaveFinished);
            } else {
                $scope.user.departmentId = $scope.data.selectedDept.id;
                User.createUser().createUser($scope.user, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
