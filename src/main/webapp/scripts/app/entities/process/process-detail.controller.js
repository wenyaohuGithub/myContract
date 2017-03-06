'use strict';

angular.module('mycontractApp')
    .controller('ProcessDetailController', function ($scope, $rootScope, $stateParams, entity, Process, Role) {
        $scope.process = entity;
        $scope.load = function (id) {
            Process.get({id: id}, function(result) {
                $scope.process = result;
            });
        };
        $rootScope.$on('mycontractApp:processUpdate', function(event, result) {
            $scope.process = result;
        });
    });
