'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('docs', {
                parent: 'system',
                url: '/docs',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'global.menu.system.apidocs'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/system/docs/docs.html'
                    }
                }
            });
    });
