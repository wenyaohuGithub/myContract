'use strict';

angular.module('mycontractApp')
    .controller('OrganizationController', function ($scope, Organization, ParseLinks) {
        $scope.organizations = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Organization.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.organizations = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Organization.get({id: id}, function(result) {
                $scope.organization = result;
                $('#deleteOrganizationConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Organization.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteOrganizationConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.organization = {name: null, description: null, active: null, session_timeout: null, smtp_enabled: null, smtp_server_address: null, smtp_username: null, smtp_password: null, smtp_port: null, id: null};
        };
    });
