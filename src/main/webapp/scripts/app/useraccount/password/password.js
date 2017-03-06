'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('password', {
                parent: 'useraccount',
                url: '/password',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'global.menu.useraccount.password'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/useraccount/password/password.html',
                        controller: 'PasswordController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('password');
                        return $translate.refresh();
                    }]
                }
            });
    });
