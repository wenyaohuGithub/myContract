'use strict';

angular.module('mycontractApp')
    .controller('LogoutController', function (Auth,$state) {
        Auth.logout();
        $state.go('login');
    });
