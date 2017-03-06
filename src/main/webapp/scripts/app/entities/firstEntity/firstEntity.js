'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('firstEntity', {
                parent: 'entity',
                url: '/firstEntitys',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.firstEntity.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/firstEntity/firstEntitys.html',
                        controller: 'FirstEntityController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('firstEntity');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('firstEntity.detail', {
                parent: 'entity',
                url: '/firstEntity/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.firstEntity.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/firstEntity/firstEntity-detail.html',
                        controller: 'FirstEntityDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('firstEntity');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'FirstEntity', function($stateParams, FirstEntity) {
                        return FirstEntity.get({id : $stateParams.id});
                    }]
                }
            })
            .state('firstEntity.new', {
                parent: 'firstEntity',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/firstEntity/firstEntity-dialog.html',
                        controller: 'FirstEntityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('firstEntity', null, { reload: true });
                    }, function() {
                        $state.go('firstEntity');
                    })
                }]
            })
            .state('firstEntity.next', {
                parent: 'firstEntity',
                url: '/next',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/firstEntity/firstEntity-detail.html',
                        controller: 'FirstEntityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('firstEntity', null, { reload: true });
                    }, function() {
                        $state.go('firstEntity');
                    })
                }]
            })
            .state('firstEntity.edit', {
                parent: 'firstEntity',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/firstEntity/firstEntity-dialog.html',
                        controller: 'FirstEntityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['FirstEntity', function(FirstEntity) {
                                return FirstEntity.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('firstEntity', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
