'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('bank_account', {
                parent: 'entity',
                url: '/bank_accounts',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.bank_account.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/bank_account/bank_accounts.html',
                        controller: 'Bank_accountController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('bank_account');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('bank_account.detail', {
                parent: 'entity',
                url: '/bank_account/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.bank_account.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/bank_account/bank_account-detail.html',
                        controller: 'Bank_accountDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('bank_account');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Bank_account', function($stateParams, Bank_account) {
                        return Bank_account.get({id : $stateParams.id});
                    }]
                }
            })
            .state('bank_account.new', {
                parent: 'bank_account',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/bank_account/bank_account-dialog.html',
                        controller: 'Bank_accountDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {bank_name: null, account_name: null, account_number: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('bank_account', null, { reload: true });
                    }, function() {
                        $state.go('bank_account');
                    })
                }]
            })
            .state('bank_account.edit', {
                parent: 'bank_account',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/bank_account/bank_account-dialog.html',
                        controller: 'Bank_accountDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Bank_account', function(Bank_account) {
                                return Bank_account.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('bank_account', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
