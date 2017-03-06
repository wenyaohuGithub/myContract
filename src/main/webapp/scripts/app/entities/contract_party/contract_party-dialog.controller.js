'use strict';

angular.module('mycontractApp').controller('Contract_partyDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Contract_party', 'Address', 'Bank_account',
        function($scope, $stateParams, $modalInstance, entity, Contract_party, Address, Bank_account) {

        $scope.contract_party = entity;
        $scope.addresss = Address.query();
        $scope.bank_accounts = Bank_account.query();
        $scope.load = function(id) {
            Contract_party.get({id : id}, function(result) {
                $scope.contract_party = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:contract_partyUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.contract_party.id != null) {
                Contract_party.update($scope.contract_party, onSaveFinished);
            } else {
                Contract_party.save($scope.contract_party, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
