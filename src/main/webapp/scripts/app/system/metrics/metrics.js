'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('metrics', {
                parent: 'system',
                url: '/metrics',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'metrics.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/system/metrics/metrics.html',
                        controller: 'MetricsController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('metrics');
                        return $translate.refresh();
                    }]
                }
            });
    });
