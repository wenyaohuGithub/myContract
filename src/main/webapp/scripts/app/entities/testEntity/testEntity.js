'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('testEntity', {
                parent: 'entity',
                url: '/testEntitys',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.testEntity.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/testEntity/testEntitys.html',
                        controller: 'TestEntityController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('testEntity');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('testEntity.detail', {
                parent: 'entity',
                url: '/testEntity/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.testEntity.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/testEntity/testEntity-detail.html',
                        controller: 'TestEntityDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('testEntity');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'TestEntity', function($stateParams, TestEntity) {
                        return TestEntity.get({id : $stateParams.id});
                    }]
                }
            })
            .state('testEntity.new', {
                parent: 'testEntity',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/testEntity/testEntity-dialog.html',
                        controller: 'TestEntityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {testField: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('testEntity', null, { reload: true });
                    }, function() {
                        $state.go('testEntity');
                    })
                }]
            })
            .state('testEntity.edit', {
                parent: 'testEntity',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/testEntity/testEntity-dialog.html',
                        controller: 'TestEntityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['TestEntity', function(TestEntity) {
                                return TestEntity.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('testEntity', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
