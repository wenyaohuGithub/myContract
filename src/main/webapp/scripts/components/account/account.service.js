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
    .factory('Account', function ($resource) {
        var factory = {
            query: function () {
                return $resource('api/accounts/', {}, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                })
            },
            getAccount: function(){
                return $resource('api/accounts/:id', {}, {
                    'getAccount': {
                        method: 'GET',
                        transformResponse: function (data) {
                            data = angular.fromJson(data);
                            return data;
                        }
                    }
                });
            },
            createAccount: function(){
                return $resource('api/accounts/new', {}, {
                    'createAccount': {
                        method: 'POST'
                    }
                });
            },
            deleteAccount: function() {
                return $resource('api/accounts/:id', {}, {
                    'deleteUser':{
                        method: 'DELETE'
                    }
                })
            },
            updateAccount: function() {
                return $resource('api/accounts/:id', {}, {
                    'updateUser': {
                        method: 'PUT'
                    }
                })
            }
        };
        return {
            query: factory.query,
            getAccount: factory.getAccount,
            createAccount: factory.createAccount,
            deleteAccount: factory.deleteAccount,
            updateAccount: factory.updateAccount
        }
});
