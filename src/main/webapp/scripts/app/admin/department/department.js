'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('department', {
                parent: 'entity',
                url: '/departments',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.department.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/department/departments.html',
                        controller: 'DepartmentController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('department');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('department.detail', {
                parent: 'entity',
                url: '/department/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.department.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/department/department-detail.html',
                        controller: 'DepartmentDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('department');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Department', function($stateParams, Department) {
                        return Department.getDepartment().getDepartment({id : $stateParams.id});
                    }]
                }
            })
            .state('department.new', {
                parent: 'department',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/department/department-dialog.html',
                        controller: 'DepartmentDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, note: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('department', null, { reload: true });
                    }, function() {
                        $state.go('department');
                    })
                }]
            })
            .state('department.edit', {
                parent: 'department',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/department/department-dialog.html',
                        controller: 'DepartmentDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Department', function(Department) {
                                return Department.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('department', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
