'use strict';

angular.module('mycontractApp')
    .factory('Bank_account', function ($resource, DateUtils) {
        return $resource('api/bank_accounts/:id', {}, {
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
