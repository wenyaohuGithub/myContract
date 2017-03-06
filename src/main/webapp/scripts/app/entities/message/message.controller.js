'use strict';

angular.module('mycontractApp')
    .controller('MessageController', function ($scope, Message) {
        $scope.messages = [];
        $scope.loadAll = function() {
            Message.query(function(result) {
               $scope.messages = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Message.get({id: id}, function(result) {
                $scope.message = result;
                $('#deleteMessageConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Message.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteMessageConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.message = {subject: null, content: null, send_datetime: null, read: null, id: null};
        };
    });
