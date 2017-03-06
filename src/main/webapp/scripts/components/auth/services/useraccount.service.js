'use strict';

angular.module('mycontractApp')
    .factory('UserAccount', function Account($resource) {
        return $resource('api/useraccount', {}, {
            'get': { method: 'GET', params: {}, isArray: false,
                interceptor: {
                    response: function(response) {
                        // expose response
                        return response;
                    }
                }
            }
        });
    });
