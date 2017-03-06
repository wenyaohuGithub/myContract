'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('task', {
                parent: 'entity',
                url: '/tasks',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.task.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/task/tasks.html',
                        controller: 'TaskController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('task');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('task.detail', {
                parent: 'entity',
                url: '/task/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.task.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/task/task-detail.html',
                        controller: 'TaskDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('task');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Task', function($stateParams, Task) {
                        return Task.get({id : $stateParams.id});
                    }]
                }
            })
            .state('task.new', {
                parent: 'task',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/task/task-dialog.html',
                        controller: 'TaskDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {sequence: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('task', null, { reload: true });
                    }, function() {
                        $state.go('task');
                    })
                }]
            })
            .state('task.edit', {
                parent: 'task',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/task/task-dialog.html',
                        controller: 'TaskDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Task', function(Task) {
                                return Task.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('task', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
