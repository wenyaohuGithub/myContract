'use strict';

angular.module('mycontractApp')
    .controller('DepartmentController', function ($scope, Department, ParseLinks, Principal) {
        $scope.departments = [];
        $scope.internalDivisions = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Department.query().query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.departments = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };

        $scope.loadInternal = function(){
            Principal.identity().then(function(account) {
                $scope.account = account;
                Department.getInternalDivisions().getInternalDivisions({id: $scope.account.id}, function(result){
                    $scope.internalDivisions = result;
                });
            });
        }

        $scope.loadAll();

        $scope.loadInternal();


        $scope.delete = function (id) {
            Department.getDepartment().getDepartment({id: id}, function(result) {
                $scope.department = result;
                $('#deleteDepartmentConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Department.deleteDepartment().deleteDepartment({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteDepartmentConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.department = {name: null, description: null, note: null, id: null};
        };
    });
