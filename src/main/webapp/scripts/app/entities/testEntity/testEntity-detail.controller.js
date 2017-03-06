'use strict';

angular.module('mycontractApp')
    .controller('TestEntityDetailController', function ($scope, $rootScope, $stateParams, entity, TestEntity) {
        $scope.testEntity = entity;
        $scope.load = function (id) {
            TestEntity.get({id: id}, function(result) {
                $scope.testEntity = result;
            });
        };
        $rootScope.$on('mycontractApp:testEntityUpdate', function(event, result) {
            $scope.testEntity = result;
        });
    });
