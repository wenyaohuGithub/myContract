'use strict';

angular.module('mycontractApp')
    .controller('ContractController', function ($scope, $state, Contract, ParseLinks) {
        $scope.contracts = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Contract.query({page: $scope.page, per_page: 10}, function(result, status, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.contracts = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        if($state.params.searchResults){
            $scope.contracts = $state.params.searchResults.result;
            $scope.links = ParseLinks.parse($state.params.searchResults.headers('link'));
        } else {
            $scope.loadAll();
        }

        $scope.delete = function (id) {
            Contract.get(id, function(result) {
                $scope.contract = result;
                $('#deleteContractConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Contract.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteContractConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.contract = {name: null, review_identifier: null, contract_identifier: null, contracting_method: null, amount: null, amount_written: null, currency: null, amount_current_year: null, submit_date: null, start_date: null, end_date: null, expire_date: null, is_multi_year: null, status: null, state: null, approve_date: null, sign_date: null, archive_date: null, id: null};
        };
    });
