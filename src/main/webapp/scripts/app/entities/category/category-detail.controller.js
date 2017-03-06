'use strict';

angular.module('mycontractApp')
    .controller('CategoryDetailController', function ($scope, $rootScope, $stateParams, entity, Category) {
        $scope.category = entity;
        $scope.load = function (id) {
            Category.get({id: id}, function(result) {
                $scope.category = result;
            });
        };
        $rootScope.$on('mycontractApp:categoryUpdate', function(event, result) {
            $scope.category = result;
        });
    });
