'use strict';

angular.module('mycontractApp')
    .controller('ProjectDetailController', function ($scope, $rootScope, $stateParams, entity, Project) {
        $scope.project = entity;
        $scope.load = function (id) {
            Project.get({id: id}, function(result) {
                $scope.project = result;
            });
        };
        $rootScope.$on('mycontractApp:projectUpdate', function(event, result) {
            $scope.project = result;
        });
    });
