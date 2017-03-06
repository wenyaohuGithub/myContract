'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('workflow', {
                parent: 'entity',
                url: '/workflows',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.workflow.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/workflow/workflows.html',
                        controller: 'WorkflowController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('workflow');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('workflow.detail', {
                parent: 'entity',
                url: '/workflow/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.workflow.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/workflow/workflow-detail.html',
                        controller: 'WorkflowDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('workflow');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Workflow', function($stateParams, Workflow) {
                        return Workflow.get({id : $stateParams.id});
                    }]
                }
            })
            .state('workflow.new', {
                parent: 'workflow',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/workflow/workflow-dialog.html',
                        controller: 'WorkflowDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('workflow', null, { reload: true });
                    }, function() {
                        $state.go('workflow');
                    })
                }]
            })
            .state('workflow.edit', {
                parent: 'workflow',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/workflow/workflow-dialog.html',
                        controller: 'WorkflowDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Workflow', function(Workflow) {
                                return Workflow.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('workflow', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
