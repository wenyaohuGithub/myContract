'use strict';

angular.module('mycontractApp')
    .controller('Contract_processController', function ($scope, Contract_process) {
        $scope.contract_processs = [];
        $scope.loadAll = function() {
            Contract_process.query(function(result) {
               $scope.contract_processs = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Contract_process.get({id: id}, function(result) {
                $scope.contract_process = result;
                $('#deleteContract_processConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Contract_process.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteContract_processConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.contract_process = {sequence: null, id: null};
        };
    });
