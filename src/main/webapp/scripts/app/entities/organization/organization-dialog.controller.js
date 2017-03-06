'use strict';

angular.module('mycontractApp').controller('OrganizationDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Organization',
        function($scope, $stateParams, $modalInstance, entity, Organization) {

        $scope.organization = entity;
        $scope.load = function(id) {
            Organization.get({id : id}, function(result) {
                $scope.organization = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:organizationUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.organization.id != null) {
                Organization.update($scope.organization, onSaveFinished);
            } else {
                Organization.save($scope.organization, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
