'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('useraccount', {
                abstract: true,
                parent: 'site'
            });
    });
