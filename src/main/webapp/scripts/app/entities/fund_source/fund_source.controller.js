'use strict';

angular.module('mycontractApp')
    .controller('Fund_sourceController', function ($scope, Fund_source, ParseLinks) {
        $scope.fund_sources = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Fund_source.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.fund_sources = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Fund_source.get({id: id}, function(result) {
                $scope.fund_source = result;
                $('#deleteFund_sourceConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Fund_source.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteFund_sourceConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.fund_source = {name: null, description: null, deleted: null, deleted_date_time: null, id: null};
        };
    });
