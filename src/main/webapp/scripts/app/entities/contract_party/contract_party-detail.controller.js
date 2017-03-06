'use strict';

angular.module('mycontractApp')
    .controller('Contract_partyDetailController', function ($scope, $rootScope, $stateParams, $timeout, entity, Contract_party, Address, Bank_account) {
        $scope.contract_party = entity;
        $scope.address = {};
        $scope.bank_accounts = [];
        $scope.showAddButton = true;
        $scope.showNewBankInfo = false;
        $scope.showCancelSave = false;

        $timeout(function() {
            if($scope.contract_party){
                $scope.address = $scope.contract_party.address;
                $scope.bank_accounts = $scope.contract_party.bank_accounts;
            }
        });
        $scope.load = function (id) {
            Contract_party.get({id: id}, function(result) {
                $scope.contract_party = result;
                $scope.address = $scope.contract_party.address;
            });
        };
        $rootScope.$on('mycontractApp:contract_partyUpdate', function(event, result) {
            $scope.contract_party = result;
        });

        $scope.showNewBank = function(){
            $scope.showNewBankInfo = true;
            $scope.showAddButton = false;
            $scope.showCancelSave = true;
        };

        $scope.clearBankInfo = function(){
            $scope.showNewBankInfo = false;
            $scope.showAddButton = true;
            $scope.bank_account = {};
        };

        $scope.saveBank = function(){
            if ($scope.bank_account.id != null) {
                Bank_account.update($scope.bank_account, onSaveFinished);
            } else {
                $scope.bank_account.owner_id = $scope.contract_party.id;
                Bank_account.save($scope.bank_account, onSaveFinished);
            }
        };

        var onSaveFinished = function (result) {
            $scope.bank_accounts.push(result);
            $scope.showNewBankInfo = false;
            $scope.showAddButton = true;
            $scope.bank_account = {};
        };

    });
