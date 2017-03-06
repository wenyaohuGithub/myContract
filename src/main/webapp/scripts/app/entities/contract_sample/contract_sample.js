'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('contract_sample', {
                parent: 'entity',
                url: '/contract_samples',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract_sample.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_sample/contract_samples.html',
                        controller: 'Contract_sampleController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_sample');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('contract_sample.detail', {
                parent: 'entity',
                url: '/contract_sample/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract_sample.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_sample/contract_sample-detail.html',
                        controller: 'Contract_sampleDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_sample');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Contract_sample', function($stateParams, Contract_sample) {
                        return Contract_sample.get({id : $stateParams.id});
                    }]
                }
            })
            .state('contract_sample.new', {
                parent: 'contract_sample',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_sample/contract_sample-dialog.html',
                        controller: 'Contract_sampleDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, path: null, file_name: null, uploaded_by: null, uploaded_date_time: null, modified_date_time: null, revision: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract_sample', null, { reload: true });
                    }, function() {
                        $state.go('contract_sample');
                    })
                }]
            })
            .state('contract_sample.edit', {
                parent: 'contract_sample',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_sample/contract_sample-dialog.html',
                        controller: 'Contract_sampleDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Contract_sample', function(Contract_sample) {
                                return Contract_sample.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('contract_sample', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
