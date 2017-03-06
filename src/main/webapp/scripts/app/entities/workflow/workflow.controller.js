'use strict';

angular.module('mycontractApp')
    .controller('WorkflowController', function ($scope, Workflow, AuthServerProvider) {
        $scope.workflows = [];
        $scope.loadAll = function() {
            Workflow.query({accountId: AuthServerProvider.getToken().account.id},function(result) {
               $scope.workflows = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Workflow.get({id: id}, function(result) {
                $scope.workflow = result;
                $('#deleteWorkflowConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Workflow.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteWorkflowConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.workflow = {name: null, description: null, id: null};
        };
    });
