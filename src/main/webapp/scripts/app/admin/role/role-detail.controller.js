'use strict';

angular.module('mycontractApp')
    .controller('RoleDetailController', function ($scope, $rootScope, $stateParams, entity, Role) {
        $scope.role = entity;
        $scope.load = function (name) {
            Role.get({name: name}, function(result) {
                $scope.role = result;
            });
        };
        $rootScope.$on('mycontractApp:roleUpdate', function(event, result) {
            $scope.role = result;
        });
    });
