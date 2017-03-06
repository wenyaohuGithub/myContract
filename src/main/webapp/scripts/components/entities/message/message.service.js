'use strict';

angular.module('mycontractApp')
    .factory('Message', function ($resource, DateUtils) {
        return $resource('api/messages/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.send_datetime = DateUtils.convertDateTimeFromServer(data.send_datetime);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });
