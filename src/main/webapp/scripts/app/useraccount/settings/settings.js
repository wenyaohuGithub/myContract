'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('settings', {
                parent: 'useraccount',
                url: '/settings',
                data: {
                    roles: ['ROLE_USER',],
                    pageTitle: 'global.menu.useraccount.settings'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/useraccount/settings/settings.html',
                        controller: 'SettingsController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('settings');
                        return $translate.refresh();
                    }]
                }
            });
    });
