'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('authority', {
                parent: 'entity',
                url: '/authorities',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.authority.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/authority/authorities.html',
                        controller: 'AuthorityController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('authority');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('authority.detail', {
                parent: 'entity',
                url: '/authority/{name}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.authority.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/authority/authority-detail.html',
                        controller: 'AuthorityDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('authority');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Authority', function($stateParams, Authority) {
                        return Authority.get({name : $stateParams.name});
                    }]
                }
            })
            .state('authority.new', {
                parent: 'authority',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/authority/authority-dialog.html',
                        controller: 'AuthorityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('authority', null, { reload: true });
                    }, function() {
                        $state.go('authority');
                    })
                }]
            })
            .state('authority.edit', {
                parent: 'authority',
                url: '/{name}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/role/role-dialog.html',
                        controller: 'AuthorityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Authority', function(Authority) {
                                return Authority.get({name : $stateParams.name});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('authority', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
