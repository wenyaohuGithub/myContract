'use strict';

angular.module('mycontractApp')
    .controller('Bank_accountController', function ($scope, Bank_account, ParseLinks) {
        $scope.bank_accounts = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Bank_account.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.bank_accounts = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Bank_account.get({id: id}, function(result) {
                $scope.bank_account = result;
                $('#deleteBank_accountConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Bank_account.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteBank_accountConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.bank_account = {bank_name: null, account_name: null, account_number: null, id: null};
        };
    });
