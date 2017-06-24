'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('contract', {
                parent: 'entity',
                url: '/contracts',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract/contracts.html',
                        controller: 'ContractController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('contract.detail', {
                parent: 'entity',
                url: '/contract/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract/contract-detail.html',
                        controller: 'ContractDetailController'
                    },
                    'info@contract.detail':{
                        templateUrl: 'scripts/app/entities/contract/contract-detail-info.html',
                        controller: 'ContractDetailController'
                    },
                    'project@contract.detail':{
                        templateUrl: 'scripts/app/entities/contract/contract-detail-projects.html',
                        controller: 'ContractDetailController'
                    },
                    'notes@contract.detail':{
                        templateUrl: 'scripts/app/entities/contract/contract-detail-notes.html',
                        controller: 'ContractDetailActivitiesController'
                    },
                    'activities@contract.detail':{
                        templateUrl: 'scripts/app/entities/contract/contract-detail-activities.html',
                        controller: 'ContractDetailActivitiesController'
                    },
                    'attachments@contract.detail':{
                        templateUrl: 'scripts/app/entities/contract/contract-detail-attachments.html',
                        controller: 'ContractDetailAttachmentsController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Contract', function($stateParams, Contract) {
                        return Contract.get($stateParams.id, {});
                    }]
                }
            })
            .state('contract.detail.nextStep', {
                parent: 'contract.detail',
                url: '/contract/{id}',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract/contract-dialog.html',
                        controller: 'ContractDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, reviewIdentifier: null, contractIdentifier: null, contractingMethod: null, amount: null, amountWritten: null, currency: null, amountCurrentYear: null, submitDate: null, startDate: null, endDate: null, expireDate: null, isMultiYear: null, status: null, state: null, approveDate: null, signDate: null, archiveDate: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract', null, { reload: true });
                    }, function() {
                        $state.go('contract');
                    })
                }]
            })
            .state('contract.new', {
                parent: 'contract',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract/contract-dialog.html',
                        controller: 'ContractDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, reviewIdentifier: null, contractIdentifier: null, contractingMethod: null, amount: null, amountWritten: null, currency: null, amountCurrentYear: null, submitDate: null, startDate: null, endDate: null, expireDate: null, isMultiYear: null, status: null, state: null, approveDate: null, signDate: null, archiveDate: null, id: null, content: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract', null, { reload: true });
                    }, function() {
                        $state.go('contract');
                    })
                }]
            })
            .state('contract.edit', {
                parent: 'contract',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract/contract-dialog.html',
                        controller: 'ContractDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Contract', function(Contract) {
                                return Contract.get($stateParams.id,{});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('contract', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            })
            .state('contract.search', {
                parent: 'contract',
                url: '/search',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract/contract-search.html',
                        controller: 'ContractSearchController',
                        size: 'lg',
                        resolve: {
                            searchTerm: function () {
                                return {
                                    name: null,
                                    contractParty: null,
                                    amount1: null,
                                    amount2: null,
                                    signDate1: null,
                                    signDate2: null
                                }
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract.searchedContract', {searchResults:result}, { reload: true });
                    }, function() {
                        $state.go('contract');
                    })
                }]
            })
            .state('contract.searchedContract', {
                parent: 'contract',
                url: '/search',
                data: {
                    roles: ['ROLE_USER'],
                },
                params: {
                    searchResults: null
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract/contracts.html',
                        controller: 'ContractController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('contract.statistics', {
                parent: 'contract',
                url: '/statistics',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract.statistics.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract/contracts-statistics.html',
                        controller: 'ContractStatsController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            });
    });
