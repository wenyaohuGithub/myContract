'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('contract_party', {
                parent: 'entity',
                url: '/contract_parties',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                    pageTitle: 'mycontractApp.contract_party.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_party/contract_parties.html',
                        controller: 'Contract_partyController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_party');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('contract_party.detail', {
                parent: 'entity',
                url: '/contract_party/{id}',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                    pageTitle: 'mycontractApp.contract_party.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_party/contract_party-detail.html',
                        controller: 'Contract_partyDetailController'
                    },
                    'address@contract_party.detail':{
                        templateUrl: 'scripts/app/entities/address/address-detail.html',
                        controller: 'Contract_partyDetailController'
                    },
                    'bank@contract_party.detail':{
                        templateUrl: 'scripts/app/entities/bank_account/bank_accounts.html',
                        controller: 'Contract_partyDetailController'
                    },
                    'contracts@contract_party.detail':{
                        templateUrl: 'scripts/app/entities/contract/contracts.html',
                        controller: 'Contract_partyDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_party');
                        $translatePartialLoader.addPart('address');
                        $translatePartialLoader.addPart('bank_account');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Contract_party', function($stateParams, Contract_party) {
                        return Contract_party.get({id : $stateParams.id});
                    }]
                }
            })
            .state('contract_party.new', {
                parent: 'contract_party',
                url: '/new',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_party/contract_party-dialog.html',
                        controller: 'Contract_partyDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, registration_id: null, registered_capital: null, legal_representative: null, registration_inspection_record: null, professional_certificate: null, business_certificate: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract_party', null, { reload: true });
                    }, function() {
                        $state.go('contract_party');
                    })
                }]
            })
            .state('contract_party.edit', {
                parent: 'contract_party',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_party/contract_party-dialog.html',
                        controller: 'Contract_partyDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Contract_party', function(Contract_party) {
                                return Contract_party.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('contract_party', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
