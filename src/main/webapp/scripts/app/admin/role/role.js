'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('role', {
                parent: 'entity',
                url: '/roles',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.role.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/role/roles.html',
                        controller: 'RoleController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('role');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('role.detail', {
                parent: 'entity',
                url: '/role/{name}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.role.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/role/role-detail.html',
                        controller: 'RoleDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('role');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Role', function($stateParams, Role) {
                        return Role.get({name : $stateParams.name});
                    }]
                }
            })
            .state('role.new', {
                parent: 'role',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/role/role-dialog.html',
                        controller: 'RoleDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('role', null, { reload: true });
                    }, function() {
                        $state.go('role');
                    })
                }]
            })
            .state('role.edit', {
                parent: 'role',
                url: '/{name}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/role/role-dialog.html',
                        controller: 'RoleDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Role', function(Role) {
                                return Role.get({name : $stateParams.name});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('role', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
