'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('fund_source', {
                parent: 'entity',
                url: '/fund_sources',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.fund_source.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/fund_source/fund_sources.html',
                        controller: 'Fund_sourceController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('fund_source');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('fund_source.detail', {
                parent: 'entity',
                url: '/fund_source/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.fund_source.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/fund_source/fund_source-detail.html',
                        controller: 'Fund_sourceDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('fund_source');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Fund_source', function($stateParams, Fund_source) {
                        return Fund_source.get({id : $stateParams.id});
                    }]
                }
            })
            .state('fund_source.new', {
                parent: 'fund_source',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/fund_source/fund_source-dialog.html',
                        controller: 'Fund_sourceDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, deleted: null, deleted_date_time: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('fund_source', null, { reload: true });
                    }, function() {
                        $state.go('fund_source');
                    })
                }]
            })
            .state('fund_source.edit', {
                parent: 'fund_source',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/fund_source/fund_source-dialog.html',
                        controller: 'Fund_sourceDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Fund_source', function(Fund_source) {
                                return Fund_source.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('fund_source', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
