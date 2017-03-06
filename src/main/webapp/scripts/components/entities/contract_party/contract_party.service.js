'use strict';

angular.module('mycontractApp')
    .factory('Contract_party', function ($resource, DateUtils) {
        return $resource('api/contract_parties/:id', {}, {
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
