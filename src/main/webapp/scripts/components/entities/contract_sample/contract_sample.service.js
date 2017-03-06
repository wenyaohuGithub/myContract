'use strict';

angular.module('mycontractApp')
    .factory('Contract_sample', function ($resource, DateUtils) {
        return $resource('api/contract_samples/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.uploaded_date_time = DateUtils.convertDateTimeFromServer(data.uploaded_date_time);
                    data.modified_date_time = DateUtils.convertDateTimeFromServer(data.modified_date_time);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });
