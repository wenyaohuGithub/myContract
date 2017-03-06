'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('process', {
                parent: 'entity',
                url: '/processs',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.process.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/process/processs.html',
                        controller: 'ProcessController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('process');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('process.detail', {
                parent: 'entity',
                url: '/process/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.process.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/process/process-detail.html',
                        controller: 'ProcessDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('process');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Process', function($stateParams, Process) {
                        return Process.get({id : $stateParams.id});
                    }]
                }
            })
            .state('process.new', {
                parent: 'process',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/process/process-dialog.html',
                        controller: 'ProcessDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('process', null, { reload: true });
                    }, function() {
                        $state.go('process');
                    })
                }]
            })
            .state('process.edit', {
                parent: 'process',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/process/process-dialog.html',
                        controller: 'ProcessDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Process', function(Process) {
                                return Process.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('process', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
