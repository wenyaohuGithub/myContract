'use strict';

angular.module('mycontractApp')
    .controller('TaskDetailController', function ($scope, $rootScope, $stateParams, entity, Task, Contract, Process, Department, User) {
        $scope.task = entity;
        $scope.load = function (id) {
            Task.get({id: id}, function(result) {
                $scope.task = result;
            });
        };
        $rootScope.$on('mycontractApp:taskUpdate', function(event, result) {
            $scope.task = result;
        });
    });
