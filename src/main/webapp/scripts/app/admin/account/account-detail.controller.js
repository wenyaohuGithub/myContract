'use strict';

angular.module('mycontractApp')
    .controller('AccountDetailController', function ($scope, $rootScope, $stateParams, $state, entity, Account, accountId) {
        $scope.account = entity;
        $scope.load = function (id) {
            Account.getAccount().getAccount({id: id}, function(result) {
                $scope.account = result;
            });
        };
        $rootScope.$on('mycontractApp:accountUpdate', function(event, result) {
            $scope.account = result;
        });

        $scope.accountId = accountId;
        $scope.show = false;
    });
