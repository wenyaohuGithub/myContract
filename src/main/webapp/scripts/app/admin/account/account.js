'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('account', {
                parent: 'admin',
                url: '/account',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'account.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/account/accounts.html',
                        controller: 'AccountController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('account');
                        return $translate.refresh();
                    }]
                }
            })
            .state('account.detail', {
                parent: 'admin',
                url: '/account/{id}',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'mycontractApp.account.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/account/account-detail.html',
                        controller: 'AccountDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('account');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Account', function($stateParams, Account) {
                        return Account.getAccount().getAccount({id : $stateParams.id});
                    }],
                    accountId:  function($stateParams) {
                        return $stateParams.id;
                    }
                }
            })
            .state('account.new', {
                parent: 'admin',
                url: '/new',
                data: {
                    roles: ['ROLE_ADMIN'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/account/account-dialog.html',
                        controller: 'AccountDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {login: null, id: null, lastName: null, firstName: null, email: null, langKey: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('account', null, { reload: true });
                    }, function() {
                        $state.go('account');
                    })
                }]
            })
            .state('account.edit', {
                parent: 'admin',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_ADMIN'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/account/account-dialog.html',
                        controller: 'AccountDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Account', function(Account) {
                                return Account.getAccount().getAccount({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('account', null, { reload: true });
                    }, function() {
                        $state.go('account');
                    })
                }]
            });
    });
