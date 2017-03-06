'use strict';

angular.module('mycontractApp')
    .controller('ContractDetailActivitiesController', function ($q, $scope, $rootScope, $state, $stateParams, $timeout, entity, Contract, Contract_history) {
        $scope.contract = entity;
        $scope.contract_histories = [];
        $scope.showComment = false
        $scope.showAddButton = true;
        $scope.showCancelSave = false;

        $timeout(function(){
            if($scope.contract.id){
                Contract_history.query({contractId: $scope.contract.id}, function(result, headers) {
                    $scope.contract_histories = result;
                });
            }
        }, 500);

        $scope.showCommentArea = function() {
            $scope.showComment = true;
            $scope.showAddButton = false;
            $scope.showCancelSave = true;
            $timeout(function() {
                $('#commentArea').focus();
            });
        };

        $scope.cancelComment = function() {
            $scope.showComment = false;
            $scope.showAddButton = true;
            $scope.addedComment = null;
            $scope.showCancelSave = false;
        };

        $scope.addComment = function() {
            var comment = {
                note: $scope.addedComment
            };
            Contract.addComment($scope.contract.id, comment, function(data){
                $scope.showComment = false;
                $scope.showAddButton = true;
                $scope.addedComment = null;
                $scope.showCancelSave = false;
                Contract_history.query({contractId: $scope.contract.id}, function(result, headers) {
                    $scope.contract_histories = result;
                });
            })
        };

        $scope.getHistories = function(){
            Contract_history.query({contractId: $scope.contract.id}, function(result, headers) {
                $scope.contract_histories = result;
            });
        };

    });
