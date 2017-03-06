'use strict';

angular.module('mycontractApp')
    .controller('FirstEntityDetailController', function ($scope, $rootScope, $stateParams, entity, FirstEntity) {
        $scope.firstEntity = entity;
        $scope.load = function (id) {
            FirstEntity.get({id: id}, function(result) {
                $scope.firstEntity = result;
            });
        };
        $rootScope.$on('mycontractApp:firstEntityUpdate', function(event, result) {
            $scope.firstEntity = result;
        });
    });
