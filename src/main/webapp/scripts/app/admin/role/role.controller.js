'use strict';

angular.module('mycontractApp')
    .controller('RoleController', function ($scope, Role) {
        $scope.roles = [];
        $scope.loadAll = function() {
            Role.query(function(result) {
               $scope.roles = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Role.get({id: id}, function(result) {
                $scope.role = result;
                $('#deleteRoleConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Role.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteRoleConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.role = {name: null, id: null};
        };
    });
    /*.filter('findRoleFromKey', function () {
        return function (role) {
            return {
                "ROLE_ADMIN": "System Administrator",
                "ROLE_USER": "Regular User",
                "ROLE_CONFIG": "System Configuration User"
            }[role];
        }
    });*/
