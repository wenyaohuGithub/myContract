'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('project', {
                parent: 'entity',
                url: '/projects',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                    pageTitle: 'mycontractApp.project.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/project/projects.html',
                        controller: 'ProjectController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('project');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('project.detail', {
                parent: 'entity',
                url: '/project/{id}',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                    pageTitle: 'mycontractApp.project.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/project/project-detail.html',
                        controller: 'ProjectDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('project');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Project', function($stateParams, Project) {
                        return Project.get({id : $stateParams.id});
                    }]
                }
            })
            .state('project.new', {
                parent: 'project',
                url: '/new',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/project/project-dialog.html',
                        controller: 'ProjectDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, identifier: null, description: null, manager: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('project', null, { reload: true });
                    }, function() {
                        $state.go('project');
                    })
                }]
            })
            .state('project.edit', {
                parent: 'project',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/project/project-dialog.html',
                        controller: 'ProjectDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Project', function(Project) {
                                return Project.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('project', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
