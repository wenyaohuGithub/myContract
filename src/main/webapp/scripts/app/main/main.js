'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            /*.state('home', {
                parent: 'site',
                url: '/',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/dashboard/dashboard.html',
                        controller: 'DashboardController'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                        $translatePartialLoader.addPart('main');
                        return $translate.refresh();
                    }]
                }
            });*/
            .state('home', {
                parent: 'site',
                url: '/',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.public.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/public/public.html',
                        controller: 'PublicController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            });
    });
