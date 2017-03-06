'use strict';

angular.module('mycontractApp')
    .controller('ProjectController', function ($scope, Project, ParseLinks) {
        $scope.projects = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Project.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.projects = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Project.get({id: id}, function(result) {
                $scope.project = result;
                $('#deleteProjectConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Project.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteProjectConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.project = {name: null, identifier: null, description: null, manager: null, id: null};
        };
    });
