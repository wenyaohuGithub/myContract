'use strict';

angular.module('mycontractApp')
    .controller('Contract_partyController', function ($scope, Contract_party, ParseLinks) {
        $scope.contract_parties = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Contract_party.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.contract_parties = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Contract_party.get({id: id}, function(result) {
                $scope.contract_party = result;
                $('#deleteContract_partyConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Contract_party.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteContract_partyConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.contract_party = {name: null, description: null, registration_id: null, registered_capital: null, legal_representative: null, registration_inspection_record: null, professional_certificate: null, business_certificate: null, id: null};
        };
    });
