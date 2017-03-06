'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('user', {
                parent: 'admin',
                url: '/user',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'user.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/user/users.html',
                        controller: 'UserController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('user');
                        return $translate.refresh();
                    }]
                }
            })
            .state('user.detail', {
                parent: 'admin',
                url: '/user/{id}',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'mycontractApp.user.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/user/user-detail.html',
                        controller: 'UserDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('user');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'User', function($stateParams, User) {
                        return User.getUser().getUser({id : $stateParams.id});
                    }],
                    userId:  function($stateParams) {
                        return $stateParams.id;
                    }
                }
            })
            .state('user.new', {
                parent: 'admin',
                url: '/new',
                data: {
                    roles: ['ROLE_ADMIN'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/user/user-dialog.html',
                        controller: 'UserDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {login: null, id: null, lastName: null, firstName: null, email: null, langKey: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('user', null, { reload: true });
                    }, function() {
                        $state.go('user');
                    })
                }]
            })
            .state('user.edit', {
                parent: 'admin',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_ADMIN'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/user/user-dialog.html',
                        controller: 'UserDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['User', function(User) {
                                return User.getUser().getUser({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('user', null, { reload: true });
                    }, function() {
                        $state.go('user');
                    })
                }]
            });
    });
