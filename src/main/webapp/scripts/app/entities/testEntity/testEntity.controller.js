'use strict';

angular.module('mycontractApp')
    .controller('TestEntityController', function ($scope, TestEntity) {
        $scope.testEntitys = [];
        $scope.loadAll = function() {
            TestEntity.query(function(result) {
               $scope.testEntitys = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            TestEntity.get({id: id}, function(result) {
                $scope.testEntity = result;
                $('#deleteTestEntityConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            TestEntity.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteTestEntityConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.testEntity = {testField: null, id: null};
        };
    });
