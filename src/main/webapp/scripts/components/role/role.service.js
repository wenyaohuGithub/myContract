'use strict';

angular.module('mycontractApp')
    .factory('Role', function ($resource, DateUtils) {
        return $resource('api/roles/:name', {}, {
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
