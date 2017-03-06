'use strict';

angular.module('mycontractApp')
    .controller('ContractSearchController', function ($scope, $modalInstance, $rootScope, $state, $stateParams, $timeout, DateUtils, Contract, searchTerm) {
        $scope.searchText = searchTerm;
        $scope.page = 1;
        $scope.search = function(){
            var searchStr;
            if($scope.searchText.name){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr +';'+'name:'+$scope.searchText.name;
                } else {
                    searchStr = 'name:'+$scope.searchText.name;
                }
            }
            if($scope.searchText.contractParty){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr + ';'+'contractPartyId:'+$scope.searchText.contractParty.id;
                } else {
                    searchStr = 'contractPartyId:'+$scope.searchText.contractParty.id;
                }
            }
            if($scope.searchText.amount1){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr + ';'+'amount1:'+$scope.searchText.amount1;
                } else {
                    searchStr = 'amount1:'+$scope.searchText.amount1;
                }
            }
            if($scope.searchText.amount2){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr + ';'+'amount2:'+$scope.searchText.amount2;
                } else {
                    searchStr = 'amount2:'+$scope.searchText.amount2;
                }
            }
            if($scope.searchText.signDate1){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr + ';'+'signDate1:'+DateUtils.convertDatetimeToString($scope.searchText.signDate1);
                } else {
                    searchStr = 'signDate1:'+DateUtils.convertDatetimeToString($scope.searchText.signDate1);
                }
            }
            if($scope.searchText.signDate2){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr + ';'+'signDate2:'+DateUtils.convertDatetimeToString($scope.searchText.signDate2);
                } else {
                    searchStr = 'signDate2:'+DateUtils.convertDatetimeToString($scope.searchText.signDate2);
                }
            }

            Contract.search({search: searchStr, page: $scope.page, per_page: 10}, function(result, status, headers) {
                var searchResult = {};
                searchResult.result = result;
                searchResult.headers = headers;
                $modalInstance.close(searchResult);
            });
        }

        $scope.clear = function () {
            $modalInstance.close(null);
        };
    });
