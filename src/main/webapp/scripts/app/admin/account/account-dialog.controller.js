'use strict';

angular.module('mycontractApp').controller('AccountDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Account',
        function($scope, $stateParams, $modalInstance, entity, Account) {

        $scope.account = entity;
        $scope.data = {
            selectedDept:null
        };

        $scope.load = function(id) {
            Account.getAccount().getAccount({id : id}, function(result) {
                $scope.account = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:accountUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.account.id != null) {
                User.updateAccount().updateAccount({id: $scope.account.id}, $scope.account, onSaveFinished);
            } else {
                Account.createAccount().createAccount($scope.account, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
