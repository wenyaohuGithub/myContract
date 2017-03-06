'use strict';

angular.module('mycontractApp')
    .controller('Contract_processDetailController', function ($scope, $rootScope, $stateParams, entity, Contract_process, Contract, Process, Department, User) {
        $scope.contract_process = entity;
        $scope.load = function (id) {
            Contract_process.get({id: id}, function(result) {
                $scope.contract_process = result;
            });
        };
        $rootScope.$on('mycontractApp:contract_processUpdate', function(event, result) {
            $scope.contract_process = result;
        });
    });
