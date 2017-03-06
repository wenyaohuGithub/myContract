'use strict';
/*
angular.module('mycontractApp')
    .factory('Department', function ($resource) {
        var factory = {
            query: function () {
                return $resource('api/departments/', {}, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                })
            },
            getDepartment: function(){
                return $resource('api/departments/:id', {}, {
                    'getDepartment': {
                        method: 'GET',
                        transformResponse: function (data) {
                            data = angular.fromJson(data);
                            return data;
                        }
                    }
                });
            },
            createDepartment: function(){
                return $resource('api/departments/', {}, {
                    'createDepartment': {
                        method: 'POST'
                    }
                });
            },
            deleteDepartment: function() {
                return $resource('api/departments/:id', {}, {
                    'deleteDepartment':{
                        method: 'DELETE'
                    }
                })
            },
            updateDepartment: function() {
                return $resource('api/departments/:id', {}, {
                    'updateDepartment': {
                        method: 'PUT'
                    }
                })
            },
            getInternalDivisions: function(){
                return $resource('api/departments/:id/internalDivisions', {}, {
                    'getInternalDivisions': {
                        method: 'GET',
                        isArray: true
                    }
                })
            }
        };
        return {
            query: factory.query,
            getDepartment: factory.getDepartment,
            createDepartment: factory.createDepartment,
            deleteDepartment: factory.deleteDepartment,
            updateDepartment: factory.updateDepartment,
            getInternalDivisions: factory.getInternalDivisions
        }
    });
*/
angular.module('mycontractApp')
    .factory('Department', function ($resource) {
        return {
            query: function () {
                return $resource('api/departments/', {}, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                })
            },
            getDepartment: function(){
                return $resource('api/departments/:id', {}, {
                    'getDepartment': {
                        method: 'GET',
                        transformResponse: function (data) {
                            data = angular.fromJson(data);
                            return data;
                        }
                    }
                });
            },
            createDepartment: function(){
                return $resource('api/departments/', {}, {
                    'createDepartment': {
                        method: 'POST'
                    }
                });
            },
            deleteDepartment: function() {
                return $resource('api/departments/:id', {}, {
                    'deleteDepartment':{
                        method: 'DELETE'
                    }
                })
            },
            updateDepartment: function() {
                return $resource('api/departments/:id', {}, {
                    'updateDepartment': {
                        method: 'PUT'
                    }
                })
            },
            getInternalDivisions: function(){
                return $resource('api/departments/:id/internalDivisions', {}, {
                    'getInternalDivisions': {
                        method: 'GET',
                        isArray: true
                    }
                })
            }
        }
    });

