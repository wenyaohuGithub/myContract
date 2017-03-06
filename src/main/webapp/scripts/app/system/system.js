'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('system', {
                abstract: true,
                parent: 'site'
            });
    });
