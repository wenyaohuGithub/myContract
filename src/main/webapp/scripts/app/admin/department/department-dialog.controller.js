'use strict';

angular.module('mycontractApp').controller('DepartmentDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Department', 'Person',
        function($scope, $stateParams, $modalInstance, entity, Department, Person) {

        $scope.department = entity;
        $scope.persons = Person.query();
        $scope.load = function(id) {
            Department.get({id : id}, function(result) {
                $scope.department = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:departmentUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.department.id != null) {
                Department.update($scope.department, onSaveFinished);
            } else {
                Department.save($scope.department, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
