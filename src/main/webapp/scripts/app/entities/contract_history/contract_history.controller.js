'use strict';

angular.module('mycontractApp')
    .controller('Contract_historyController', function ($scope, Contract_history, ParseLinks) {
        $scope.contract_historys = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Contract_history.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.contract_historys = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Contract_history.get({id: id}, function(result) {
                $scope.contract_history = result;
                $('#deleteContract_historyConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Contract_history.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteContract_historyConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.contract_history = {note: null, action: null, action_datetime: null, id: null};
        };
    });
