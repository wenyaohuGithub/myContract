'use strict';

angular.module('mycontractApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('organization', {
                parent: 'entity',
                url: '/organizations',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.organization.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/organization/organizations.html',
                        controller: 'OrganizationController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('organization');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('organization.detail', {
                parent: 'entity',
                url: '/organization/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.organization.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/organization/organization-detail.html',
                        controller: 'OrganizationDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('organization');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Organization', function($stateParams, Organization) {
                        return Organization.get({id : $stateParams.id});
                    }]
                }
            })
            .state('organization.new', {
                parent: 'organization',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/organization/organization-dialog.html',
                        controller: 'OrganizationDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, active: null, session_timeout: null, smtp_enabled: null, smtp_server_address: null, smtp_username: null, smtp_password: null, smtp_port: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('organization', null, { reload: true });
                    }, function() {
                        $state.go('organization');
                    })
                }]
            })
            .state('organization.edit', {
                parent: 'organization',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/organization/organization-dialog.html',
                        controller: 'OrganizationDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Organization', function(Organization) {
                                return Organization.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('organization', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
