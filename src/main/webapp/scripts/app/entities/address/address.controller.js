'use strict';

angular.module('mycontractApp')
    .controller('AddressController', function ($scope, Address, ParseLinks) {
        $scope.addresss = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Address.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.addresss = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Address.get({id: id}, function(result) {
                $scope.address = result;
                $('#deleteAddressConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Address.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteAddressConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.address = {address_line_1: null, address_line_2: null, city: null, province: null, country: null, postal_code: null, id: null};
        };
    });
