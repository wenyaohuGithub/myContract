'use strict';

angular.module('mycontractApp')
    .factory('TestEntity', function ($resource, DateUtils) {
        return $resource('api/testEntitys/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.testField = DateUtils.convertLocaleDateFromServer(data.testField);
                    return data;
                }
            },
            'update': {
                method: 'PUT',
                transformRequest: function (data) {
                    data.testField = DateUtils.convertLocaleDateToServer(data.testField);
                    return angular.toJson(data);
                }
            },
            'save': {
                method: 'POST',
                transformRequest: function (data) {
                    data.testField = DateUtils.convertLocaleDateToServer(data.testField);
                    return angular.toJson(data);
                }
            }
        });
    });
