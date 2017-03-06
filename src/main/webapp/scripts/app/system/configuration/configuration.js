'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('configuration', {
                parent: 'system',
                url: '/configuration',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'configuration.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/system/configuration/configuration.html',
                        controller: 'ConfigurationController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('configuration');
                        return $translate.refresh();
                    }]
                }
            });
    });
