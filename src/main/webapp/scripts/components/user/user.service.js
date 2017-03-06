'use strict';
/*
angular.module('mycontractApp')
    .factory('User', function ($resource) {
        return $resource('api/users/:login', {}, {
                'query': {method: 'GET', isArray: true},
                'get': {
                    method: 'GET',
                    transformResponse: function (data) {
                        data = angular.fromJson(data);
                        return data;
                    }
                }
            });
        });
        */

angular.module('mycontractApp')
    .factory('User', function ($resource) {
        var factory = {
            query: function () {
                return $resource('api/users/', {}, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                })
            },
            getUser: function(){
                return $resource('api/users/:id', {}, {
                    'getUser': {
                        method: 'GET',
                        transformResponse: function (data) {
                            data = angular.fromJson(data);
                            return data;
                        }
                    }
                });
            },
            getLoginUser: function(){
                return $resource('api/users/login/:login', {}, {
                    'getLoginUser': {
                        method: 'GET',
                        transformResponse: function (data) {
                            data = angular.fromJson(data);
                            return data;
                        }
                    }
                });
            },
            createUser: function(){
                return $resource('api/users/new', {}, {
                    'createUser': {
                        method: 'POST'
                    }
                });
            },
            deleteUser: function() {
                return $resource('api/users/:id', {}, {
                    'deleteUser':{
                        method: 'DELETE'
                    }
                })
            },
            updateUser: function() {
                return $resource('api/users/:id', {}, {
                    'updateUser': {
                        method: 'PUT'
                    }
                })
            },
            updateUserRoles: function() {
                return $resource('api/users/roles/:id', {}, {
                    'updateUserRoles': {
                        method: 'PUT',
                        transformResponse: function (data) {
                            data = angular.fromJson(data);
                            return data;
                        }
                    }
                })
            }
        };
        return {
            query: factory.query,
            getLoginUser: factory.getLoginUser,
            getUser: factory.getUser,
            createUser: factory.createUser,
            deleteUser: factory.deleteUser,
            updateUser: factory.updateUser,
            updateUserRoles: factory.updateUserRoles
        }
});
