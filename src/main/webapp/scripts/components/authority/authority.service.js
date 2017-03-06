'use strict';

angular.module('mycontractApp')
    .factory('Authority', function ($resource, DateUtils) {
        return $resource('api/authorities/:name', {}, {
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
