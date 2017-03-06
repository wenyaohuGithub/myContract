'use strict';

angular.module('mycontractApp')
    .controller('UserController',function ($scope, User) {
        $scope.users = [];
        $scope.loadAll = function() {
            User.query().query(function(result) {
                $scope.users = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            $scope.selectedUserId = id;
            $('#deleteUserConfirmation').modal('show');
        };

        $scope.confirmDelete = function () {
            User.deleteUser().deleteUser({id: $scope.selectedUserId},
                function () {
                    $scope.loadAll();
                    $('#deleteUserConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.user = {name: null, id: null};
        };
    });
