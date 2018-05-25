'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('public', {
                parent: 'useraccount',
                url: '/public',
                data: {
                    roles: [], 
                    pageTitle: 'public.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/public/public.html',
                        controller: 'PublicController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('public');
                        return $translate.refresh();
                    }]
                }
            });
    });
