'use strict';

angular.module('mycontractApp')
    .controller('NavbarController', function ($scope, $location, $state, $timeout, Auth, Principal, Message) {
        $scope.isAuthenticated = Principal.isAuthenticated;
        $scope.$state = $state;
        $scope.logout = function () {
            Auth.logout();
            $state.go('login');
        };

        $scope.messages = [];
        Message.query(function(result, status, headers) {
            $scope.messages = result;
        });
    });
