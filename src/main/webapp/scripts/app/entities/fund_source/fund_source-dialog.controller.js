'use strict';

angular.module('mycontractApp').controller('Fund_sourceDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Fund_source',
        function($scope, $stateParams, $modalInstance, entity, Fund_source) {

        $scope.fund_source = entity;
        $scope.load = function(id) {
            Fund_source.get({id : id}, function(result) {
                $scope.fund_source = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:fund_sourceUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.fund_source.id != null) {
                Fund_source.update($scope.fund_source, onSaveFinished);
            } else {
                Fund_source.save($scope.fund_source, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
