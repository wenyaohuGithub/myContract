'use strict';

angular.module('mycontractApp')
    .controller('AccountController',function ($scope, Account) {
        $scope.accounts = [];
        $scope.loadAll = function() {
            Account.query().query(function(result) {
                $scope.accounts = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            $scope.selectedAccountId = id;
            $('#deleteAccountConfirmation').modal('show');
        };

        $scope.confirmDelete = function () {
            Account.deleteAccount().deleteAccount({id: $scope.selectedAccountId},
                function () {
                    $scope.loadAll();
                    $('#deleteAccountConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.account = {name: null, id: null};
        };
    });
