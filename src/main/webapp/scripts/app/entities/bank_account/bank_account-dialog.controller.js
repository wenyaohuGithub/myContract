'use strict';

angular.module('mycontractApp').controller('Bank_accountDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Bank_account',
        function($scope, $stateParams, $modalInstance, entity, Bank_account) {

        $scope.bank_account = entity;
        $scope.load = function(id) {
            Bank_account.get({id : id}, function(result) {
                $scope.bank_account = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:bank_accountUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.bank_account.id != null) {
                Bank_account.update($scope.bank_account, onSaveFinished);
            } else {
                Bank_account.save($scope.bank_account, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
