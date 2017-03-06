'use strict';

angular.module('mycontractApp')
    .controller('AuthorityDetailController', function ($scope, $rootScope, $stateParams, entity, Authority) {
        $scope.authority = entity;
        $scope.load = function (name) {
            Authority.get({name: name}, function(result) {
                $scope.authority = result;
            });
        };
        $rootScope.$on('mycontractApp:authorityUpdate', function(event, result) {
            $scope.authority = result;
        });
    });
