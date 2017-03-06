'use strict';

angular.module('mycontractApp')
    .controller('FirstEntityController', function ($scope, FirstEntity, ParseLinks) {
        $scope.firstEntitys = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            FirstEntity.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.firstEntitys = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            FirstEntity.get({id: id}, function(result) {
                $scope.firstEntity = result;
                $('#deleteFirstEntityConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            FirstEntity.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteFirstEntityConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.firstEntity = {name: null, id: null};
        };
    });
