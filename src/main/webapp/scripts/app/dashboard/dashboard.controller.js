'use strict';

angular.module('mycontractApp')
    .controller('DashboardController', function ($scope, Principal, Message) {
        Principal.identity().then(function(account) {
            $scope.account = account;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });
    });
