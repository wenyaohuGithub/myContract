'use strict';
/*
angular.module('mycontractApp')
    .factory('Process', function ($resource, DateUtils) {
        return $resource('api/processes/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });
*/
angular.module('mycontractApp')
    .factory('Process', function ($http, $q, DateUtils) {
        var parseParam = function(params){
            var urlParamString = '';
            angular.forEach(params, function(paramInfo, urlParam){
                if(urlParamString == ''){
                    urlParamString = urlParamString+'?'+urlParam+'='+paramInfo;
                } else {
                    urlParamString = urlParamString+'&'+urlParam+'='+paramInfo;
                }
            });
            return urlParamString;
        };

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
                var urlParamString = parseParam(params);
                $http.get('api/processes'+urlParamString).success(callback);
            },
            update: function(obj, callback) {
                $http.put('api/processes', obj).success(callback);
            },
            delete: function() {
                var deferred = $q.defer();
                $http.delete('api/processes').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            save: function() {
                var deferred = $q.defer();
                $http.post('api/processes').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            getAvailableProcesses: function(params, callback) {
                var urlParamString = parseParam(params);
                $http.get('api/processes/next'+urlParamString).success(callback);
            }
        }
    });

