'use strict';

angular.module('mycontractApp')
    .controller('Contract_sampleController', function ($scope, Contract_sample, ParseLinks) {
        $scope.contract_samples = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Contract_sample.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.contract_samples = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Contract_sample.get({id: id}, function(result) {
                $scope.contract_sample = result;
                $('#deleteContract_sampleConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Contract_sample.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteContract_sampleConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.contract_sample = {name: null, description: null, path: null, file_name: null, uploaded_by: null, uploaded_date_time: null, modified_date_time: null, revision: null, id: null};
        };
    });
