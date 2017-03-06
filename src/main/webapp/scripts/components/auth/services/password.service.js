'use strict';

angular.module('mycontractApp')
    .factory('Password', function ($resource) {
        return $resource('api/useraccount/change_password', {}, {
        });
    });

angular.module('mycontractApp')
    .factory('PasswordResetInit', function ($resource) {
        return $resource('api/useraccount/reset_password/init', {}, {
        })
    });

angular.module('mycontractApp')
    .factory('PasswordResetFinish', function ($resource) {
        return $resource('api/useraccount/reset_password/finish', {}, {
        })
    });
