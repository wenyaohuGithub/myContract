'use strict';

angular.module('mycontractApp')
    .controller('AuthorityController', function ($scope, Authority) {
        $scope.authorities = [];
        $scope.loadAll = function() {
            Authority.query(function(result) {
               $scope.authorities = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Authority.get({id: id}, function(result) {
                $scope.authority = result;
                $('#deleteAuthorityConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Authority.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteAuthorityConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.authority = {name: null, id: null};
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
