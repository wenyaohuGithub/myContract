'use strict';

angular.module('mycontractApp')
    .factory('Register', function ($resource) {
        return $resource('api/register', {}, {
        });
    });


