'use strict';

angular.module('mycontractApp')
    .factory('Address', function ($resource, DateUtils) {
        return $resource('api/addresss/:id', {}, {
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
