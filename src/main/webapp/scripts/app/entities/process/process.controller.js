'use strict';

angular.module('mycontractApp')
    .controller('ProcessController', function ($scope, Process, ParseLinks) {
        $scope.processes = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Process.query({page: $scope.page, per_page: 20}, function(result, status, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.processes = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Process.get({id: id}, function(result) {
                $scope.process = result;
                $('#deleteProcessConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Process.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteProcessConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.process = {name: null, description: null, id: null};
        };
    });
