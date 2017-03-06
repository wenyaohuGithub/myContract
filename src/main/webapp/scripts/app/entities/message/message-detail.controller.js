'use strict';

angular.module('mycontractApp')
    .controller('MessageDetailController', function ($scope, $rootScope, $stateParams, entity, Message, User) {
        $scope.message = entity;
        $scope.load = function (id) {
            Message.get({id: id}, function(result) {
                $scope.message = result;
            });
        };
        $rootScope.$on('mycontractApp:messageUpdate', function(event, result) {
            $scope.message = result;
        });
    });
