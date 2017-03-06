'use strict';

angular.module('mycontractApp')
    .factory('Fund_source', function ($resource, DateUtils) {
        return $resource('api/fund_sources/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.deleted_date_time = DateUtils.convertDateTimeFromServer(data.deleted_date_time);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });
