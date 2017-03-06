'use strict';

angular.module('mycontractApp')
    .factory('Workflow', function ($resource, DateUtils) {
        return $resource('api/workflows/:id', {}, {
            'query': { method: 'GET', accountId: '@accountId', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    var processes = [];
                    processes = data.processes;
                    var i = 1;
                    angular.forEach(processes, function(value){
                        value.sequence = i;
                        i++;
                    });
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });
