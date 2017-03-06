'use strict';

angular.module('mycontractApp')
    .controller('TaskController', function ($scope, Task) {
        $scope.tasks = [];
        $scope.loadAll = function() {
            Task.query(function(result) {
               $scope.tasks = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Task.get({id: id}, function(result) {
                $scope.task = result;
                $('#deleteTaskConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Task.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteTaskConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.task = {sequence: null, id: null};
        };
    });
