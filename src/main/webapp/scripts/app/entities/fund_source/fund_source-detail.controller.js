'use strict';

angular.module('mycontractApp')
    .controller('Fund_sourceDetailController', function ($scope, $rootScope, $stateParams, entity, Fund_source) {
        $scope.fund_source = entity;
        $scope.load = function (id) {
            Fund_source.get({id: id}, function(result) {
                $scope.fund_source = result;
            });
        };
        $rootScope.$on('mycontractApp:fund_sourceUpdate', function(event, result) {
            $scope.fund_source = result;
        });
    });
