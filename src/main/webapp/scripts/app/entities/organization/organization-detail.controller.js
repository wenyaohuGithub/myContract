'use strict';

angular.module('mycontractApp')
    .controller('OrganizationDetailController', function ($scope, $rootScope, $stateParams, entity, Organization) {
        $scope.organization = entity;
        $scope.load = function (id) {
            Organization.get({id: id}, function(result) {
                $scope.organization = result;
            });
        };
        $rootScope.$on('mycontractApp:organizationUpdate', function(event, result) {
            $scope.organization = result;
        });
    });
