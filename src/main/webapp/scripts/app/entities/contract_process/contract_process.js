'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('contract_process', {
                parent: 'entity',
                url: '/contract_processs',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract_process.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_process/contract_processs.html',
                        controller: 'Contract_processController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_process');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('contract_process.detail', {
                parent: 'entity',
                url: '/contract_process/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract_process.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_process/contract_process-detail.html',
                        controller: 'Contract_processDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_process');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Contract_process', function($stateParams, Contract_process) {
                        return Contract_process.get({id : $stateParams.id});
                    }]
                }
            })
            .state('contract_process.new', {
                parent: 'contract_process',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_process/contract_process-dialog.html',
                        controller: 'Contract_processDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {sequence: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract_process', null, { reload: true });
                    }, function() {
                        $state.go('contract_process');
                    })
                }]
            })
            .state('contract_process.edit', {
                parent: 'contract_process',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_process/contract_process-dialog.html',
                        controller: 'Contract_processDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Contract_process', function(Contract_process) {
                                return Contract_process.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('contract_process', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
