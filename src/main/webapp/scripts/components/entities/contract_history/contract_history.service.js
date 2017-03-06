'use strict';

/*angular.module('mycontractApp')
    .factory('Contract_history', function ($resource, DateUtils) {
        return $resource('api/contract_historys/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.action_datetime = DateUtils.convertDateTimeFromServer(data.action_datetime);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });
*/
angular.module('mycontractApp')
    .factory('Contract_history', function ($http, $q, DateUtils, UrlParams) {
        return {
            get: function(params){
                var id = params.id;
                var deferred = $q.defer();
                $http.get('api/processes/'+id).success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            query: function(params, callback) {
                var urlParamString = UrlParams.parseParam(params);
                $http.get('api/contract_histories'+urlParamString).success(callback);
            },
            update: function() {
                var deferred = $q.defer();
                $http.put('api/contract_histories/:id').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            delete: function() {
                var deferred = $q.defer();
                $http.delete('api/contract_histories').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            save: function() {
                var deferred = $q.defer();
                $http.post('api/contract_histories').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            }
        }
    });
