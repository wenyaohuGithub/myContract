'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('contract_history', {
                parent: 'entity',
                url: '/contract_historys',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract_history.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_history/contract_historys.html',
                        controller: 'Contract_historyController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_history');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('contract_history.detail', {
                parent: 'entity',
                url: '/contract_history/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract_history.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_history/contract_history-detail.html',
                        controller: 'Contract_historyDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_history');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Contract_history', function($stateParams, Contract_history) {
                        return Contract_history.get({id : $stateParams.id});
                    }]
                }
            })
            .state('contract_history.new', {
                parent: 'contract_history',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_history/contract_history-dialog.html',
                        controller: 'Contract_historyDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {note: null, action: null, action_datetime: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract_history', null, { reload: true });
                    }, function() {
                        $state.go('contract_history');
                    })
                }]
            })
            .state('contract_history.edit', {
                parent: 'contract_history',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_history/contract_history-dialog.html',
                        controller: 'Contract_historyDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Contract_history', function(Contract_history) {
                                return Contract_history.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('contract_history', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
