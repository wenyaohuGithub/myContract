'use strict';

angular.module('mycontractApp')
    .controller('UserDetailController', function ($scope, $rootScope, $stateParams, $state, entity, User, userId) {
        $scope.user = entity;
        $scope.load = function (id) {
            User.getUser().getUser({id: id}, function(result) {
                $scope.user = result;
            });
        };
        $rootScope.$on('mycontractApp:userUpdate', function(event, result) {
            $scope.user = result;
        });

        $scope.removeUserRole = function(roleName) {
            var index = $scope.user.roles.indexOf(roleName);
            if (index >= 0) {
                $scope.user.roles.splice(index, 1);
            }
        };

        $scope.addRole = function(role){
            $scope.show = true;
            $scope.user.roles.push(role.name);
            $scope.show = false;
        };

        $scope.showRole = function(){
            $scope.show = true;
        };

        $scope.addUserRoles = function() {
            User.updateUserRoles().updateUserRoles({id: $scope.user.id}, $scope.user.roles, function(result){
                $state.go('user.detail', {id: $scope.user.id}, { reload: true });
            });
        };

        $scope.userId = userId;
        $scope.show = false;
    });
