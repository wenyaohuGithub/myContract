'use strict';

angular.module('mycontractApp', ['LocalStorageModule', 'tmh.dynamicLocale', 'pascalprecht.translate',
               'ui.bootstrap', // for modal dialogs
    'ngResource', 'ui.router', 'ngCookies', 'ngCacheBuster', 'infinite-scroll', 'chart.js'])

    .run(["$rootScope", "$location", "$window", "$http", "$state", "$translate", "Language", "Auth", "Principal", "ENV", "VERSION", "AuthServerProvider", function ($rootScope, $location, $window, $http, $state, $translate, Language, Auth, Principal, ENV, VERSION, AuthServerProvider) {
        $rootScope.ENV = ENV;
        $rootScope.VERSION = VERSION;
        $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;

            // Update the language
            Language.getCurrent().then(function (language) {
                $translate.use(language);
            });

            if (Principal.isIdentityResolved()){
                Auth.authorize();
            }
        });

        $rootScope.$on('$stateChangeSuccess',  function(event, toState, toParams, fromState, fromParams) {
            var titleKey = 'global.title' ;

            $rootScope.previousStateName = fromState.name;
            $rootScope.previousStateParams = fromParams;

            // Set the page title key to the one configured in state or use default one
            if (toState.data.pageTitle) {
                titleKey = toState.data.pageTitle;
            }

            $translate(titleKey).then(function (title) {
                // Change window title with translated one
                $window.document.title = title;
            });
            if (Principal.isIdentityResolved()){
                if(!Principal.isAuthenticated() && toState.name != 'register'){
                    $state.go('login');
                }
            }
        });

        $rootScope.back = function() {
            // If previous state is 'activate' or do not exist go to 'home'
            if ($rootScope.previousStateName === 'activate' || $state.get($rootScope.previousStateName) === null) {
                $state.go('dashboard');
            } else {
                $state.go($rootScope.previousStateName, $rootScope.previousStateParams);
            }
        };

        $rootScope.showElement = function(config){
            if(AuthServerProvider.getToken()){
                if(AuthServerProvider.getToken().userDetails.account){
                    var accountConfig = AuthServerProvider.getToken().userDetails.account.processConfiguration;
                    if(config.indexOf(accountConfig) > -1){
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }else {
                return false;
            }
        };

/*
        $rootScope.$on('$viewContentLoading',
            function(event, viewConfig){
                console.log("View Load: the view is loaded, and DOM rendered!");
            });*/
    }])
    .factory('authInterceptor', ["$rootScope", "$q", "$location", "localStorageService", function ($rootScope, $q, $location, localStorageService) {
        return {
            // Add authorization token to headers
            request: function (config) {
                config.headers = config.headers || {};
                var token = localStorageService.get('token');

                if (token && token.expires && token.expires > new Date().getTime()) {
                  config.headers['x-auth-token'] = token.token;
                }

                return config;
            }
        };
    }])
    .factory('authExpiredInterceptor', ["$rootScope", "$q", "$injector", "localStorageService", function ($rootScope, $q, $injector, localStorageService) {
        return {
            responseError: function (response) {
                // token has expired
                if (response.status === 401 && (response.data.error == 'invalid_token' || response.data.error == 'Unauthorized')) {
                    localStorageService.remove('token');
                    var Principal = $injector.get('Principal');
                    if (Principal.isAuthenticated()) {
                        var Auth = $injector.get('Auth');
                        Auth.authorize(true);
                    }
                }
                return $q.reject(response);
            }
        };
    }])
    .config(["$stateProvider", "$urlRouterProvider", "$httpProvider", "$locationProvider", "$translateProvider", "tmhDynamicLocaleProvider", "httpRequestInterceptorCacheBusterProvider", function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, $translateProvider, tmhDynamicLocaleProvider, httpRequestInterceptorCacheBusterProvider) {

        //Cache everything except rest api requests
        httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*api.*/, /.*protected.*/], true);

        $urlRouterProvider.otherwise('/');
        $stateProvider.state('site', {
            'abstract': true,
            views: {
                'navbar@': {
                    templateUrl: 'scripts/components/navbar/navbar.html',
                    controller: 'NavbarController'
                }
            },
            resolve: {
                authorize: ['Auth',
                    function (Auth) {
                        return Auth.authorize();
                    }
                ],
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('global');
                }]
            }
        });

        $httpProvider.interceptors.push('authExpiredInterceptor');

        $httpProvider.interceptors.push('authInterceptor');

        // Initialize angular-translate
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: 'i18n/{lang}/{part}.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useCookieStorage();
        $translateProvider.useSanitizeValueStrategy('escaped');

        tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js');
        tmhDynamicLocaleProvider.useCookieStorage();
        tmhDynamicLocaleProvider.storageKey('NG_TRANSLATE_LANG_KEY');

    }])
    .config(["ChartJsProvider", function (ChartJsProvider) {
        ChartJsProvider.setOptions({ colors : [ '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
    }]);

"use strict";
// DO NOT EDIT THIS FILE, EDIT THE GRUNT TASK NGCONSTANT SETTINGS INSTEAD WHICH GENERATES THIS FILE
angular.module('mycontractApp')

.constant('ENV', 'prod')

.constant('VERSION', '0.0.1-SNAPSHOT')

;
"use strict";
// DO NOT EDIT THIS FILE, EDIT THE GRUNT TASK NGCONSTANT SETTINGS INSTEAD WHICH GENERATES THIS FILE
angular.module('mycontractApp')

.constant('ENV', 'dev')

.constant('VERSION', '0.0.1-SNAPSHOT')

;
'use strict';

angular.module('mycontractApp')
    .factory('Auth', ["$rootScope", "$state", "$q", "$translate", "Principal", "AuthServerProvider", "UserAccount", "Register", "Activate", "Password", "PasswordResetInit", "PasswordResetFinish", function Auth($rootScope, $state, $q, $translate, Principal, AuthServerProvider, UserAccount, Register, Activate, Password, PasswordResetInit, PasswordResetFinish) {
        return {
            login: function (credentials, callback) {
                var cb = callback || angular.noop;
                var deferred = $q.defer();

                AuthServerProvider.login(credentials).then(function (data) {
                    // retrieve the logged account information
                    Principal.identity(true).then(function(useraccount) {

                        // After the login the language will be changed to
                        // the language selected by the user during his registration
                        $translate.use(useraccount.langKey);
                        $translate.refresh();
                        deferred.resolve(data);
                    });
                    return cb();
                }).catch(function (err) {
                    this.logout();
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));

                return deferred.promise;
            },

            logout: function () {
                AuthServerProvider.logout();
                Principal.authenticate(null);
            },

            authorize: function(force) {
                return Principal.identity(force)
                    .then(function() {
                        var isAuthenticated = Principal.isAuthenticated();

                        if ($rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0 && !Principal.isInAnyRole($rootScope.toState.data.roles)) {
                            if (isAuthenticated) {
                                // user is signed in but not authorized for desired state
                                $state.go('accessdenied');
                            }
                            else {
                                // user is not authenticated. stow the state they wanted before you
                                // send them to the signin state, so you can return them when you're done
                                $rootScope.returnToState = $rootScope.toState;
                                $rootScope.returnToStateParams = $rootScope.toStateParams;

                                // now, send them to the signin state so they can log in
                                $state.go('login');
                            }
                        }
                    });
            },
            createUserAccount: function (useraccount, callback) {
                var cb = callback || angular.noop;

                return Register.save(useraccount,
                    function () {
                        return cb(useraccount);
                    },
                    function (err) {
                        this.logout();
                        return cb(err);
                    }.bind(this)).$promise;
            },

            updateUserAccount: function (useraccount, callback) {
                var cb = callback || angular.noop;

                return UserAccount.save(useraccount,
                    function () {
                        return cb(useraccount);
                    },
                    function (err) {
                        return cb(err);
                    }.bind(this)).$promise;
            },

            activateUserAccount: function (key, callback) {
                var cb = callback || angular.noop;

                return Activate.get(key,
                    function (response) {
                        return cb(response);
                    },
                    function (err) {
                        return cb(err);
                    }.bind(this)).$promise;
            },

            changePassword: function (newPassword, callback) {
                var cb = callback || angular.noop;

                return Password.save(newPassword, function () {
                    return cb();
                }, function (err) {
                    return cb(err);
                }).$promise;
            },

            resetPasswordInit: function (mail, callback) {
                var cb = callback || angular.noop;

                return PasswordResetInit.save(mail, function() {
                    return cb();
                }, function (err) {
                    return cb(err);
                }).$promise;
            },

            resetPasswordFinish: function(key, newPassword, callback) {
                var cb = callback || angular.noop;

                return PasswordResetFinish.save(key, newPassword, function () {
                    return cb();
                }, function (err) {
                    return cb(err);
                }).$promise;
            }
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Principal', ["$q", "UserAccount", function Principal($q, UserAccount) {
        var _identity,
            _authenticated = false;

        return {
            isIdentityResolved: function () {
                return angular.isDefined(_identity);
            },
            isAuthenticated: function () {
                return _authenticated;
            },
            isInRole: function (role) {
                if (!_authenticated || !_identity || !_identity.roles) {
                    return false;
                }

                return _identity.roles.indexOf(role) !== -1;
            },
            isInAnyRole: function (roles) {
                if (!_authenticated || !_identity.roles) {
                    return false;
                }

                for (var i = 0; i < roles.length; i++) {
                    if (this.isInRole(roles[i])) {
                        return true;
                    }
                }

                return false;
            },
            authenticate: function (identity) {
                _identity = identity;
                _authenticated = identity !== null;
            },
            identity: function (force) {
                var deferred = $q.defer();

                if (force === true) {
                    _identity = undefined;
                }

                // check and see if we have retrieved the identity data from the server.
                // if we have, reuse it by immediately resolving
                if (angular.isDefined(_identity)) {
                    deferred.resolve(_identity);

                    return deferred.promise;
                }

                // retrieve the identity data from the server, update the identity object, and then resolve.
                UserAccount.get().$promise
                    .then(function (account) {
                        _identity = account.data;
                        _authenticated = true;
                        deferred.resolve(_identity);
                    })
                    .catch(function() {
                        _identity = null;
                        _authenticated = false;
                        deferred.resolve(_identity);
                    });
                return deferred.promise;
            }
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .directive('hasAnyRole', ['Principal', function (Principal) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var setVisible = function () {
                        element.removeClass('hidden');
                    },
                    setHidden = function () {
                        element.addClass('hidden');
                    },
                    defineVisibility = function (reset) {
                        var result;
                        if (reset) {
                            setVisible();
                        }

                        result = Principal.isInAnyRole(roles);
                        if (result) {
                            setVisible();
                        } else {
                            setHidden();
                        }
                    },
                    roles = attrs.hasAnyRole.replace(/\s+/g, '').split(',');

                if (roles.length > 0) {
                    defineVisibility(true);
                }
            }
        };
    }])
    .directive('hasRole', ['Principal', function (Principal) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var setVisible = function () {
                        element.removeClass('hidden');
                    },
                    setHidden = function () {
                        element.addClass('hidden');
                    },
                    defineVisibility = function (reset) {
                        var result;
                        if (reset) {
                            setVisible();
                        }

                        result = Principal.isInRole(role);
                        if (result) {
                            setVisible();
                        } else {
                            setHidden();
                        }
                    },
                    role = attrs.hasRole.replace(/\s+/g, '');

                if (role.length > 0) {
                    defineVisibility(true);
                }
            }
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('UserAccount', ["$resource", function Account($resource) {
        return $resource('api/useraccount', {}, {
            'get': { method: 'GET', params: {}, isArray: false,
                interceptor: {
                    response: function(response) {
                        // expose response
                        return response;
                    }
                }
            }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Activate', ["$resource", function ($resource) {
        return $resource('api/activate', {}, {
            'get': { method: 'GET', params: {}, isArray: false}
        });
    }]);



'use strict';

angular.module('mycontractApp')
    .factory('Password', ["$resource", function ($resource) {
        return $resource('api/useraccount/change_password', {}, {
        });
    }]);

angular.module('mycontractApp')
    .factory('PasswordResetInit', ["$resource", function ($resource) {
        return $resource('api/useraccount/reset_password/init', {}, {
        })
    }]);

angular.module('mycontractApp')
    .factory('PasswordResetFinish', ["$resource", function ($resource) {
        return $resource('api/useraccount/reset_password/finish', {}, {
        })
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Register', ["$resource", function ($resource) {
        return $resource('api/register', {}, {
        });
    }]);



/* globals $ */
'use strict';

angular.module('mycontractApp')
    .directive('showValidation', function() {
        return {
            restrict: 'A',
            require: 'form',
            link: function (scope, element) {
                element.find('.form-group').each(function() {
                    var $formGroup = $(this);
                    var $inputs = $formGroup.find('input[ng-model],textarea[ng-model],select[ng-model]');

                    if ($inputs.length > 0) {
                        $inputs.each(function() {
                            var $input = $(this);
                            scope.$watch(function() {
                                return $input.hasClass('ng-invalid') && $input.hasClass('ng-dirty');
                            }, function(isInvalid) {
                                $formGroup.toggleClass('has-error', isInvalid);
                            });
                        });
                    }
                });
            }
        };
    });

/* globals $ */
'use strict';

angular.module('mycontractApp')
    .directive('mycontractAppPager', function() {
        return {
            templateUrl: 'scripts/components/form/pager.html'
        };
    });

/* globals $ */
'use strict';

angular.module('mycontractApp')
    .directive('mycontractAppPagination', function() {
        return {
            templateUrl: 'scripts/components/form/pagination.html'
        };
    });

'use strict';

angular.module('mycontractApp')
    .factory('AuditsService', ["$http", function ($http) {
        return {
            findAll: function () {
                return $http.get('api/audits/all').then(function (response) {
                    return response.data;
                });
            },
            findByDates: function (fromDate, toDate) {

                var formatDate =  function (dateToFormat) {
                    if (dateToFormat !== undefined && !angular.isString(dateToFormat)) {
                        return dateToFormat.getYear() + '-' + dateToFormat.getMonth() + '-' + dateToFormat.getDay();
                    }
                    return dateToFormat;
                };

                return $http.get('api/audits/byDates', {params: {fromDate: formatDate(fromDate), toDate: formatDate(toDate)}}).then(function (response) {
                    return response.data;
                });
            }
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('LogsService', ["$resource", function ($resource) {
        return $resource('api/logs', {}, {
            'findAll': { method: 'GET', isArray: true},
            'changeLevel': { method: 'PUT'}
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('ConfigurationService', ["$rootScope", "$filter", "$http", function ($rootScope, $filter, $http) {
        return {
            get: function() {
                return $http.get('configprops').then(function (response) {
                    var properties = [];
                    angular.forEach(response.data, function (data) {
                        properties.push(data);
                    });
                    var orderBy = $filter('orderBy');
                    return orderBy(properties, 'prefix');
                });
            }
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('MonitoringService', ["$rootScope", "$http", function ($rootScope, $http) {
        return {
            getMetrics: function () {
                return $http.get('metrics/metrics').then(function (response) {
                    return response.data;
                });
            },

            checkHealth: function () {
                return $http.get('health').then(function (response) {
                    return response.data;
                });
            },

            threadDump: function () {
                return $http.get('dump').then(function (response) {
                    return response.data;
                });
            }
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .directive('activeMenu', ["$translate", "$locale", "tmhDynamicLocale", function($translate, $locale, tmhDynamicLocale) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var language = attrs.activeMenu;

                scope.$watch(function() {
                    return $translate.use();
                }, function(selectedLanguage) {
                    if (language === selectedLanguage) {
                        tmhDynamicLocale.set(language);
                        element.addClass('active');
                    } else {
                        element.removeClass('active');
                    }
                });
            }
        };
    }])
    .directive('activeLink', ["location", function(location) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var clazz = attrs.activeLink;
                var path = attrs.href;
                path = path.substring(1); //hack because path does bot return including hashbang
                scope.location = location;
                scope.$watch('location.path()', function(newPath) {
                    if (path === newPath) {
                        element.addClass(clazz);
                    } else {
                        element.removeClass(clazz);
                    }
                });
            }
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('NavbarController', ["$scope", "$location", "$state", "$timeout", "Auth", "Principal", "Message", function ($scope, $location, $state, $timeout, Auth, Principal, Message) {
        $scope.isAuthenticated = Principal.isAuthenticated;
        $scope.$state = $state;
        $scope.logout = function () {
            Auth.logout();
            $state.go('login');
        };

        $scope.messages = [];
        Message.query(function(result, status, headers) {
            $scope.messages = result;
        });
    }]);

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
    .factory('User', ["$resource", function ($resource) {
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
}]);

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
    .factory('Account', ["$resource", function ($resource) {
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
}]);

'use strict';

angular.module('mycontractApp')
    .filter('characters', function () {
        return function (input, chars, breakOnWord) {
            if (isNaN(chars)) {
                return input;
            }
            if (chars <= 0) {
                return '';
            }
            if (input && input.length > chars) {
                input = input.substring(0, chars);

                if (!breakOnWord) {
                    var lastspace = input.lastIndexOf(' ');
                    // Get last space
                    if (lastspace !== -1) {
                        input = input.substr(0, lastspace);
                    }
                } else {
                    while (input.charAt(input.length-1) === ' ') {
                        input = input.substr(0, input.length - 1);
                    }
                }
                return input + '...';
            }
            return input;
        };
    })
    .filter('words', function () {
        return function (input, words) {
            if (isNaN(words)) {
                return input;
            }
            if (words <= 0) {
                return '';
            }
            if (input) {
                var inputWords = input.split(/\s+/);
                if (inputWords.length > words) {
                    input = inputWords.slice(0, words).join(' ') + '...';
                }
            }
            return input;
        };
    });

/*jshint bitwise: false*/
'use strict';

angular.module('mycontractApp')
    .service('Base64', function () {
        var keyStr = 'ABCDEFGHIJKLMNOP' +
            'QRSTUVWXYZabcdef' +
            'ghijklmnopqrstuv' +
            'wxyz0123456789+/' +
            '=';
        this.encode = function (input) {
            var output = '',
                chr1, chr2, chr3 = '',
                enc1, enc2, enc3, enc4 = '',
                i = 0;

            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = '';
                enc1 = enc2 = enc3 = enc4 = '';
            }

            return output;
        };

        this.decode = function (input) {
            var output = '',
                chr1, chr2, chr3 = '',
                enc1, enc2, enc3, enc4 = '',
                i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

            while (i < input.length) {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 !== 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = '';
                enc1 = enc2 = enc3 = enc4 = '';
            }
        };
    })
    .factory('StorageService', ["$window", function ($window) {
        return {

            get: function (key) {
                return JSON.parse($window.localStorage.getItem(key));
            },

            save: function (key, data) {
                $window.localStorage.setItem(key, JSON.stringify(data));
            },

            remove: function (key) {
                $window.localStorage.removeItem(key);
            },

            clearAll : function () {
                $window.localStorage.clear();
            }
        };
    }]);


'use strict';

angular.module('mycontractApp')
    .factory('FileUpload', ["$resource", "$window", "$http", function ($resource, $window, $http) {
    var _params = {};
    var factory = {
        query: function () {
            return $resource('api/fileupload/', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            })
        },
        upload: function(){
            return $resource('api/fileupload', {}, {
                'uploadFile': {
                    method: 'Post',
                    transformRequest: angular.identity,
                    params: _params,
                    headers: {'Content-type': undefined},
                    transformResponse: function (data) {
                        data = angular.fromJson(data);
                        return data;
                    }
                }
            });
        },
        download: function(){
            return $resource('api/fileupload/:id', {}, {
                'downloadFile': {
                    method: 'GET',
                    responseType: 'arraybuffer',
                    transformResponse: function (result) {
                        var file = new Blob([result], {type: 'application/pdf'});
                        var fileURL = window.URL.createObjectURL(file);
                        var fileObj = {file : fileURL};
                        return fileObj;
                    }
                }
            });
        },

        setParameter: function(parameters){
            _params = parameters;
        }
    };
    return {
        query: factory.query,
        upload: factory.upload,
        download: factory.download,
        setParameter: factory.setParameter
    }
}]);

'use strict';

angular.module('mycontractApp')
    .directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

'use strict';

angular.module('mycontractApp')
    .service('ParseLinks', function () {
        this.parse = function (header) {
            if (header.length == 0) {
                throw new Error("input must not be of zero length");
            }

            // Split parts by comma
            var parts = header.split(',');
            var links = {};
            // Parse each part into a named link
            angular.forEach(parts, function (p) {
                var section = p.split(';');
                if (section.length != 2) {
                    throw new Error("section could not be split on ';'");
                }
                var url = section[0].replace(/<(.*)>/, '$1').trim();
                var queryString = {};
                url.replace(
                    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
                    function($0, $1, $2, $3) { queryString[$1] = $3; }
                );
                var page = queryString['page'];
                if( angular.isString(page) ) {
                    page = parseInt(page);
                }
                var name = section[1].replace(/rel="(.*)"/, '$1').trim();
                links[name] = page;
            });

            return links;
        }
    });

'use strict';

angular.module('mycontractApp')
    .service('DateUtils', function () {
      this.convertLocaleDateToServer = function(date) {
        if (date) {
          var utcDate = new Date();
          utcDate.setUTCDate(date.getDate());
          utcDate.setUTCMonth(date.getMonth());
          utcDate.setUTCFullYear(date.getFullYear());
          return utcDate;
        } else {
          return null;
        }
      };
      this.convertLocaleDateFromServer = function(date) {
        if (date) {
          var dateString = date.split("-");
          return new Date(dateString[0], dateString[1] - 1, dateString[2]);
        }
        return null;
      };
      this.convertDateTimeFromServer = function(date) {
        if (date) {
          return new Date(date);   
        } else {
          return null;
        }
      };
        this.convertDatetimeToString = function(date){
            if(date){
                var dateString = date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
                return dateString;
            } else {
                return null
            }
        }
    });

'use strict';

angular.module('mycontractApp')
    .service('UrlParams', function () {
      this.parseParam = function(params){
            var urlParamString = '';
            angular.forEach(params, function(paramInfo, urlParam){
                if(urlParamString == ''){
                    urlParamString = urlParamString+'?'+urlParam+'='+paramInfo;
                } else {
                    urlParamString = urlParamString+'&'+urlParam+'='+paramInfo;
                }
            });
            return urlParamString;
        };
    });

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('useraccount', {
                abstract: true,
                parent: 'site'
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('activate', {
                parent: 'useraccount',
                url: '/activate?key',
                data: {
                    roles: [],
                    pageTitle: 'activate.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/useraccount/activate/activate.html',
                        controller: 'ActivationController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('activate');
                        return $translate.refresh();
                    }]
                }
            });
    }]);


'use strict';

angular.module('mycontractApp')
    .controller('ActivationController', ["$scope", "$stateParams", "Auth", function ($scope, $stateParams, Auth) {
        Auth.activateAccount({key: $stateParams.key}).then(function () {
            $scope.error = null;
            $scope.success = 'OK';
        }).catch(function () {
            $scope.success = null;
            $scope.error = 'ERROR';
        });
    }]);


'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('login', {
                parent: 'useraccount',
                url: '/login',
                data: {
                    roles: [], 
                    pageTitle: 'login.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/useraccount/login/login.html',
                        controller: 'LoginController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('login');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('LoginController', ["$rootScope", "$scope", "$state", "$timeout", "Auth", function ($rootScope, $scope, $state, $timeout, Auth) {
        $scope.user = {};
        $scope.errors = {};

        $scope.rememberMe = false;
        $timeout(function (){angular.element('[ng-model="username"]').focus();});
        $scope.login = function (event) {
            event.preventDefault();
            Auth.login({
                username: $scope.username,
                password: $scope.password,
                rememberMe: $scope.rememberMe
            }).then(function () {
                $scope.authenticationError = false;
                if ($rootScope.previousStateName === 'register' || $rootScope.previousStateName === 'logout') {
                    $state.go('home');
                } else {
                    $rootScope.back();
                }
            }).catch(function () {
                $scope.authenticationError = true;
            });
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('logout', {
                parent: 'useraccount',
                url: '/logout',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/useraccount/login/login.html',
                        controller: 'LogoutController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('login');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('LogoutController', ["Auth", "$state", function (Auth,$state) {
        Auth.logout();
        $state.go('login');
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('password', {
                parent: 'useraccount',
                url: '/password',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'global.menu.useraccount.password'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/useraccount/password/password.html',
                        controller: 'PasswordController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('password');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('PasswordController', ["$scope", "Auth", "Principal", function ($scope, Auth, Principal) {
        Principal.identity().then(function(account) {
            $scope.account = account;
        });

        $scope.success = null;
        $scope.error = null;
        $scope.doNotMatch = null;
        $scope.changePassword = function () {
            if ($scope.password !== $scope.confirmPassword) {
                $scope.doNotMatch = 'ERROR';
            } else {
                $scope.doNotMatch = null;
                Auth.changePassword($scope.password).then(function () {
                    $scope.error = null;
                    $scope.success = 'OK';
                }).catch(function () {
                    $scope.success = null;
                    $scope.error = 'ERROR';
                });
            }
        };
    }]);

/* globals $ */
'use strict';

angular.module('mycontractApp')
    .directive('passwordStrengthBar', function () {
        return {
            replace: true,
            restrict: 'E',
            template: '<div id="strength">' +
                '<small translate="global.messages.validate.newpassword.strength">Password strength:</small>' +
                '<ul id="strengthBar">' +
                '<li class="point"></li><li class="point"></li><li class="point"></li><li class="point"></li><li class="point"></li>' +
                '</ul>' +
                '</div>',
            link: function (scope, iElement, attr) {
                var strength = {
                    colors: ['#F00', '#F90', '#FF0', '#9F0', '#0F0'],
                    mesureStrength: function (p) {

                        var _force = 0;
                        var _regex = /[$-/:-?{-~!"^_`\[\]]/g; // "

                        var _lowerLetters = /[a-z]+/.test(p);
                        var _upperLetters = /[A-Z]+/.test(p);
                        var _numbers = /[0-9]+/.test(p);
                        var _symbols = _regex.test(p);

                        var _flags = [_lowerLetters, _upperLetters, _numbers, _symbols];
                        var _passedMatches = $.grep(_flags, function (el) {
                            return el === true;
                        }).length;

                        _force += 2 * p.length + ((p.length >= 10) ? 1 : 0);
                        _force += _passedMatches * 10;

                        // penality (short password)
                        _force = (p.length <= 6) ? Math.min(_force, 10) : _force;

                        // penality (poor variety of characters)
                        _force = (_passedMatches === 1) ? Math.min(_force, 10) : _force;
                        _force = (_passedMatches === 2) ? Math.min(_force, 20) : _force;
                        _force = (_passedMatches === 3) ? Math.min(_force, 40) : _force;

                        return _force;

                    },
                    getColor: function (s) {

                        var idx = 0;
                        if (s <= 10) {
                            idx = 0;
                        }
                        else if (s <= 20) {
                            idx = 1;
                        }
                        else if (s <= 30) {
                            idx = 2;
                        }
                        else if (s <= 40) {
                            idx = 3;
                        }
                        else {
                            idx = 4;
                        }

                        return { idx: idx + 1, col: this.colors[idx] };
                    }
                };
                scope.$watch(attr.passwordToCheck, function (password) {
                    if (password) {
                        var c = strength.getColor(strength.mesureStrength(password));
                        iElement.removeClass('ng-hide');
                        iElement.find('ul').children('li')
                            .css({ 'background': '#DDD' })
                            .slice(0, c.idx)
                            .css({ 'background': c.col });
                    }
                });
            }
        };
    });

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('register', {
                parent: 'account',
                url: '/register',
                data: {
                    roles: [],
                    pageTitle: 'register.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/register/register.html',
                        controller: 'RegisterController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('register');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('RegisterController', ["$scope", "$translate", "$timeout", "Auth", function ($scope, $translate, $timeout, Auth) {
        $scope.success = null;
        $scope.error = null;
        $scope.doNotMatch = null;
        $scope.errorUserExists = null;
        $scope.registerAccount = {};
        $timeout(function (){angular.element('[ng-model="registerAccount.login"]').focus();});

        $scope.register = function () {
            if ($scope.registerAccount.password !== $scope.confirmPassword) {
                $scope.doNotMatch = 'ERROR';
            } else {
                $scope.registerAccount.langKey = $translate.use();
                $scope.doNotMatch = null;
                $scope.error = null;
                $scope.errorUserExists = null;
                $scope.errorEmailExists = null;

                Auth.createAccount($scope.registerAccount).then(function () {
                    $scope.success = 'OK';
                }).catch(function (response) {
                    $scope.success = null;
                    if (response.status === 400 && response.data === 'login already in use') {
                        $scope.errorUserExists = 'ERROR';
                    } else if (response.status === 400 && response.data === 'e-mail address already in use') {
                        $scope.errorEmailExists = 'ERROR';
                    } else {
                        $scope.error = 'ERROR';
                    }
                });
            }
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('settings', {
                parent: 'useraccount',
                url: '/settings',
                data: {
                    roles: ['ROLE_USER',],
                    pageTitle: 'global.menu.useraccount.settings'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/useraccount/settings/settings.html',
                        controller: 'SettingsController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('settings');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('SettingsController', ["$scope", "Principal", "Auth", "Language", "$translate", function ($scope, Principal, Auth, Language, $translate) {
        $scope.success = null;
        $scope.error = null;
        Principal.identity(true).then(function(account) {
            $scope.settingsAccount = account;
        });

        $scope.save = function () {
            Auth.updateAccount($scope.settingsAccount).then(function() {
                $scope.error = null;
                $scope.success = 'OK';
                Principal.identity().then(function(account) {
                    $scope.settingsAccount = account;
                });
                Language.getCurrent().then(function(current) {
                    if ($scope.settingsAccount.langKey !== current) {
                        $translate.use($scope.settingsAccount.langKey);
                    }
                });
            }).catch(function() {
                $scope.success = null;
                $scope.error = 'ERROR';
            });
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('ResetFinishController', ["$scope", "$stateParams", "$timeout", "Auth", function ($scope, $stateParams, $timeout, Auth) {

        $scope.keyMissing = $stateParams.key === undefined;
        $scope.doNotMatch = null;

        $scope.resetAccount = {};
        $timeout(function (){angular.element('[ng-model="resetAccount.password"]').focus();});

        $scope.finishReset = function() {
            if ($scope.resetAccount.password !== $scope.confirmPassword) {
                $scope.doNotMatch = 'ERROR';
            } else {
                Auth.resetPasswordFinish({key: $stateParams.key, newPassword: $scope.resetAccount.password}).then(function () {
                    $scope.success = 'OK';
                }).catch(function (response) {
                    $scope.success = null;
                    $scope.error = 'ERROR';

                });
            }

        };
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('finishReset', {
                parent: 'account',
                url: '/reset/finish?key',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/reset/finish/reset.finish.html',
                        controller: 'ResetFinishController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('reset');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('RequestResetController', ["$rootScope", "$scope", "$state", "$timeout", "Auth", function ($rootScope, $scope, $state, $timeout, Auth) {

        $scope.success = null;
        $scope.error = null;
        $scope.errorEmailNotExists = null;
        $scope.resetAccount = {};
        $timeout(function (){angular.element('[ng-model="resetAccount.email"]').focus();});

        $scope.requestReset = function () {

            $scope.error = null;
            $scope.errorEmailNotExists = null;

            Auth.resetPasswordInit($scope.resetAccount.email).then(function () {
                $scope.success = 'OK';
            }).catch(function (response) {
                $scope.success = null;
                if (response.status === 400 && response.data === 'e-mail address not registered') {
                    $scope.errorEmailNotExists = 'ERROR';
                } else {
                    $scope.error = 'ERROR';
                }
            });
        }

    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('requestReset', {
                parent: 'account',
                url: '/reset/request',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/reset/request/reset.request.html',
                        controller: 'RequestResetController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('reset');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('system', {
                abstract: true,
                parent: 'site'
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('audits', {
                parent: 'system',
                url: '/audits',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'audits.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/system/audits/audits.html',
                        controller: 'AuditsController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('audits');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('AuditsController', ["$scope", "$filter", "AuditsService", function ($scope, $filter, AuditsService) {
        $scope.onChangeDate = function () {
            var dateFormat = 'yyyy-MM-dd';
            var fromDate = $filter('date')($scope.fromDate, dateFormat);
            var toDate = $filter('date')($scope.toDate, dateFormat);

            AuditsService.findByDates(fromDate, toDate).then(function (data) {
                $scope.audits = data;
            });
        };

        // Date picker configuration
        $scope.today = function () {
            // Today + 1 day - needed if the current day must be included
            var today = new Date();
            $scope.toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        };

        $scope.previousMonth = function () {
            var fromDate = new Date();
            if (fromDate.getMonth() === 0) {
                fromDate = new Date(fromDate.getFullYear() - 1, 0, fromDate.getDate());
            } else {
                fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth() - 1, fromDate.getDate());
            }

            $scope.fromDate = fromDate;
        };

        $scope.today();
        $scope.previousMonth();
        $scope.onChangeDate();
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('configuration', {
                parent: 'system',
                url: '/configuration',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'configuration.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/system/configuration/configuration.html',
                        controller: 'ConfigurationController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('configuration');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('ConfigurationController', ["$scope", "ConfigurationService", function ($scope, ConfigurationService) {
        ConfigurationService.get().then(function(configuration) {
            $scope.configuration = configuration;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('docs', {
                parent: 'system',
                url: '/docs',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'global.menu.system.apidocs'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/system/docs/docs.html'
                    }
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('health', {
                parent: 'system',
                url: '/health',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'health.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/system/health/health.html',
                        controller: 'HealthController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('health');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('HealthController', ["$scope", "MonitoringService", function ($scope, MonitoringService) {
        $scope.updatingHealth = true;
        $scope.separator = '.';

        $scope.refresh = function () {
            $scope.updatingHealth = true;
            MonitoringService.checkHealth().then(function (response) {
                $scope.healthData = $scope.transformHealthData(response);
                $scope.updatingHealth = false;
            }, function (response) {
                $scope.healthData =  $scope.transformHealthData(response.data);
                $scope.updatingHealth = false;
            });
        };

        $scope.refresh();

        $scope.getLabelClass = function (statusState) {
            if (statusState === 'UP') {
                return 'label-success';
            } else {
                return 'label-danger';
            }
        };

        $scope.transformHealthData = function (data) {
            var response = [];
            $scope.flattenHealthData(response, null, data);
            return response;
        };

        $scope.flattenHealthData = function (result, path, data) {
            angular.forEach(data, function (value, key) {
                if ($scope.isHealthObject(value)) {
                    if ($scope.hasSubSystem(value)) {
                        $scope.addHealthObject(result, false, value, $scope.getModuleName(path, key));
                        $scope.flattenHealthData(result, $scope.getModuleName(path, key), value);
                    } else {
                        $scope.addHealthObject(result, true, value, $scope.getModuleName(path, key));
                    }
                }
            });
            return result;
        };

        $scope.getModuleName = function (path, name) {
            var result;
            if (path && name) {
                result = path + $scope.separator + name;
            }  else if (path) {
                result = path;
            } else if (name) {
                result = name;
            } else {
                result = '';
            }
            return result;
        };


        $scope.showHealth = function (health) {
            $scope.currentHealth = health;
            $('#showHealthModal').modal('show');
        };

        $scope.addHealthObject = function (result, isLeaf, healthObject, name) {

            var healthData = {
                'name': name
            };
            var details = {};
            var hasDetails = false;

            angular.forEach(healthObject, function (value, key) {
                if (key === 'status' || key === 'error') {
                    healthData[key] = value;
                } else {
                    if (!$scope.isHealthObject(value)) {
                        details[key] = value;
                        hasDetails = true;
                    }
                }
            });

            // Add the of the details
            if (hasDetails) {
                angular.extend(healthData, { 'details': details});
            }

            // Only add nodes if they provide additional information
            if (isLeaf || hasDetails || healthData.error) {
                result.push(healthData);
            }
            return healthData;
        };

        $scope.hasSubSystem = function (healthObject) {
            var result = false;
            angular.forEach(healthObject, function (value) {
                if (value && value.status) {
                    result = true;
                }
            });
            return result;
        };

        $scope.isHealthObject = function (healthObject) {
            var result = false;
            angular.forEach(healthObject, function (value, key) {
                if (key === 'status') {
                    result = true;
                }
            });
            return result;
        };

        $scope.baseName = function (name) {
            if (name) {
              var split = name.split('.');
              return split[0];
            }
        };

        $scope.subSystemName = function (name) {
            if (name) {
              var split = name.split('.');
              split.splice(0, 1);
              var remainder = split.join('.');
              return remainder ? ' - ' + remainder : '';
            }
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('logs', {
                parent: 'system',
                url: '/logs',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'logs.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/system/logs/logs.html',
                        controller: 'LogsController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('logs');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('LogsController', ["$scope", "LogsService", function ($scope, LogsService) {
        $scope.loggers = LogsService.findAll();

        $scope.changeLevel = function (name, level) {
            LogsService.changeLevel({name: name, level: level}, function () {
                $scope.loggers = LogsService.findAll();
            });
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('metrics', {
                parent: 'system',
                url: '/metrics',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'metrics.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/system/metrics/metrics.html',
                        controller: 'MetricsController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('metrics');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('MetricsController', ["$scope", "MonitoringService", function ($scope, MonitoringService) {
        $scope.metrics = {};
        $scope.updatingMetrics = true;

        $scope.refresh = function () {
            $scope.updatingMetrics = true;
            MonitoringService.getMetrics().then(function (promise) {
                $scope.metrics = promise;
                $scope.updatingMetrics = false;
            }, function (promise) {
                $scope.metrics = promise.data;
                $scope.updatingMetrics = false;
            });
        };

        $scope.$watch('metrics', function (newValue) {
            $scope.servicesStats = {};
            $scope.cachesStats = {};
            angular.forEach(newValue.timers, function (value, key) {
                if (key.indexOf('web.rest') !== -1 || key.indexOf('service') !== -1) {
                    $scope.servicesStats[key] = value;
                }

                if (key.indexOf('net.sf.ehcache.Cache') !== -1) {
                    // remove gets or puts
                    var index = key.lastIndexOf('.');
                    var newKey = key.substr(0, index);

                    // Keep the name of the domain
                    index = newKey.lastIndexOf('.');
                    $scope.cachesStats[newKey] = {
                        'name': newKey.substr(index + 1),
                        'value': value
                    };
                }
            });
        });

        $scope.refresh();

        $scope.refreshThreadDumpData = function () {
            MonitoringService.threadDump().then(function (data) {
                $scope.threadDump = data;

                $scope.threadDumpRunnable = 0;
                $scope.threadDumpWaiting = 0;
                $scope.threadDumpTimedWaiting = 0;
                $scope.threadDumpBlocked = 0;

                angular.forEach(data, function (value) {
                    if (value.threadState === 'RUNNABLE') {
                        $scope.threadDumpRunnable += 1;
                    } else if (value.threadState === 'WAITING') {
                        $scope.threadDumpWaiting += 1;
                    } else if (value.threadState === 'TIMED_WAITING') {
                        $scope.threadDumpTimedWaiting += 1;
                    } else if (value.threadState === 'BLOCKED') {
                        $scope.threadDumpBlocked += 1;
                    }
                });

                $scope.threadDumpAll = $scope.threadDumpRunnable + $scope.threadDumpWaiting +
                    $scope.threadDumpTimedWaiting + $scope.threadDumpBlocked;

            });
        };

        $scope.getLabelClass = function (threadState) {
            if (threadState === 'RUNNABLE') {
                return 'label-success';
            } else if (threadState === 'WAITING') {
                return 'label-info';
            } else if (threadState === 'TIMED_WAITING') {
                return 'label-warning';
            } else if (threadState === 'BLOCKED') {
                return 'label-danger';
            }
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('user', {
                parent: 'admin',
                url: '/user',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'user.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/user/users.html',
                        controller: 'UserController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('user');
                        return $translate.refresh();
                    }]
                }
            })
            .state('user.detail', {
                parent: 'admin',
                url: '/user/{id}',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'mycontractApp.user.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/user/user-detail.html',
                        controller: 'UserDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('user');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'User', function($stateParams, User) {
                        return User.getUser().getUser({id : $stateParams.id});
                    }],
                    userId:  ["$stateParams", function($stateParams) {
                        return $stateParams.id;
                    }]
                }
            })
            .state('user.new', {
                parent: 'admin',
                url: '/new',
                data: {
                    roles: ['ROLE_ADMIN'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/user/user-dialog.html',
                        controller: 'UserDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {login: null, id: null, lastName: null, firstName: null, email: null, langKey: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('user', null, { reload: true });
                    }, function() {
                        $state.go('user');
                    })
                }]
            })
            .state('user.edit', {
                parent: 'admin',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_ADMIN'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/user/user-dialog.html',
                        controller: 'UserDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['User', function(User) {
                                return User.getUser().getUser({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('user', null, { reload: true });
                    }, function() {
                        $state.go('user');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('UserController',["$scope", "User", function ($scope, User) {
        $scope.users = [];
        $scope.loadAll = function() {
            User.query().query(function(result) {
                $scope.users = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            $scope.selectedUserId = id;
            $('#deleteUserConfirmation').modal('show');
        };

        $scope.confirmDelete = function () {
            User.deleteUser().deleteUser({id: $scope.selectedUserId},
                function () {
                    $scope.loadAll();
                    $('#deleteUserConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.user = {name: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('UserDetailController', ["$scope", "$rootScope", "$stateParams", "$state", "entity", "User", "userId", function ($scope, $rootScope, $stateParams, $state, entity, User, userId) {
        $scope.user = entity;
        $scope.load = function (id) {
            User.getUser().getUser({id: id}, function(result) {
                $scope.user = result;
            });
        };
        $rootScope.$on('mycontractApp:userUpdate', function(event, result) {
            $scope.user = result;
        });

        $scope.removeUserRole = function(roleName) {
            var index = $scope.user.roles.indexOf(roleName);
            if (index >= 0) {
                $scope.user.roles.splice(index, 1);
            }
        };

        $scope.addRole = function(role){
            $scope.show = true;
            $scope.user.roles.push(role.name);
            $scope.show = false;
        };

        $scope.showRole = function(){
            $scope.show = true;
        };

        $scope.addUserRoles = function() {
            User.updateUserRoles().updateUserRoles({id: $scope.user.id}, $scope.user.roles, function(result){
                $state.go('user.detail', {id: $scope.user.id}, { reload: true });
            });
        };

        $scope.userId = userId;
        $scope.show = false;
    }]);

'use strict';

angular.module('mycontractApp').controller('UserDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'User',
        function($scope, $stateParams, $modalInstance, entity, User) {

        $scope.user = entity;
        $scope.data = {
            selectedDept:null
        };

        $scope.load = function(id) {
            User.getUser().getUser({id : id}, function(result) {
                $scope.user = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:userUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.user.id != null) {
                User.updateUser().updateUser({id: $scope.user.id}, $scope.user, onSaveFinished);
            } else {
                $scope.user.departmentId = $scope.data.selectedDept.id;
                User.createUser().createUser($scope.user, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('authority', {
                parent: 'entity',
                url: '/authorities',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.authority.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/authority/authorities.html',
                        controller: 'AuthorityController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('authority');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('authority.detail', {
                parent: 'entity',
                url: '/authority/{name}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.authority.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/authority/authority-detail.html',
                        controller: 'AuthorityDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('authority');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Authority', function($stateParams, Authority) {
                        return Authority.get({name : $stateParams.name});
                    }]
                }
            })
            .state('authority.new', {
                parent: 'authority',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/authority/authority-dialog.html',
                        controller: 'AuthorityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('authority', null, { reload: true });
                    }, function() {
                        $state.go('authority');
                    })
                }]
            })
            .state('authority.edit', {
                parent: 'authority',
                url: '/{name}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/role/role-dialog.html',
                        controller: 'AuthorityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Authority', function(Authority) {
                                return Authority.get({name : $stateParams.name});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('authority', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('AuthorityController', ["$scope", "Authority", function ($scope, Authority) {
        $scope.authorities = [];
        $scope.loadAll = function() {
            Authority.query(function(result) {
               $scope.authorities = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Authority.get({id: id}, function(result) {
                $scope.authority = result;
                $('#deleteAuthorityConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Authority.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteAuthorityConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.authority = {name: null, id: null};
        };
    }]);
    /*.filter('findRoleFromKey', function () {
        return function (role) {
            return {
                "ROLE_ADMIN": "System Administrator",
                "ROLE_USER": "Regular User",
                "ROLE_CONFIG": "System Configuration User"
            }[role];
        }
    });*/

'use strict';

angular.module('mycontractApp')
    .controller('AuthorityDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Authority", function ($scope, $rootScope, $stateParams, entity, Authority) {
        $scope.authority = entity;
        $scope.load = function (name) {
            Authority.get({name: name}, function(result) {
                $scope.authority = result;
            });
        };
        $rootScope.$on('mycontractApp:authorityUpdate', function(event, result) {
            $scope.authority = result;
        });
    }]);

'use strict';

angular.module('mycontractApp').controller('AuthorityDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Role',
        function($scope, $stateParams, $modalInstance, entity, Authority) {

        $scope.authority = entity;
        $scope.load = function(id) {
            Authority.get({id : id}, function(result) {
                $scope.authority = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:roleUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.authority.id != null) {
                Authority.update($scope.authority, onSaveFinished);
            } else {
                Authority.save($scope.authority, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .factory('Authority', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/authorities/:name', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('admin', {
                abstract: true,
                parent: 'site'
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('entity', {
                abstract: true,
                parent: 'site'
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('error', {
                parent: 'site',
                url: '/error',
                data: {
                    roles: [],
                    pageTitle: 'error.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/error/error.html'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                        $translatePartialLoader.addPart('error');
                        return $translate.refresh();
                    }]
                }
            })
            .state('accessdenied', {
                parent: 'site',
                url: '/accessdenied',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/error/accessdenied.html'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                        $translatePartialLoader.addPart('error');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('home', {
                parent: 'site',
                url: '/',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/dashboard/dashboard.html',
                        controller: 'DashboardController'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                        $translatePartialLoader.addPart('main');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('MainController', ["$scope", "Principal", function ($scope, Principal) {
        Principal.identity().then(function(account) {
            $scope.account = account;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('dashboard', {
                parent: 'site',
                url: '/',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/dashboard/dashboard.html',
                        controller: 'DashboardController'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                        $translatePartialLoader.addPart('dashboard');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('DashboardController', ["$scope", "Principal", function ($scope, Principal) {
        Principal.identity().then(function(account) {
            $scope.account = account;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Language', ["$q", "$http", "$translate", "LANGUAGES", function ($q, $http, $translate, LANGUAGES) {
        return {
            getCurrent: function () {
                var deferred = $q.defer();
                var language = $translate.storage().get('NG_TRANSLATE_LANG_KEY');

                if (angular.isUndefined(language)) {
                    language = 'en';
                }

                deferred.resolve(language);
                return deferred.promise;
            },
            getAll: function () {
                var deferred = $q.defer();
                deferred.resolve(LANGUAGES);
                return deferred.promise;
            }
        };
    }])

/*
 Languages codes are ISO_639-1 codes, see http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 They are written in English to avoid character encoding issues (not a perfect solution)
 */
    .constant('LANGUAGES', [
        'en', 'fr'
        //JHipster will add new languages here
    ]
);





'use strict';

angular.module('mycontractApp')
    .controller('LanguageController', ["$scope", "$translate", "Language", "tmhDynamicLocale", function ($scope, $translate, Language, tmhDynamicLocale) {
        $scope.changeLanguage = function (languageKey) {
            $translate.use(languageKey);
            tmhDynamicLocale.set(languageKey);
        };

        Language.getAll().then(function (languages) {
            $scope.languages = languages;
        });
    }])
    .filter('findLanguageFromKey', function () {
        return function (lang) {
            return {
                "en": "English",
                "fr": "Français",
                "de": "Deutsch",
                "it": "Italiano",
                "ru": "Русский",
                "tr": "Türkçe",
                "ca": "Català",
                "da": "Dansk",
                "es": "Español",
                "hu": "Magyar",
                "ja": "日本語",
                "kr": "한국어",
                "pl": "Polski",
                "pt-br": "Português (Brasil)",
                "ro": "Română",
                "sv": "Svenska",
                "zh-cn": "中文（简体）",
                "zh-tw": "繁體中文",
            }[lang];
        }
    });

'use strict';

angular.module('mycontractApp')
    .factory('AuthServerProvider', ["$http", "localStorageService", "Base64", function loginService($http, localStorageService, Base64) {
        return {
            login: function(credentials) {
                var data = "username=" + credentials.username + "&password="
                    + credentials.password;
                return $http.post('api/authenticate', data, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json"
                    }
                }).success(function (response) {
                    localStorageService.set('token', response);
                    return response;
                });
            },
            logout: function() {
                //Stateless API : No server logout
                localStorageService.clearAll();
            },
            getToken: function () {
                return localStorageService.get('token');
            },
            hasValidToken: function () {
                var token = this.getToken();
                return token && token.expires && token.expires > new Date().getTime();
            }
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('firstEntity', {
                parent: 'entity',
                url: '/firstEntitys',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.firstEntity.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/firstEntity/firstEntitys.html',
                        controller: 'FirstEntityController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('firstEntity');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('firstEntity.detail', {
                parent: 'entity',
                url: '/firstEntity/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.firstEntity.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/firstEntity/firstEntity-detail.html',
                        controller: 'FirstEntityDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('firstEntity');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'FirstEntity', function($stateParams, FirstEntity) {
                        return FirstEntity.get({id : $stateParams.id});
                    }]
                }
            })
            .state('firstEntity.new', {
                parent: 'firstEntity',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/firstEntity/firstEntity-dialog.html',
                        controller: 'FirstEntityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('firstEntity', null, { reload: true });
                    }, function() {
                        $state.go('firstEntity');
                    })
                }]
            })
            .state('firstEntity.next', {
                parent: 'firstEntity',
                url: '/next',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/firstEntity/firstEntity-detail.html',
                        controller: 'FirstEntityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('firstEntity', null, { reload: true });
                    }, function() {
                        $state.go('firstEntity');
                    })
                }]
            })
            .state('firstEntity.edit', {
                parent: 'firstEntity',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/firstEntity/firstEntity-dialog.html',
                        controller: 'FirstEntityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['FirstEntity', function(FirstEntity) {
                                return FirstEntity.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('firstEntity', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('FirstEntityController', ["$scope", "FirstEntity", "ParseLinks", function ($scope, FirstEntity, ParseLinks) {
        $scope.firstEntitys = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            FirstEntity.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.firstEntitys = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            FirstEntity.get({id: id}, function(result) {
                $scope.firstEntity = result;
                $('#deleteFirstEntityConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            FirstEntity.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteFirstEntityConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.firstEntity = {name: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('FirstEntityDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'FirstEntity',
        function($scope, $stateParams, $modalInstance, entity, FirstEntity) {

        $scope.firstEntity = entity;
        $scope.load = function(id) {
            FirstEntity.get({id : id}, function(result) {
                $scope.firstEntity = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:firstEntityUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.firstEntity.id != null) {
                FirstEntity.update($scope.firstEntity, onSaveFinished);
            } else {
                FirstEntity.save($scope.firstEntity, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.openEdit = function() {
            $modalInstance.close();
            $modal.open({
                templateUrl: 'scripts/app/entities/firstEntity/firstEntity-dialog.html',
                controller: 'FirstEntityDialogController',
                size: 'lg',
                resolve: {
                    entity: ['FirstEntity', function(FirstEntity) {
                        return FirstEntity.get({id : $stateParams.id});
                    }]
                }
            }).result.then(function(result) {
                $state.go('firstEntity', null, { reload: true });
            }, function() {
                $state.go('^');
            })
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('FirstEntityDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "FirstEntity", function ($scope, $rootScope, $stateParams, entity, FirstEntity) {
        $scope.firstEntity = entity;
        $scope.load = function (id) {
            FirstEntity.get({id: id}, function(result) {
                $scope.firstEntity = result;
            });
        };
        $rootScope.$on('mycontractApp:firstEntityUpdate', function(event, result) {
            $scope.firstEntity = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('FirstEntity', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/firstEntitys/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('category', {
                parent: 'entity',
                url: '/categorys',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                    pageTitle: 'mycontractApp.category.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/category/categorys.html',
                        controller: 'CategoryController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('category');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('category.detail', {
                parent: 'entity',
                url: '/category/{id}',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                    pageTitle: 'mycontractApp.category.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/category/category-detail.html',
                        controller: 'CategoryDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('category');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Category', function($stateParams, Category) {
                        return Category.get({id : $stateParams.id});
                    }]
                }
            })
            .state('category.new', {
                parent: 'category',
                url: '/new',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/category/category-dialog.html',
                        controller: 'CategoryDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('category', null, { reload: true });
                    }, function() {
                        $state.go('category');
                    })
                }]
            })
            .state('category.edit', {
                parent: 'category',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_BRANCH_MANAGER', 'ROLE_EXECUTIVE'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/category/category-dialog.html',
                        controller: 'CategoryDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Category', function(Category) {
                                return Category.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('category', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('CategoryController', ["$scope", "Category", "ParseLinks", function ($scope, Category, ParseLinks) {
        $scope.categories = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Category.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.categories = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Category.get({id: id}, function(result) {
                $scope.category = result;
                $('#deleteCategoryConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Category.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteCategoryConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.category = {name: null, description: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('CategoryDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Category',
        function($scope, $stateParams, $modalInstance, entity, Category) {

        $scope.category = entity;
        $scope.load = function(id) {
            Category.get({id : id}, function(result) {
                $scope.category = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:categoryUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.category.id != null) {
                Category.update($scope.category, onSaveFinished);
            } else {
                Category.save($scope.category, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('CategoryDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Category", function ($scope, $rootScope, $stateParams, entity, Category) {
        $scope.category = entity;
        $scope.load = function (id) {
            Category.get({id: id}, function(result) {
                $scope.category = result;
            });
        };
        $rootScope.$on('mycontractApp:categoryUpdate', function(event, result) {
            $scope.category = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Category', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/categorys/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('address', {
                parent: 'entity',
                url: '/addresss',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.address.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/address/addresss.html',
                        controller: 'AddressController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('address');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('address.detail', {
                parent: 'entity',
                url: '/address/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.address.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/address/address-detail.html',
                        controller: 'AddressDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('address');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Address', function($stateParams, Address) {
                        return Address.get({id : $stateParams.id});
                    }]
                }
            })
            .state('address.new', {
                parent: 'address',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/address/address-dialog.html',
                        controller: 'AddressDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {address_line_1: null, address_line_2: null, city: null, province: null, country: null, postal_code: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('address', null, { reload: true });
                    }, function() {
                        $state.go('address');
                    })
                }]
            })
            .state('address.edit', {
                parent: 'address',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/address/address-dialog.html',
                        controller: 'AddressDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Address', function(Address) {
                                return Address.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('address', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('AddressController', ["$scope", "Address", "ParseLinks", function ($scope, Address, ParseLinks) {
        $scope.addresss = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Address.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.addresss = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Address.get({id: id}, function(result) {
                $scope.address = result;
                $('#deleteAddressConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Address.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteAddressConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.address = {address_line_1: null, address_line_2: null, city: null, province: null, country: null, postal_code: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('AddressDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Address',
        function($scope, $stateParams, $modalInstance, entity, Address) {

        $scope.address = entity;
        $scope.load = function(id) {
            Address.get({id : id}, function(result) {
                $scope.address = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:addressUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.address.id != null) {
                Address.update($scope.address, onSaveFinished);
            } else {
                Address.save($scope.address, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('AddressDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Address", function ($scope, $rootScope, $stateParams, entity, Address) {
        $scope.address = entity;
        $scope.load = function (id) {
            Address.get({id: id}, function(result) {
                $scope.address = result;
            });
        };
        $rootScope.$on('mycontractApp:addressUpdate', function(event, result) {
            $scope.address = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Address', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/addresss/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
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
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('DepartmentController', ["$scope", "Department", "ParseLinks", "Principal", function ($scope, Department, ParseLinks, Principal) {
        $scope.departments = [];
        $scope.internalDivisions = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Department.query().query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.departments = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };

        $scope.loadInternal = function(){
            Principal.identity().then(function(account) {
                $scope.account = account;
                Department.getInternalDivisions().getInternalDivisions({id: $scope.account.id}, function(result){
                    $scope.internalDivisions = result;
                });
            });
        }

        $scope.loadAll();

        $scope.loadInternal();


        $scope.delete = function (id) {
            Department.getDepartment().getDepartment({id: id}, function(result) {
                $scope.department = result;
                $('#deleteDepartmentConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Department.deleteDepartment().deleteDepartment({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteDepartmentConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.department = {name: null, description: null, note: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('DepartmentDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Department', 'Person',
        function($scope, $stateParams, $modalInstance, entity, Department, Person) {

        $scope.department = entity;
        $scope.persons = Person.query();
        $scope.load = function(id) {
            Department.get({id : id}, function(result) {
                $scope.department = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:departmentUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.department.id != null) {
                Department.update($scope.department, onSaveFinished);
            } else {
                Department.save($scope.department, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('DepartmentDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Department", "Person", function ($scope, $rootScope, $stateParams, entity, Department, Person) {
        $scope.department = entity;
        $scope.load = function (id) {
            Department.deleteDepartment().getDepartment({id: id}, function(result) {
                $scope.department = result;
            });
        };
        $rootScope.$on('mycontractApp:departmentUpdate', function(event, result) {
            $scope.department = result;
        });
    }]);

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
    .factory('Department', ["$resource", function ($resource) {
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
    }]);


'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('role', {
                parent: 'entity',
                url: '/roles',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.role.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/role/roles.html',
                        controller: 'RoleController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('role');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('role.detail', {
                parent: 'entity',
                url: '/role/{name}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.role.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/role/role-detail.html',
                        controller: 'RoleDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('role');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Role', function($stateParams, Role) {
                        return Role.get({name : $stateParams.name});
                    }]
                }
            })
            .state('role.new', {
                parent: 'role',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/role/role-dialog.html',
                        controller: 'RoleDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('role', null, { reload: true });
                    }, function() {
                        $state.go('role');
                    })
                }]
            })
            .state('role.edit', {
                parent: 'role',
                url: '/{name}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/role/role-dialog.html',
                        controller: 'RoleDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Role', function(Role) {
                                return Role.get({name : $stateParams.name});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('role', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('RoleController', ["$scope", "Role", function ($scope, Role) {
        $scope.roles = [];
        $scope.loadAll = function() {
            Role.query(function(result) {
               $scope.roles = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Role.get({id: id}, function(result) {
                $scope.role = result;
                $('#deleteRoleConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Role.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteRoleConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.role = {name: null, id: null};
        };
    }]);
    /*.filter('findRoleFromKey', function () {
        return function (role) {
            return {
                "ROLE_ADMIN": "System Administrator",
                "ROLE_USER": "Regular User",
                "ROLE_CONFIG": "System Configuration User"
            }[role];
        }
    });*/

'use strict';

angular.module('mycontractApp').controller('RoleDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Role',
        function($scope, $stateParams, $modalInstance, entity, Role) {

        $scope.role = entity;
        $scope.load = function(id) {
            Role.get({id : id}, function(result) {
                $scope.role = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:roleUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.role.id != null) {
                Role.update($scope.role, onSaveFinished);
            } else {
                Role.save($scope.role, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('RoleDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Role", function ($scope, $rootScope, $stateParams, entity, Role) {
        $scope.role = entity;
        $scope.load = function (name) {
            Role.get({name: name}, function(result) {
                $scope.role = result;
            });
        };
        $rootScope.$on('mycontractApp:roleUpdate', function(event, result) {
            $scope.role = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Role', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/roles/:name', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('process', {
                parent: 'entity',
                url: '/processs',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.process.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/process/processs.html',
                        controller: 'ProcessController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('process');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('process.detail', {
                parent: 'entity',
                url: '/process/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.process.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/process/process-detail.html',
                        controller: 'ProcessDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('process');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Process', function($stateParams, Process) {
                        return Process.get({id : $stateParams.id});
                    }]
                }
            })
            .state('process.new', {
                parent: 'process',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/process/process-dialog.html',
                        controller: 'ProcessDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('process', null, { reload: true });
                    }, function() {
                        $state.go('process');
                    })
                }]
            })
            .state('process.edit', {
                parent: 'process',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/process/process-dialog.html',
                        controller: 'ProcessDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Process', function(Process) {
                                return Process.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('process', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('ProcessController', ["$scope", "Process", "ParseLinks", function ($scope, Process, ParseLinks) {
        $scope.processes = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Process.query({page: $scope.page, per_page: 20}, function(result, status, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.processes = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Process.get({id: id}, function(result) {
                $scope.process = result;
                $('#deleteProcessConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Process.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteProcessConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.process = {name: null, description: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('ProcessDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Process', 'Role',
        function($scope, $stateParams, $modalInstance, entity, Process, Role) {

        $scope.process = entity;
        $scope.roles = Role.query();
        $scope.load = function(id) {
            Process.get({id : id}, function(result) {
                $scope.process = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:processUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.process.id != null) {
                Process.update($scope.process, onSaveFinished);
            } else {
                Process.save($scope.process, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('ProcessDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Process", "Role", function ($scope, $rootScope, $stateParams, entity, Process, Role) {
        $scope.process = entity;
        $scope.load = function (id) {
            Process.get({id: id}, function(result) {
                $scope.process = result;
            });
        };
        $rootScope.$on('mycontractApp:processUpdate', function(event, result) {
            $scope.process = result;
        });
    }]);

'use strict';
/*
angular.module('mycontractApp')
    .factory('Process', function ($resource, DateUtils) {
        return $resource('api/processes/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });
*/
angular.module('mycontractApp')
    .factory('Process', ["$http", "$q", "DateUtils", function ($http, $q, DateUtils) {
        var parseParam = function(params){
            var urlParamString = '';
            angular.forEach(params, function(paramInfo, urlParam){
                if(urlParamString == ''){
                    urlParamString = urlParamString+'?'+urlParam+'='+paramInfo;
                } else {
                    urlParamString = urlParamString+'&'+urlParam+'='+paramInfo;
                }
            });
            return urlParamString;
        };

        return {
            get: function(params){
                var id = params.id;
                var deferred = $q.defer();
                $http.get('api/processes/'+id).success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            query: function(params, callback) {
                var urlParamString = parseParam(params);
                $http.get('api/processes'+urlParamString).success(callback);
            },
            update: function(obj, callback) {
                $http.put('api/processes', obj).success(callback);
            },
            delete: function() {
                var deferred = $q.defer();
                $http.delete('api/processes').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            save: function() {
                var deferred = $q.defer();
                $http.post('api/processes').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            getAvailableProcesses: function(params, callback) {
                var urlParamString = parseParam(params);
                $http.get('api/processes/next'+urlParamString).success(callback);
            }
        }
    }]);


'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
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
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('Contract_sampleController', ["$scope", "Contract_sample", "ParseLinks", function ($scope, Contract_sample, ParseLinks) {
        $scope.contract_samples = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Contract_sample.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.contract_samples = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Contract_sample.get({id: id}, function(result) {
                $scope.contract_sample = result;
                $('#deleteContract_sampleConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Contract_sample.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteContract_sampleConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.contract_sample = {name: null, description: null, path: null, file_name: null, uploaded_by: null, uploaded_date_time: null, modified_date_time: null, revision: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('Contract_sampleDialogController',
    ['$scope', '$stateParams', '$modalInstance', '$http', 'entity', 'Contract_sample', 'FileUpload',
        function($scope, $stateParams, $modalInstance, $http, entity, Contract_sample, FileUpload) {

        $scope.contract_sample = entity;
        $scope.load = function(id) {
            Contract_sample.get({id : id}, function(result) {
                $scope.contract_sample = result;
            });
        };

        var isFileUploaded = false;
        $scope.uploadedFile = null;

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:contract_sampleUpdate', result);
            $modalInstance.close(result);
        };

        var onUploadFinished = function(result){
            if(result.status == 'done'){
                $scope.$emit('mycontractApp:contract_sampleUpdate', result);
                $modalInstance.close(result);
            } else if(result.status = 'error'){
                console.log("error");
            }
        }

        $scope.save = function () {
            if ($scope.contract_sample.id != null) {
                Contract_sample.update($scope.contract_sample, onSaveFinished);
            } else {
                Contract_sample.save($scope.contract_sample, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $scope.uploadedFile = null;
            $modalInstance.dismiss('cancel');
        };

        $scope.uploadFile = function() {
            var file = $scope.uploadedFile;
            var fd = new FormData();
            fd.append('file', file);
            var params = {
                name : $scope.contract_sample.name,
                desc : $scope.contract_sample.description
            };
            if($scope.contract_sample.name){
                FileUpload.setParameter(params);
            }

            FileUpload.upload().uploadFile(fd, onUploadFinished);
        };

        $scope.isFileSelected = function() {
            if($scope.uploadedFile){
                return true;
            } else {
                return false;
            }
        };

        $scope.isFileUploaded = function() {
            return isFileUploaded;
        };

        $scope.selectFile = function(files){
            $scope.uploadedFile = files[0];
            $scope.$apply();
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('Contract_sampleDetailController', ["$scope", "$rootScope", "$stateParams", "$window", "$modal", "entity", "Contract_sample", "FileUpload", function ($scope, $rootScope, $stateParams, $window, $modal, entity, Contract_sample, FileUpload) {
        $scope.contract_sample = entity;
        $scope.load = function (id) {
            Contract_sample.get({id: id}, function(result) {
                $scope.contract_sample = result;
            });
        };
        $rootScope.$on('mycontractApp:contract_sampleUpdate', function(event, result) {
            $scope.contract_sample = result;
        });
        $scope.previewFile = function () {
            FileUpload.download().downloadFile({id: $scope.contract_sample.id}, function(result){
                //$window.open(result.file);
                $modal.open({
                    templateUrl: 'scripts/app/entities/contract_sample/samplePDF.html',
                    controller: 'SamplePDFController',
                    size: 'lg',
                    resolve: {
                        content: function () {
                            return result.file;
                        }
                    }
                });
            });
                /*.then(function (result) {
                var file = new Blob([result.data], {type: 'application/pdf'});
                var fileURL = window.URL.createObjectURL(file);
                $window.open(fileURL);
            });*/
        }
    }]);

'use strict';

angular.module('mycontractApp').controller('SamplePDFController',
    ['$scope', '$stateParams', '$modalInstance', '$sce', 'content', 'Contract_sample', 'FileUpload',
        function($scope, $stateParams, $modalInstance, $sce, content, Contract_sample, FileUpload) {

    $scope.pdfContent = $sce.trustAsResourceUrl(content);
    $scope.clear = function() {
        console.log($scope.pdfContent);
        $modalInstance.dismiss('cancel');
    };

}]);

'use strict';

angular.module('mycontractApp')
    .factory('Contract_sample', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/contract_samples/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.uploaded_date_time = DateUtils.convertDateTimeFromServer(data.uploaded_date_time);
                    data.modified_date_time = DateUtils.convertDateTimeFromServer(data.modified_date_time);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('bank_account', {
                parent: 'entity',
                url: '/bank_accounts',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.bank_account.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/bank_account/bank_accounts.html',
                        controller: 'Bank_accountController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('bank_account');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('bank_account.detail', {
                parent: 'entity',
                url: '/bank_account/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.bank_account.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/bank_account/bank_account-detail.html',
                        controller: 'Bank_accountDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('bank_account');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Bank_account', function($stateParams, Bank_account) {
                        return Bank_account.get({id : $stateParams.id});
                    }]
                }
            })
            .state('bank_account.new', {
                parent: 'bank_account',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/bank_account/bank_account-dialog.html',
                        controller: 'Bank_accountDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {bank_name: null, account_name: null, account_number: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('bank_account', null, { reload: true });
                    }, function() {
                        $state.go('bank_account');
                    })
                }]
            })
            .state('bank_account.edit', {
                parent: 'bank_account',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/bank_account/bank_account-dialog.html',
                        controller: 'Bank_accountDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Bank_account', function(Bank_account) {
                                return Bank_account.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('bank_account', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('Bank_accountController', ["$scope", "Bank_account", "ParseLinks", function ($scope, Bank_account, ParseLinks) {
        $scope.bank_accounts = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Bank_account.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.bank_accounts = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Bank_account.get({id: id}, function(result) {
                $scope.bank_account = result;
                $('#deleteBank_accountConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Bank_account.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteBank_accountConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.bank_account = {bank_name: null, account_name: null, account_number: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('Bank_accountDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Bank_account',
        function($scope, $stateParams, $modalInstance, entity, Bank_account) {

        $scope.bank_account = entity;
        $scope.load = function(id) {
            Bank_account.get({id : id}, function(result) {
                $scope.bank_account = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:bank_accountUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.bank_account.id != null) {
                Bank_account.update($scope.bank_account, onSaveFinished);
            } else {
                Bank_account.save($scope.bank_account, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('Bank_accountDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Bank_account", function ($scope, $rootScope, $stateParams, entity, Bank_account) {
        $scope.bank_account = entity;
        $scope.load = function (id) {
            Bank_account.get({id: id}, function(result) {
                $scope.bank_account = result;
            });
        };
        $rootScope.$on('mycontractApp:bank_accountUpdate', function(event, result) {
            $scope.bank_account = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Bank_account', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/bank_accounts/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
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
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('ProjectController', ["$scope", "Project", "ParseLinks", function ($scope, Project, ParseLinks) {
        $scope.projects = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Project.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.projects = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Project.get({id: id}, function(result) {
                $scope.project = result;
                $('#deleteProjectConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Project.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteProjectConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.project = {name: null, identifier: null, description: null, manager: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('ProjectDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Project',
        function($scope, $stateParams, $modalInstance, entity, Project) {

        $scope.project = entity;
        $scope.load = function(id) {
            Project.get({id : id}, function(result) {
                $scope.project = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:projectUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.project.id != null) {
                Project.update($scope.project, onSaveFinished);
            } else {
                Project.save($scope.project, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('ProjectDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Project", function ($scope, $rootScope, $stateParams, entity, Project) {
        $scope.project = entity;
        $scope.load = function (id) {
            Project.get({id: id}, function(result) {
                $scope.project = result;
            });
        };
        $rootScope.$on('mycontractApp:projectUpdate', function(event, result) {
            $scope.project = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Project', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/projects/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('fund_source', {
                parent: 'entity',
                url: '/fund_sources',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.fund_source.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/fund_source/fund_sources.html',
                        controller: 'Fund_sourceController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('fund_source');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('fund_source.detail', {
                parent: 'entity',
                url: '/fund_source/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.fund_source.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/fund_source/fund_source-detail.html',
                        controller: 'Fund_sourceDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('fund_source');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Fund_source', function($stateParams, Fund_source) {
                        return Fund_source.get({id : $stateParams.id});
                    }]
                }
            })
            .state('fund_source.new', {
                parent: 'fund_source',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/fund_source/fund_source-dialog.html',
                        controller: 'Fund_sourceDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, deleted: null, deleted_date_time: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('fund_source', null, { reload: true });
                    }, function() {
                        $state.go('fund_source');
                    })
                }]
            })
            .state('fund_source.edit', {
                parent: 'fund_source',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/fund_source/fund_source-dialog.html',
                        controller: 'Fund_sourceDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Fund_source', function(Fund_source) {
                                return Fund_source.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('fund_source', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('Fund_sourceController', ["$scope", "Fund_source", "ParseLinks", function ($scope, Fund_source, ParseLinks) {
        $scope.fund_sources = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Fund_source.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.fund_sources = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Fund_source.get({id: id}, function(result) {
                $scope.fund_source = result;
                $('#deleteFund_sourceConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Fund_source.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteFund_sourceConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.fund_source = {name: null, description: null, deleted: null, deleted_date_time: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('Fund_sourceDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Fund_source',
        function($scope, $stateParams, $modalInstance, entity, Fund_source) {

        $scope.fund_source = entity;
        $scope.load = function(id) {
            Fund_source.get({id : id}, function(result) {
                $scope.fund_source = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:fund_sourceUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.fund_source.id != null) {
                Fund_source.update($scope.fund_source, onSaveFinished);
            } else {
                Fund_source.save($scope.fund_source, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('Fund_sourceDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Fund_source", function ($scope, $rootScope, $stateParams, entity, Fund_source) {
        $scope.fund_source = entity;
        $scope.load = function (id) {
            Fund_source.get({id: id}, function(result) {
                $scope.fund_source = result;
            });
        };
        $rootScope.$on('mycontractApp:fund_sourceUpdate', function(event, result) {
            $scope.fund_source = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Fund_source', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/fund_sources/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.deleted_date_time = DateUtils.convertDateTimeFromServer(data.deleted_date_time);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
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
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('Contract_partyController', ["$scope", "Contract_party", "ParseLinks", function ($scope, Contract_party, ParseLinks) {
        $scope.contract_parties = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Contract_party.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.contract_parties = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Contract_party.get({id: id}, function(result) {
                $scope.contract_party = result;
                $('#deleteContract_partyConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Contract_party.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteContract_partyConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.contract_party = {name: null, description: null, registration_id: null, registered_capital: null, legal_representative: null, registration_inspection_record: null, professional_certificate: null, business_certificate: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('Contract_partyDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Contract_party', 'Address', 'Bank_account',
        function($scope, $stateParams, $modalInstance, entity, Contract_party, Address, Bank_account) {

        $scope.contract_party = entity;
        $scope.addresss = Address.query();
        $scope.bank_accounts = Bank_account.query();
        $scope.load = function(id) {
            Contract_party.get({id : id}, function(result) {
                $scope.contract_party = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:contract_partyUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.contract_party.id != null) {
                Contract_party.update($scope.contract_party, onSaveFinished);
            } else {
                Contract_party.save($scope.contract_party, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('Contract_partyDetailController', ["$scope", "$rootScope", "$stateParams", "$timeout", "entity", "Contract_party", "Address", "Bank_account", function ($scope, $rootScope, $stateParams, $timeout, entity, Contract_party, Address, Bank_account) {
        $scope.contract_party = entity;
        $scope.address = {};
        $scope.bank_accounts = [];
        $scope.showAddButton = true;
        $scope.showNewBankInfo = false;
        $scope.showCancelSave = false;

        $timeout(function() {
            if($scope.contract_party){
                $scope.address = $scope.contract_party.address;
                $scope.bank_accounts = $scope.contract_party.bank_accounts;
            }
        });
        $scope.load = function (id) {
            Contract_party.get({id: id}, function(result) {
                $scope.contract_party = result;
                $scope.address = $scope.contract_party.address;
            });
        };
        $rootScope.$on('mycontractApp:contract_partyUpdate', function(event, result) {
            $scope.contract_party = result;
        });

        $scope.showNewBank = function(){
            $scope.showNewBankInfo = true;
            $scope.showAddButton = false;
            $scope.showCancelSave = true;
        };

        $scope.clearBankInfo = function(){
            $scope.showNewBankInfo = false;
            $scope.showAddButton = true;
            $scope.bank_account = {};
        };

        $scope.saveBank = function(){
            if ($scope.bank_account.id != null) {
                Bank_account.update($scope.bank_account, onSaveFinished);
            } else {
                $scope.bank_account.owner_id = $scope.contract_party.id;
                Bank_account.save($scope.bank_account, onSaveFinished);
            }
        };

        var onSaveFinished = function (result) {
            $scope.bank_accounts.push(result);
            $scope.showNewBankInfo = false;
            $scope.showAddButton = true;
            $scope.bank_account = {};
        };

    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Contract_party', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/contract_parties/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('contract', {
                parent: 'entity',
                url: '/contracts',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract/contracts.html',
                        controller: 'ContractController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('contract.detail', {
                parent: 'entity',
                url: '/contract/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract/contract-detail.html',
                        controller: 'ContractDetailController'
                    },
                    'info@contract.detail':{
                        templateUrl: 'scripts/app/entities/contract/contract-detail-info.html',
                        controller: 'ContractDetailController'
                    },
                    'project@contract.detail':{
                        templateUrl: 'scripts/app/entities/contract/contract-detail-projects.html',
                        controller: 'ContractDetailController'
                    },
                    'notes@contract.detail':{
                        templateUrl: 'scripts/app/entities/contract/contract-detail-notes.html',
                        controller: 'ContractDetailActivitiesController'
                    },
                    'activities@contract.detail':{
                        templateUrl: 'scripts/app/entities/contract/contract-detail-activities.html',
                        controller: 'ContractDetailActivitiesController'
                    },
                    'attachments@contract.detail':{
                        templateUrl: 'scripts/app/entities/contract/contract-detail-attachments.html',
                        controller: 'ContractDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Contract', function($stateParams, Contract) {
                        return Contract.get($stateParams.id, {});
                    }]
                }
            })
            .state('contract.detail.nextStep', {
                parent: 'contract.detail',
                url: '/contract/{id}',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract/contract-dialog.html',
                        controller: 'ContractDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, reviewIdentifier: null, contractIdentifier: null, contractingMethod: null, amount: null, amountWritten: null, currency: null, amountCurrentYear: null, submitDate: null, startDate: null, endDate: null, expireDate: null, isMultiYear: null, status: null, state: null, approveDate: null, signDate: null, archiveDate: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract', null, { reload: true });
                    }, function() {
                        $state.go('contract');
                    })
                }]
            })
            .state('contract.new', {
                parent: 'contract',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract/contract-dialog.html',
                        controller: 'ContractDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, reviewIdentifier: null, contractIdentifier: null, contractingMethod: null, amount: null, amountWritten: null, currency: null, amountCurrentYear: null, submitDate: null, startDate: null, endDate: null, expireDate: null, isMultiYear: null, status: null, state: null, approveDate: null, signDate: null, archiveDate: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract', null, { reload: true });
                    }, function() {
                        $state.go('contract');
                    })
                }]
            })
            .state('contract.edit', {
                parent: 'contract',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract/contract-dialog.html',
                        controller: 'ContractDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Contract', function(Contract) {
                                return Contract.get($stateParams.id,{});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('contract', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            })
            .state('contract.search', {
                parent: 'contract',
                url: '/search',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract/contract-search.html',
                        controller: 'ContractSearchController',
                        size: 'lg',
                        resolve: {
                            searchTerm: function () {
                                return {
                                    name: null,
                                    contractParty: null,
                                    amount1: null,
                                    amount2: null,
                                    signDate1: null,
                                    signDate2: null
                                }
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract.searchedContract', {searchResults:result}, { reload: true });
                    }, function() {
                        $state.go('contract');
                    })
                }]
            })
            .state('contract.searchedContract', {
                parent: 'contract',
                url: '/search',
                data: {
                    roles: ['ROLE_USER'],
                },
                params: {
                    searchResults: null
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract/contracts.html',
                        controller: 'ContractController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('contract.statistics', {
                parent: 'contract',
                url: '/statistics',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract.statistics.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract/contracts-statistics.html',
                        controller: 'ContractStatsController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('ContractController', ["$scope", "$state", "Contract", "ParseLinks", function ($scope, $state, Contract, ParseLinks) {
        $scope.contracts = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Contract.query({page: $scope.page, per_page: 10}, function(result, status, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.contracts = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        if($state.params.searchResults){
            $scope.contracts = $state.params.searchResults.result;
            $scope.links = ParseLinks.parse($state.params.searchResults.headers('link'));
        } else {
            $scope.loadAll();
        }

        $scope.delete = function (id) {
            Contract.get(id, function(result) {
                $scope.contract = result;
                $('#deleteContractConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Contract.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteContractConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.contract = {name: null, review_identifier: null, contract_identifier: null, contracting_method: null, amount: null, amount_written: null, currency: null, amount_current_year: null, submit_date: null, start_date: null, end_date: null, expire_date: null, is_multi_year: null, status: null, state: null, approve_date: null, sign_date: null, archive_date: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('ContractDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Contract', 'Contract_party', 'Department', 'Category', 'Fund_source', 'Contract_sample', 'Process',
        function($scope, $stateParams, $modalInstance, entity, Contract, Contract_party, Department, Category, Fund_source, Contract_sample, Process) {

        $scope.contract = entity;
        $scope.contract_parties = Contract_party.query();
        $scope.departments = Department.query();
        $scope.categorys = Category.query();
        $scope.fund_sources = Fund_source.query();
        $scope.contract_samples = Contract_sample.query();
        $scope.addedRelatedInternvalDivisions = [];
        $scope.nextProcesses = [];

        $scope.getNextProcess = function(workflowId){
            Process.getAvailableProcesses({current: 1, workflow: workflowId}, function(result){
                $scope.nextProcesses = result;
                $scope.selectedStep = $scope.nextProcesses[0];
            });
        };

        $scope.load = function(id) {
            Contract.get(id, function(result) {
                $scope.contract = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:contractUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.contract.id != null) {
                Contract.update($scope.contract, onSaveFinished);
            } else {
                if($scope.contract.category){
                    $scope.contract.category = $scope.contract.category.id;
                }
                $scope.contract.contractParty = $scope.contract.contractParty.id;
                angular.forEach($scope.addedRelatedInternvalDivisions, function(value){
                    $scope.contract.relatedDepartments.push(value.id);
                });
                Contract.save($scope.contract, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.addParty = function(addedParty){
            if($scope.contract.contractParties == null){
                $scope.contract.contractParties = [];
            }
            $scope.contract.contractParties.push(addedParty.id);
        };

        $scope.addDivs = function(selectedDiv){
            if($scope.contract.relatedDepartments == null){
                $scope.contract.relatedDepartments = [];
            }
            $scope.addedRelatedInternvalDivisions.push(selectedDiv);
        };

        $scope.addProject = function(addedProject){
            if($scope.contract.projects == null){
                $scope.contract.projects = [];
            }
            $scope.contract.projects.push(addedProject.id);
        };

        $scope.categorySelected = function(){
            $scope.getNextProcess($scope.contract.category.workflow.id);
        };

        $scope.removeInternalDivs = function(removedDept){
            var index = $scope.addedRelatedInternvalDivisions.indexOf(removedDept);
            $scope.addedRelatedInternvalDivisions.splice(index, 1);
        };


}]);

'use strict';

angular.module('mycontractApp')
    .controller('ContractDetailController', ["$scope", "$rootScope", "$state", "$stateParams", "$timeout", "entity", "Contract", function ($scope, $rootScope, $state, $stateParams, $timeout, entity, Contract) {
        $scope.contract = entity;

        $scope.load = function (id) {
            Contract.get(id, function(result) {
                $scope.contract = result;
                $scope.$apply();
            });
        };
        $rootScope.$on('mycontractApp:contractUpdate', function(event, result) {
            $scope.contract = result;
        });

        $scope.submitToNextProcess = function () {
            $('#submitToNextProcess_Confirmation').modal('show');
        };

        $scope.confirmToNextProcess = function(){
            Contract.submit($scope.contract.id, $scope.note, function (result) {
                $scope.clear();
                $scope.contract = result;
            });
            $('#submitToNextProcess_Confirmation').modal('hide');
        };

        $scope.rejectContractRequest = function() {
            $('#rejectRequest_Confirmation').modal('show');
        };

        $scope.approveContractRequest = function() {
            $('#approveRequest_Confirmation').modal('show');
        };


        $scope.confirmToReject = function(){
            Contract.reject($scope.contract.id, $scope.note, function (result) {
                $scope.clear();
                $scope.contract = result;
                $('#rejectRequest_Confirmation').modal('hide');
            });
        };

        $scope.confirmToApprove = function(){
            Contract.approve($scope.contract.id, $scope.note, function (result) {
                $scope.clear();
                $scope.contract = result;
                $('#approveRequest_Confirmation').modal('hide');
            });
        };

        $scope.clear = function () {
            //$scope.contract = {name: null, review_identifier: null, contract_identifier: null, contracting_method: null, amount: null, amount_written: null, currency: null, amount_current_year: null, submit_date: null, start_date: null, end_date: null, expire_date: null, is_multi_year: null, status: null, state: null, approve_date: null, sign_date: null, archive_date: null, id: null};
            //$('#submitNextProcess_Confirmation').modal('close');
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('ContractSearchController', ["$scope", "$modalInstance", "$rootScope", "$state", "$stateParams", "$timeout", "DateUtils", "Contract", "searchTerm", function ($scope, $modalInstance, $rootScope, $state, $stateParams, $timeout, DateUtils, Contract, searchTerm) {
        $scope.searchText = searchTerm;
        $scope.page = 1;
        $scope.search = function(){
            var searchStr;
            if($scope.searchText.name){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr +';'+'name:'+$scope.searchText.name;
                } else {
                    searchStr = 'name:'+$scope.searchText.name;
                }
            }
            if($scope.searchText.contractParty){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr + ';'+'contractPartyId:'+$scope.searchText.contractParty.id;
                } else {
                    searchStr = 'contractPartyId:'+$scope.searchText.contractParty.id;
                }
            }
            if($scope.searchText.amount1){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr + ';'+'amount1:'+$scope.searchText.amount1;
                } else {
                    searchStr = 'amount1:'+$scope.searchText.amount1;
                }
            }
            if($scope.searchText.amount2){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr + ';'+'amount2:'+$scope.searchText.amount2;
                } else {
                    searchStr = 'amount2:'+$scope.searchText.amount2;
                }
            }
            if($scope.searchText.signDate1){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr + ';'+'signDate1:'+DateUtils.convertDatetimeToString($scope.searchText.signDate1);
                } else {
                    searchStr = 'signDate1:'+DateUtils.convertDatetimeToString($scope.searchText.signDate1);
                }
            }
            if($scope.searchText.signDate2){
                if(searchStr && searchStr.length > 0) {
                    searchStr = searchStr + ';'+'signDate2:'+DateUtils.convertDatetimeToString($scope.searchText.signDate2);
                } else {
                    searchStr = 'signDate2:'+DateUtils.convertDatetimeToString($scope.searchText.signDate2);
                }
            }

            Contract.search({search: searchStr, page: $scope.page, per_page: 10}, function(result, status, headers) {
                var searchResult = {};
                searchResult.result = result;
                searchResult.headers = headers;
                $modalInstance.close(searchResult);
            });
        }

        $scope.clear = function () {
            $modalInstance.close(null);
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('ContractStatsController', ["$scope", "$state", "Contract", function ($scope, $state, Contract) {
        $scope.sumByMonthResults = [];

        $scope.sumByMonth = function() {
            Contract.sumbymonth({},function(result) {
                $scope.sumByMonthResults.push(result.January);
                $scope.sumByMonthResults.push(result.February);
                $scope.sumByMonthResults.push(result.March);
                $scope.sumByMonthResults.push(result.April);
                $scope.sumByMonthResults.push(result.May);
                $scope.sumByMonthResults.push(result.June);
                $scope.sumByMonthResults.push(result.July);
                $scope.sumByMonthResults.push(result.August);
                $scope.sumByMonthResults.push(result.September);
                $scope.sumByMonthResults.push(result.October);
                $scope.sumByMonthResults.push(result.November);
                $scope.sumByMonthResults.push(result.December);

                var ctx = $("#myBarChart");
                var data = {
                    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    datasets: [
                        {
                            label: "Contract amount by month",
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255,99,132,1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderWidth: 1,
                            data: $scope.sumByMonthResults
                        }
                    ]
                };
                $scope.myBarChart = new Chart(ctx, {
                    type: 'bar',
                    data: data,
                    options: {
                        scales: {
                            xAxes: [{
                                stacked: true
                            }],
                            yAxes: [{
                                stacked: true
                            }]
                        }
                    }
                });
            });
        };

        $scope.sumByMonth();



        $scope.refresh = function () {
            $scope.sumByMonth();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.sumByMonthResults = {}
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('ContractDetailActivitiesController', ["$q", "$scope", "$rootScope", "$state", "$stateParams", "$timeout", "entity", "Contract", "Contract_history", function ($q, $scope, $rootScope, $state, $stateParams, $timeout, entity, Contract, Contract_history) {
        $scope.contract = entity;
        $scope.contract_histories = [];
        $scope.showComment = false
        $scope.showAddButton = true;
        $scope.showCancelSave = false;

        $timeout(function(){
            if($scope.contract.id){
                Contract_history.query({contractId: $scope.contract.id}, function(result, headers) {
                    $scope.contract_histories = result;
                });
            }
        }, 500);

        $scope.showCommentArea = function() {
            $scope.showComment = true;
            $scope.showAddButton = false;
            $scope.showCancelSave = true;
            $timeout(function() {
                $('#commentArea').focus();
            });
        };

        $scope.cancelComment = function() {
            $scope.showComment = false;
            $scope.showAddButton = true;
            $scope.addedComment = null;
            $scope.showCancelSave = false;
        };

        $scope.addComment = function() {
            var comment = {
                note: $scope.addedComment
            };
            Contract.addComment($scope.contract.id, comment, function(data){
                $scope.showComment = false;
                $scope.showAddButton = true;
                $scope.addedComment = null;
                $scope.showCancelSave = false;
                Contract_history.query({contractId: $scope.contract.id}, function(result, headers) {
                    $scope.contract_histories = result;
                });
            })
        };

        $scope.getHistories = function(){
            Contract_history.query({contractId: $scope.contract.id}, function(result, headers) {
                $scope.contract_histories = result;
            });
        };

    }]);

'use strict';
/*
angular.module('mycontractApp')
    .factory('Contract', function ($resource, DateUtils) {
        return $resource('api/contracts/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.submit_date = DateUtils.convertDateTimeFromServer(data.submit_date);
                    data.start_date = DateUtils.convertDateTimeFromServer(data.start_date);
                    data.end_date = DateUtils.convertDateTimeFromServer(data.end_date);
                    data.expire_date = DateUtils.convertDateTimeFromServer(data.expire_date);
                    data.approve_date = DateUtils.convertDateTimeFromServer(data.approve_date);
                    data.sign_date = DateUtils.convertDateTimeFromServer(data.sign_date);
                    data.archive_date = DateUtils.convertDateTimeFromServer(data.archive_date);
                    data.contractParty = data.contractParties[0];
                    return data;
                }
            },
            'update': { method:'PUT'}
        });
    });
*/
angular.module('mycontractApp')
    .factory('Contract', ["$resource", "$http", "$q", "DateUtils", "UrlParams", function ($resource, $http, $q, DateUtils, UrlParams) {
        return {
            query: function(params, callback) {
                var urlParamString = UrlParams.parseParam(params);
                $http.get('api/contracts' + urlParamString).success(callback);
            },
            get: function(id, params){
                var urlParamString = UrlParams.parseParam(params);
                var deferred = $q.defer();
                $http.get('api/contracts/'+id+urlParamString).success(function(data) {
                    data = angular.fromJson(data);
                    data.submit_date = DateUtils.convertDateTimeFromServer(data.submit_date);
                    data.start_date = DateUtils.convertDateTimeFromServer(data.start_date);
                    data.end_date = DateUtils.convertDateTimeFromServer(data.end_date);
                    data.expire_date = DateUtils.convertDateTimeFromServer(data.expire_date);
                    data.approve_date = DateUtils.convertDateTimeFromServer(data.approve_date);
                    data.sign_date = DateUtils.convertDateTimeFromServer(data.sign_date);
                    data.archive_date = DateUtils.convertDateTimeFromServer(data.archive_date);
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            save: function(contract, callback) {
                $http.post('api/contracts', contract).success(callback);
            },
            update: function(obj) {
                $http.put('api/contracts', contract).success(callback);
            },
            approve: function(id, note, callback){
                $http.put('api/contracts/'+id+'/approve', note).success(callback);
            },
            reject: function(id, note, callback){
                $http.put('api/contracts/'+id+'/reject', note).success(callback);
            },
            addComment: function(id, contract_history, callback){
                $http.post('api/contracts/'+id+'/comment', contract_history).success(callback);
            },
            submit: function(id, note, callback){
                $http.put('api/contracts/'+id+'/submit', note).success(callback);
            },
            search: function(params, callback) {
                var urlParamString = UrlParams.parseParam(params);
                $http.get('api/contracts/search' + urlParamString).success(callback);
            },
            sumbymonth: function(params, callback) {
                var urlParamString = UrlParams.parseParam(params);
                $http.get('api/contracts/sumbymonth/' + urlParamString).success(callback);
            }
        }
    }]);

/*
angular.module('mycontractApp')
    .factory('Process', function ($http, $q, DateUtils, UrlParams) {
        var parseParam = function(params){
            var urlParamString = '';
            angular.forEach(params, function(paramInfo, urlParam){
                if(urlParamString == ''){
                    urlParamString = urlParamString+'?'+urlParam+'='+paramInfo;
                } else {
                    urlParamString = urlParamString+'&'+urlParam+'='+paramInfo;
                }
            });
            return urlParamString;
        };

        return {
            get: function(params, callback){
                var id = params.id;
                var deferred = $q.defer();
                $http.get('api/processes/'+id).success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            query: function(params, callback) {
                var urlParamString = UrlParams.parseParam(params);
                $http.get('api/processes'+urlParamString).success(callback);
            },
            update: function(params) {
                var id = params.id;
                $http.put('api/processes/'+id).success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            delete: function() {
                var deferred = $q.defer();
                $http.delete('api/processes').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            save: function() {
                var deferred = $q.defer();
                $http.post('api/processes').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            getAvailableProcesses: function(params, callback) {
                var urlParamString = parseParam(params);
                $http.get('api/processes/next'+urlParamString).success(callback);
            }
        }
    });
*/

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
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
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('WorkflowController', ["$scope", "Workflow", "AuthServerProvider", function ($scope, Workflow, AuthServerProvider) {
        $scope.workflows = [];
        $scope.loadAll = function() {
            Workflow.query({accountId: AuthServerProvider.getToken().account.id},function(result) {
               $scope.workflows = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Workflow.get({id: id}, function(result) {
                $scope.workflow = result;
                $('#deleteWorkflowConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Workflow.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteWorkflowConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.workflow = {name: null, description: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('WorkflowDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Workflow', 'Process',
        function($scope, $stateParams, $modalInstance, entity, Workflow, Process) {

        $scope.workflow = entity;
        $scope.processs = Process.query();
        $scope.load = function(id) {
            Workflow.get({id : id}, function(result) {
                $scope.workflow = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:workflowUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.workflow.id != null) {
                Workflow.update($scope.workflow, onSaveFinished);
            } else {
                Workflow.save($scope.workflow, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('WorkflowDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Workflow", "Process", function ($scope, $rootScope, $stateParams, entity, Workflow, Process) {
        $scope.workflow = entity;

        $scope.load = function (id) {
            Workflow.get({id: id}, function(result) {
                $scope.workflow = result;
            });
        };
        $rootScope.$on('mycontractApp:workflowUpdate', function(event, result) {
            $scope.workflow = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Workflow', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/workflows/:id', {}, {
            'query': { method: 'GET', accountId: '@accountId', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    var processes = [];
                    processes = data.processes;
                    var i = 1;
                    angular.forEach(processes, function(value){
                        value.sequence = i;
                        i++;
                    });
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('contract_history', {
                parent: 'entity',
                url: '/contract_historys',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract_history.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_history/contract_historys.html',
                        controller: 'Contract_historyController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_history');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('contract_history.detail', {
                parent: 'entity',
                url: '/contract_history/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract_history.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_history/contract_history-detail.html',
                        controller: 'Contract_historyDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_history');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Contract_history', function($stateParams, Contract_history) {
                        return Contract_history.get({id : $stateParams.id});
                    }]
                }
            })
            .state('contract_history.new', {
                parent: 'contract_history',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_history/contract_history-dialog.html',
                        controller: 'Contract_historyDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {note: null, action: null, action_datetime: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract_history', null, { reload: true });
                    }, function() {
                        $state.go('contract_history');
                    })
                }]
            })
            .state('contract_history.edit', {
                parent: 'contract_history',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_history/contract_history-dialog.html',
                        controller: 'Contract_historyDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Contract_history', function(Contract_history) {
                                return Contract_history.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('contract_history', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('Contract_historyController', ["$scope", "Contract_history", "ParseLinks", function ($scope, Contract_history, ParseLinks) {
        $scope.contract_historys = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            Contract_history.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.contract_historys = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Contract_history.get({id: id}, function(result) {
                $scope.contract_history = result;
                $('#deleteContract_historyConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Contract_history.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteContract_historyConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.contract_history = {note: null, action: null, action_datetime: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('Contract_historyDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Contract_history', 'Contract', 'User', 'Process',
        function($scope, $stateParams, $modalInstance, entity, Contract_history, Contract, User, Process) {

        $scope.contract_history = entity;
        $scope.contracts = Contract.query();
        $scope.users = User.query();
        $scope.processs = Process.query();
        $scope.load = function(id) {
            Contract_history.get({id : id}, function(result) {
                $scope.contract_history = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:contract_historyUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.contract_history.id != null) {
                Contract_history.update($scope.contract_history, onSaveFinished);
            } else {
                Contract_history.save($scope.contract_history, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('Contract_historyDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Contract_history", "Contract", "User", "Process", function ($scope, $rootScope, $stateParams, entity, Contract_history, Contract, User, Process) {
        $scope.contract_history = entity;
        $scope.load = function (id) {
            Contract_history.get({id: id}, function(result) {
                $scope.contract_history = result;
            });
        };
        $rootScope.$on('mycontractApp:contract_historyUpdate', function(event, result) {
            $scope.contract_history = result;
        });
    }]);

'use strict';

/*angular.module('mycontractApp')
    .factory('Contract_history', function ($resource, DateUtils) {
        return $resource('api/contract_historys/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.action_datetime = DateUtils.convertDateTimeFromServer(data.action_datetime);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });
*/
angular.module('mycontractApp')
    .factory('Contract_history', ["$http", "$q", "DateUtils", "UrlParams", function ($http, $q, DateUtils, UrlParams) {
        return {
            get: function(params){
                var id = params.id;
                var deferred = $q.defer();
                $http.get('api/processes/'+id).success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            query: function(params, callback) {
                var urlParamString = UrlParams.parseParam(params);
                $http.get('api/contract_histories'+urlParamString).success(callback);
            },
            update: function() {
                var deferred = $q.defer();
                $http.put('api/contract_histories/:id').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            delete: function() {
                var deferred = $q.defer();
                $http.delete('api/contract_histories').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            },
            save: function() {
                var deferred = $q.defer();
                $http.post('api/contract_histories').success(function(data){
                    deferred.resolve(data);
                }).error(function(){
                    deferred.reject();
                });
                return deferred.promise;
            }
        }
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('testEntity', {
                parent: 'entity',
                url: '/testEntitys',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.testEntity.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/testEntity/testEntitys.html',
                        controller: 'TestEntityController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('testEntity');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('testEntity.detail', {
                parent: 'entity',
                url: '/testEntity/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.testEntity.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/testEntity/testEntity-detail.html',
                        controller: 'TestEntityDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('testEntity');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'TestEntity', function($stateParams, TestEntity) {
                        return TestEntity.get({id : $stateParams.id});
                    }]
                }
            })
            .state('testEntity.new', {
                parent: 'testEntity',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/testEntity/testEntity-dialog.html',
                        controller: 'TestEntityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {testField: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('testEntity', null, { reload: true });
                    }, function() {
                        $state.go('testEntity');
                    })
                }]
            })
            .state('testEntity.edit', {
                parent: 'testEntity',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/testEntity/testEntity-dialog.html',
                        controller: 'TestEntityDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['TestEntity', function(TestEntity) {
                                return TestEntity.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('testEntity', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('TestEntityController', ["$scope", "TestEntity", function ($scope, TestEntity) {
        $scope.testEntitys = [];
        $scope.loadAll = function() {
            TestEntity.query(function(result) {
               $scope.testEntitys = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            TestEntity.get({id: id}, function(result) {
                $scope.testEntity = result;
                $('#deleteTestEntityConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            TestEntity.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteTestEntityConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.testEntity = {testField: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('TestEntityDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'TestEntity',
        function($scope, $stateParams, $modalInstance, entity, TestEntity) {

        $scope.testEntity = entity;
        $scope.load = function(id) {
            TestEntity.get({id : id}, function(result) {
                $scope.testEntity = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:testEntityUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.testEntity.id != null) {
                TestEntity.update($scope.testEntity, onSaveFinished);
            } else {
                TestEntity.save($scope.testEntity, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('TestEntityDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "TestEntity", function ($scope, $rootScope, $stateParams, entity, TestEntity) {
        $scope.testEntity = entity;
        $scope.load = function (id) {
            TestEntity.get({id: id}, function(result) {
                $scope.testEntity = result;
            });
        };
        $rootScope.$on('mycontractApp:testEntityUpdate', function(event, result) {
            $scope.testEntity = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('TestEntity', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/testEntitys/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.testField = DateUtils.convertLocaleDateFromServer(data.testField);
                    return data;
                }
            },
            'update': {
                method: 'PUT',
                transformRequest: function (data) {
                    data.testField = DateUtils.convertLocaleDateToServer(data.testField);
                    return angular.toJson(data);
                }
            },
            'save': {
                method: 'POST',
                transformRequest: function (data) {
                    data.testField = DateUtils.convertLocaleDateToServer(data.testField);
                    return angular.toJson(data);
                }
            }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('contract_process', {
                parent: 'entity',
                url: '/contract_processs',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract_process.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_process/contract_processs.html',
                        controller: 'Contract_processController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_process');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('contract_process.detail', {
                parent: 'entity',
                url: '/contract_process/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.contract_process.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/contract_process/contract_process-detail.html',
                        controller: 'Contract_processDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('contract_process');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Contract_process', function($stateParams, Contract_process) {
                        return Contract_process.get({id : $stateParams.id});
                    }]
                }
            })
            .state('contract_process.new', {
                parent: 'contract_process',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_process/contract_process-dialog.html',
                        controller: 'Contract_processDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {sequence: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('contract_process', null, { reload: true });
                    }, function() {
                        $state.go('contract_process');
                    })
                }]
            })
            .state('contract_process.edit', {
                parent: 'contract_process',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/contract_process/contract_process-dialog.html',
                        controller: 'Contract_processDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Contract_process', function(Contract_process) {
                                return Contract_process.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('contract_process', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('Contract_processController', ["$scope", "Contract_process", function ($scope, Contract_process) {
        $scope.contract_processs = [];
        $scope.loadAll = function() {
            Contract_process.query(function(result) {
               $scope.contract_processs = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Contract_process.get({id: id}, function(result) {
                $scope.contract_process = result;
                $('#deleteContract_processConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Contract_process.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteContract_processConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.contract_process = {sequence: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('Contract_processDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Contract_process', 'Contract', 'Process', 'Department', 'User',
        function($scope, $stateParams, $modalInstance, entity, Contract_process, Contract, Process, Department, User) {

        $scope.contract_process = entity;
        $scope.contracts = Contract.query();
        $scope.processs = Process.query();
        $scope.departments = Department.query();
        $scope.users = User.query();
        $scope.load = function(id) {
            Contract_process.get({id : id}, function(result) {
                $scope.contract_process = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:contract_processUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.contract_process.id != null) {
                Contract_process.update($scope.contract_process, onSaveFinished);
            } else {
                Contract_process.save($scope.contract_process, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('Contract_processDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Contract_process", "Contract", "Process", "Department", "User", function ($scope, $rootScope, $stateParams, entity, Contract_process, Contract, Process, Department, User) {
        $scope.contract_process = entity;
        $scope.load = function (id) {
            Contract_process.get({id: id}, function(result) {
                $scope.contract_process = result;
            });
        };
        $rootScope.$on('mycontractApp:contract_processUpdate', function(event, result) {
            $scope.contract_process = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Contract_process', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/contract_processs/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
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
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('TaskController', ["$scope", "Task", function ($scope, Task) {
        $scope.tasks = [];
        $scope.loadAll = function() {
            Task.query(function(result) {
               $scope.tasks = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Task.get({id: id}, function(result) {
                $scope.task = result;
                $('#deleteTaskConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Task.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteTaskConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.task = {sequence: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('TaskDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Task', 'Contract', 'Process', 'Department', 'User',
        function($scope, $stateParams, $modalInstance, entity, Task, Contract, Process, Department, User) {

        $scope.task = entity;
        $scope.contracts = Contract.query();
        $scope.processs = Process.query();
        $scope.departments = Department.query();
        $scope.users = User.query();
        $scope.load = function(id) {
            Task.get({id : id}, function(result) {
                $scope.task = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:taskUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.task.id != null) {
                Task.update($scope.task, onSaveFinished);
            } else {
                Task.save($scope.task, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('TaskDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Task", "Contract", "Process", "Department", "User", function ($scope, $rootScope, $stateParams, entity, Task, Contract, Process, Department, User) {
        $scope.task = entity;
        $scope.load = function (id) {
            Task.get({id: id}, function(result) {
                $scope.task = result;
            });
        };
        $rootScope.$on('mycontractApp:taskUpdate', function(event, result) {
            $scope.task = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Task', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/tasks/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('message', {
                parent: 'entity',
                url: '/messages',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.message.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/message/messages.html',
                        controller: 'MessageController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('message');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]
                }
            })
            .state('message.detail', {
                parent: 'entity',
                url: '/message/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'mycontractApp.message.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/message/message-detail.html',
                        controller: 'MessageDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('message');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Message', function($stateParams, Message) {
                        return Message.get({id : $stateParams.id});
                    }]
                }
            })
            .state('message.new', {
                parent: 'message',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/message/message-dialog.html',
                        controller: 'MessageDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {subject: null, content: null, send_datetime: null, read: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('message', null, { reload: true });
                    }, function() {
                        $state.go('message');
                    })
                }]
            })
            .state('message.edit', {
                parent: 'message',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/message/message-dialog.html',
                        controller: 'MessageDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Message', function(Message) {
                                return Message.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('message', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('MessageController', ["$scope", "Message", function ($scope, Message) {
        $scope.messages = [];
        $scope.loadAll = function() {
            Message.query(function(result) {
               $scope.messages = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Message.get({id: id}, function(result) {
                $scope.message = result;
                $('#deleteMessageConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Message.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteMessageConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.message = {subject: null, content: null, send_datetime: null, read: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp').controller('MessageDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Message', 'User',
        function($scope, $stateParams, $modalInstance, entity, Message, User) {

        $scope.message = entity;
        $scope.users = User.query();
        $scope.load = function(id) {
            Message.get({id : id}, function(result) {
                $scope.message = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:messageUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.message.id != null) {
                Message.update($scope.message, onSaveFinished);
            } else {
                Message.save($scope.message, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

'use strict';

angular.module('mycontractApp')
    .controller('MessageDetailController', ["$scope", "$rootScope", "$stateParams", "entity", "Message", "User", function ($scope, $rootScope, $stateParams, entity, Message, User) {
        $scope.message = entity;
        $scope.load = function (id) {
            Message.get({id: id}, function(result) {
                $scope.message = result;
            });
        };
        $rootScope.$on('mycontractApp:messageUpdate', function(event, result) {
            $scope.message = result;
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .factory('Message', ["$resource", "DateUtils", function ($resource, DateUtils) {
        return $resource('api/messages/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.send_datetime = DateUtils.convertDateTimeFromServer(data.send_datetime);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

'use strict';

angular.module('mycontractApp')
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('account', {
                parent: 'admin',
                url: '/account',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'account.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/account/accounts.html',
                        controller: 'AccountController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('account');
                        return $translate.refresh();
                    }]
                }
            })
            .state('account.detail', {
                parent: 'admin',
                url: '/account/{id}',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'mycontractApp.account.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/account/account-detail.html',
                        controller: 'AccountDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('account');
                        return $translate.refresh();
                    }],
                    entity: ['$stateParams', 'Account', function($stateParams, Account) {
                        return Account.getAccount().getAccount({id : $stateParams.id});
                    }],
                    accountId:  ["$stateParams", function($stateParams) {
                        return $stateParams.id;
                    }]
                }
            })
            .state('account.new', {
                parent: 'admin',
                url: '/new',
                data: {
                    roles: ['ROLE_ADMIN'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/account/account-dialog.html',
                        controller: 'AccountDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {login: null, id: null, lastName: null, firstName: null, email: null, langKey: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('account', null, { reload: true });
                    }, function() {
                        $state.go('account');
                    })
                }]
            })
            .state('account.edit', {
                parent: 'admin',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_ADMIN'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/admin/account/account-dialog.html',
                        controller: 'AccountDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Account', function(Account) {
                                return Account.getAccount().getAccount({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('account', null, { reload: true });
                    }, function() {
                        $state.go('account');
                    })
                }]
            });
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('AccountController',["$scope", "Account", function ($scope, Account) {
        $scope.accounts = [];
        $scope.loadAll = function() {
            Account.query().query(function(result) {
                $scope.accounts = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            $scope.selectedAccountId = id;
            $('#deleteAccountConfirmation').modal('show');
        };

        $scope.confirmDelete = function () {
            Account.deleteAccount().deleteAccount({id: $scope.selectedAccountId},
                function () {
                    $scope.loadAll();
                    $('#deleteAccountConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.account = {name: null, id: null};
        };
    }]);

'use strict';

angular.module('mycontractApp')
    .controller('AccountDetailController', ["$scope", "$rootScope", "$stateParams", "$state", "entity", "Account", "accountId", function ($scope, $rootScope, $stateParams, $state, entity, Account, accountId) {
        $scope.account = entity;
        $scope.load = function (id) {
            Account.getAccount().getAccount({id: id}, function(result) {
                $scope.account = result;
            });
        };
        $rootScope.$on('mycontractApp:accountUpdate', function(event, result) {
            $scope.account = result;
        });

        $scope.accountId = accountId;
        $scope.show = false;
    }]);

'use strict';

angular.module('mycontractApp').controller('AccountDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Account',
        function($scope, $stateParams, $modalInstance, entity, Account) {

        $scope.account = entity;
        $scope.data = {
            selectedDept:null
        };

        $scope.load = function(id) {
            Account.getAccount().getAccount({id : id}, function(result) {
                $scope.account = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('mycontractApp:accountUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.account.id != null) {
                User.updateAccount().updateAccount({id: $scope.account.id}, $scope.account, onSaveFinished);
            } else {
                Account.createAccount().createAccount($scope.account, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

angular.module('mycontractApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('scripts/app/admin/account/account-detail.html',
    "<div> <h2> {{account.name}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.account.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{account.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.account.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{account.description}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.account.active>Active</span> </td> <td> <input class=\"input-sm form-control\" value={{account.active}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.account.configuration>Process Configuration</span> </td> <td> <input class=\"input-sm form-control\" value={{account.processConfiguration}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=account class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/admin/account/account-dialog.html',
    "<div> <div class=\"alert alert-danger\" ng-show=errorEmailExists translate=settings.messages.error.emailexists> <strong>E-mail is already in use!</strong> Please choose another one. </div> <form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myRoleLabel translate=mycontractApp.user.home.createOrEditLabel>Create or edit a User</h4> </div> <div class=modal-body> <div class=form-group> <label translate=mycontractApp.user.login>Login Name</label> <input class=form-control name=login placeholder=\"{{'mycontractApp.user.form.login.placeholder' | translate}}\" ng-model=user.login ng-minlength=1 ng-maxlength=50 required maxlength=50> <div ng-show=\"form.login.$dirty && form.login.$invalid\"> <p class=help-block ng-show=form.login.$error.required translate=settings.messages.validate.login.required> Your login name is required. </p> <p class=help-block ng-show=form.login.$error.minlength translate=settings.messages.validate.login.minlength> Your login name is required to be at least 1 character. </p> <p class=help-block ng-show=form.login.$error.maxlength translate=settings.messages.validate.login.maxlength> Your login name cannot be longer than 50 characters. </p> </div> </div> <div class=form-group ng-if=\"user.id == null\"> <label translate=mycontractApp.user.password>Password</label> <input type=password class=form-control name=password placeholder=\"{{'mycontractApp.user.form.password.placeholder' | translate}}\" ng-model=user.password ng-minlength=5 ng-maxlength=50 required maxlength=50> <div ng-show=\"form.password.$dirty && form.password.$invalid\"> <p class=help-block ng-show=form.password.$error.required translate=settings.messages.validate.password.required> Your password is required. </p> <p class=help-block ng-show=form.password.$error.minlength translate=settings.messages.validate.password.minlength> Your password is required to be at least 1 character. </p> <p class=help-block ng-show=form.password.$error.maxlength translate=settings.messages.validate.password.maxlength> Your password cannot be longer than 50 characters. </p> </div> </div> <div class=form-group> <label translate=mycontractApp.user.firstname>First Name</label> <input class=form-control name=firstName placeholder=\"{{'mycontractApp.user.form.firstname.placeholder' | translate}}\" ng-model=user.firstName ng-minlength=1 ng-maxlength=50 required maxlength=50> <div ng-show=\"form.firstName.$dirty && form.firstName.$invalid\"> <p class=help-block ng-show=form.firstName.$error.required translate=settings.messages.validate.firstname.required> Your first name is required. </p> <p class=help-block ng-show=form.firstName.$error.minlength translate=settings.messages.validate.firstname.minlength> Your first name is required to be at least 1 character. </p> <p class=help-block ng-show=form.firstName.$error.maxlength translate=settings.messages.validate.firstname.maxlength> Your first name cannot be longer than 50 characters. </p> </div> </div> <div class=form-group> <label translate=mycontractApp.user.lastname>Last Name</label> <input class=form-control name=lastName placeholder=\"{{'mycontractApp.user.form.lastname.placeholder' | translate}}\" ng-model=user.lastName ng-minlength=1 ng-maxlength=50 required maxlength=50> <div ng-show=\"form.lastName.$dirty && form.lastName.$invalid\"> <p class=help-block ng-show=form.lastName.$error.required translate=settings.messages.validate.lastname.required> Your last name is required. </p> <p class=help-block ng-show=form.lastName.$error.minlength translate=settings.messages.validate.lastname.minlength> Your last name is required to be at least 1 character. </p> <p class=help-block ng-show=form.lastName.$error.maxlength translate=settings.messages.validate.lastname.maxlength> Your last name cannot be longer than 50 characters. </p> </div> </div> <div class=form-group> <label translate=global.form.email>E-mail</label> <input type=email class=form-control name=email placeholder=\"{{'global.form.email.placeholder' | translate}}\" ng-model=user.email ng-minlength=5 ng-maxlength=100 required maxlength=100> <div ng-show=\"form.email.$dirty && form.email.$invalid\"> <p class=help-block ng-show=form.email.$error.required translate=global.messages.validate.email.required> Your e-mail is required. </p> <p class=help-block ng-show=form.email.$error.email translate=global.messages.validate.email.invalid> Your e-mail is invalid. </p> <p class=help-block ng-show=form.email.$error.minlength translate=global.messages.validate.email.minlength> Your e-mail is required to be at least 5 characters. </p> <p class=help-block ng-show=form.email.$error.maxlength translate=global.messages.validate.email.maxlength> Your e-mail cannot be longer than 100 characters. </p> </div> </div> <div class=form-group> <label translate=mycontractApp.user.department>Department</label> <select name=department class=form-control ng-model=data.selectedDept ng-controller=DepartmentController ng-options=\"department as department.name for department in departments\"></select> </div> <div class=form-group> <label translate=mycontractApp.user.language>Language</label> <select name=langKey class=form-control ng-model=user.langKey ng-controller=LanguageController ng-options=\"code as (code | findLanguageFromKey) for code in languages\"></select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form> </div>"
  );


  $templateCache.put('scripts/app/admin/account/accounts.html',
    "<div> <h2 translate=mycontractApp.account.home.title>Accounts</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=account.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.account.home.createLabel>Create a new Account</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteAccountConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.account.delete.question translate-values=\"{id: '{{account.id}}'}\">Are you sure you want to delete this Account?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.account.name>Name</th> <th translate=mycontractApp.account.email>Email</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"account in accounts\"> <td><a ui-sref=account.detail({id:account.id})>{{account.name}}</a></td> <td> <button type=submit ui-sref=account.detail({id:user.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=account.edit({id:user.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(account.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/admin/authority/authorities.html',
    "<div> <h2 translate=mycontractApp.authority.home.title>Authorities</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=authority.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.authority.home.createLabel>Create a new Authority</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteAuthorityConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(authority.name)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.authority.delete.question translate-values=\"{name: '{{authority.name}}'}\">Are you sure you want to delete this Authority?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.authority.name>Name</th> <th translate=mycontractApp.authority.description>Description</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"authority in authorities\"> <td><a ui-sref=authority.detail({name:authority.name})>{{authority.name}}</a></td> <td>{{authority.description}}</td> <td> <button type=submit ui-sref=authority.detail({name:authority.name}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=authority.edit({name:authority.name}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(authority.name) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/admin/authority/authority-detail.html',
    "<div> <h2><span translate=mycontractApp.authority.detail.title>Role</span> {{authority.name}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.authority.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{authority.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.authority.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{authority.description}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=authority class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/admin/authority/authority-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myAuthorityLabel translate=mycontractApp.authority.home.createOrEditLabel>Create or edit a Authority</h4> </div> <div class=modal-body> <div class=form-group> <label translate=mycontractApp.authority.name for=authority_name>Name</label> <input class=form-control name=name id=authority_name ng-model=authority.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.authority.description for=description>Description</label> <input class=form-control name=description id=description ng-model=authority.description> <div ng-show=editForm.description.$invalid> </div> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/admin/department/department-detail.html',
    "<div> <h2><span translate=mycontractApp.department.detail.title>Department</span> {{department.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.department.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{department.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.department.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{department.description}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.department.note>Note</span> </td> <td> <input class=\"input-sm form-control\" value={{department.note}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.department.employee>employee</span> </td> <td> <input class=\"input-sm form-control\" value={{department.employee.first_name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.department.parent_department>parent_department</span> </td> <td> <input class=\"input-sm form-control\" value={{department.parent_department.name}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=department class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/admin/department/department-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myDepartmentLabel translate=mycontractApp.department.home.createOrEditLabel>Create or edit a Department</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=department.id readonly> </div> <div class=form-group> <label translate=mycontractApp.department.name for=field_name>Name</label> <input class=form-control name=name id=field_name ng-model=department.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.department.description for=field_description>Description</label> <input class=form-control name=description id=field_description ng-model=department.description> </div> <div class=form-group> <label translate=mycontractApp.department.note for=field_note>Note</label> <input class=form-control name=note id=field_note ng-model=department.note> </div> <div class=form-group> <label translate=mycontractApp.department.employee for=field_employee>employee</label> <select class=form-control id=field_employee name=employee ng-model=department.employee.id ng-options=\"person.id as person.first_name for person in persons\"> </select> </div> <div class=form-group> <label translate=mycontractApp.department.parent_department for=field_parent_department>parent_department</label> <select class=form-control id=field_parent_department name=parent_department ng-model=department.parent_department.id ng-options=\"department.id as department.name for department in departments\"> </select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/admin/department/departments.html',
    "<div id=\"departments\">\n" +
    "    <div class=\"container\">\n" +
    "        <div class=\"row\">\n" +
    "            <div class=\"col-sm-3\">\n" +
    "                <h3 translate=\"mycontractApp.department.home.title\">Departments<</h3>\n" +
    "            </div>\n" +
    "            <div class=\"col-sm-3\">\n" +
    "                <button class=\"btn btn-primary\" ui-sref=\"department.new\">\n" +
    "                    <span class=\"glyphicon glyphicon-flash\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"modal fade\" id=\"deleteDepartmentConfirmation\">\n" +
    "        <div class=\"modal-dialog\">\n" +
    "            <div class=\"modal-content\">\n" +
    "                <form name=\"deleteForm\" ng-submit=\"confirmDelete(department.id)\">\n" +
    "                    <div class=\"modal-header\">\n" +
    "                        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\"\n" +
    "                                ng-click=\"clear()\">&times;</button>\n" +
    "                        <h4 class=\"modal-title\" translate=\"entity.delete.title\">Confirm delete operation</h4>\n" +
    "                    </div>\n" +
    "                    <div class=\"modal-body\">\n" +
    "                        <p translate=\"mycontractApp.department.delete.question\" translate-values=\"{id: '{{department.id}}'}\">Are you sure you want to delete this Department?</p>\n" +
    "                    </div>\n" +
    "                    <div class=\"modal-footer\">\n" +
    "                        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\" ng-click=\"clear()\">\n" +
    "                            <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=\"entity.action.cancel\">Cancel</span>\n" +
    "                        </button>\n" +
    "                        <button type=\"submit\" ng-disabled=\"deleteForm.$invalid\" class=\"btn btn-danger\">\n" +
    "                            <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=\"entity.action.delete\">Delete</span>\n" +
    "                        </button>\n" +
    "                    </div>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div style=\"display: table-cell\">\n" +
    "    <div class=\"table-responsive\">\n" +
    "        <table class=\"table table-striped\">\n" +
    "            <div class=\"row\">\n" +
    "                <h5 class=\"col-sm-3\" translate=\"mycontractApp.department.name\">Name</h5>\n" +
    "                <h5 class=\"col-sm-5\" translate=\"mycontractApp.department.description\">Description</h5>\n" +
    "                <h5 class=\"col-sm-4\" translate=\"mycontractApp.department.parent\">Parent</h5>\n" +
    "            </div>\n" +
    "            <tbody style=\"display:block; overflow: auto; height: 400px\">\n" +
    "                <tr ng-repeat=\"department in departments\" style=\"width:100%\">\n" +
    "                    <td><a ui-sref=\"department.detail({id:department.id})\">{{department.name}}</a></td>\n" +
    "                    <td>{{department.description}}</td>\n" +
    "                    <td><a ui-sref=\"department.detail({id:department.parentDepartment.id})\">{{department.parentDepartment.name}}</a></td>\n" +
    "                    <td>\n" +
    "                        <button type=\"submit\"\n" +
    "                                ng-click=\"delete(department.id)\"\n" +
    "                                class=\"btn btn-danger btn-sm\">\n" +
    "                            <span class=\"glyphicon glyphicon-trash\"></span>\n" +
    "                        </button>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "        </div>\n" +
    "\n" +
    "        <nav>\n" +
    "            <ul class=\"pagination\">\n" +
    "                <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li>\n" +
    "                <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li>\n" +
    "                <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li>\n" +
    "                <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li>\n" +
    "                <li class=\"active\"><a>{{page}}</a></li>\n" +
    "                <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li>\n" +
    "                <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li>\n" +
    "                <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li>\n" +
    "                <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li>\n" +
    "            </ul>\n" +
    "        </nav>\n" +
    "    </div>\n" +
    "<!--\n" +
    "        <div style=\"display: table-cell\">\n" +
    "            something goes here for detail info\n" +
    "        </div>-->\n" +
    "</div>\n"
  );


  $templateCache.put('scripts/app/admin/role/role-detail.html',
    "<div> <h2><span translate=mycontractApp.role.detail.title>Role</span> {{role.name}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.role.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{role.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.role.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{role.description}} readonly> </td> </tr> <tr> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.role.authorities>Role Authorities</th> </tr> </thead> <tbody> <tr ng-repeat=\"authority in role.authorities\"> <td> <span translate=mycontractApp.role.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{authority.name}} readonly> </td> </tr> </tbody> </table> </tr> </tbody> </table> </div> <button type=submit ui-sref=role class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/admin/role/role-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myRoleLabel translate=mycontractApp.role.home.createOrEditLabel>Create or edit a Role</h4> </div> <div class=modal-body> <div class=form-group> <label translate=mycontractApp.role.name for=role_name>Name</label> <input class=form-control name=name id=role_name ng-model=role.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.role.description for=description>Description</label> <input class=form-control name=description id=description ng-model=role.description> <div ng-show=editForm.description.$invalid> </div> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/admin/role/roles.html',
    "<div> <h2 translate=mycontractApp.role.home.title>Roles</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=role.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.role.home.createLabel>Create a new Role</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteRoleConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(role.name)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.role.delete.question translate-values=\"{name: '{{role.name}}'}\">Are you sure you want to delete this Role?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.role.name>Name</th> <th translate=mycontractApp.role.description>Description</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"role in roles\"> <td><a ui-sref=role.detail({name:role.name})>{{role.name}}</a></td> <td>{{role.description}}</td> <td> <button type=submit ui-sref=role.detail({name:role.name}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=role.edit({name:role.name}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(role.name) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/admin/user/user-detail.html',
    "<div> <h2> {{user.lastName}} {{user.firstName}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.user.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value=\"{{user.lastName}} {{user.firstName}}\" readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.user.login>Login</span> </td> <td> <input class=\"input-sm form-control\" value={{user.login}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.user.department>Department</span> </td> <td> <input class=\"input-sm form-control\" value={{user.department}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.user.language>Language</span> </td> <td> <input class=\"input-sm form-control\" value=\"{{user.langKey | findLanguageFromKey}}\" ng-controller=LanguageController readonly> </td> </tr> <tr> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.user.roles.title>User Roles</th> <th> <button type=button ng-click=showRole() class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-plus-sign\"></span>add role </button> </th> <th> <button type=button ng-click=addUserRoles() class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-save\"></span>Save </button> </th> </tr> </thead> <tbody> <tr ng-repeat=\"role in user.roles track by role\"> <td> <span translate=mycontractApp.user.roles.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{role}} readonly> </td> <td ng-if=\"role != 'ROLE_USER'\"> <button type=button ng-click=removeUserRole(role) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.remove> Remove</span> </button> </td> </tr> <tr ng-show=show> <td> <span translate=mycontractApp.user.roles.name>Name</span> </td> <td> <select name=role class=form-control ng-model=addedRole ng-change=addRole(addedRole) ng-controller=RoleController ng-options=\"role as role.name for role in roles | filter: { name: '!' + user.roles } \"> <option value=\"\">Select Role</option> </select> </td> </tr> </tbody> </table> </tr> </tbody> </table> </div> <button type=submit ui-sref=user class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/admin/user/user-dialog.html',
    "<div> <div class=\"alert alert-danger\" ng-show=errorEmailExists translate=settings.messages.error.emailexists> <strong>E-mail is already in use!</strong> Please choose another one. </div> <form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myRoleLabel translate=mycontractApp.user.home.createOrEditLabel>Create or edit a User</h4> </div> <div class=modal-body> <div class=form-group> <label translate=mycontractApp.user.login>Login Name</label> <input class=form-control name=login placeholder=\"{{'mycontractApp.user.form.login.placeholder' | translate}}\" ng-model=user.login ng-minlength=1 ng-maxlength=50 required maxlength=50> <div ng-show=\"form.login.$dirty && form.login.$invalid\"> <p class=help-block ng-show=form.login.$error.required translate=settings.messages.validate.login.required> Your login name is required. </p> <p class=help-block ng-show=form.login.$error.minlength translate=settings.messages.validate.login.minlength> Your login name is required to be at least 1 character. </p> <p class=help-block ng-show=form.login.$error.maxlength translate=settings.messages.validate.login.maxlength> Your login name cannot be longer than 50 characters. </p> </div> </div> <div class=form-group ng-if=\"user.id == null\"> <label translate=mycontractApp.user.password>Password</label> <input type=password class=form-control name=password placeholder=\"{{'mycontractApp.user.form.password.placeholder' | translate}}\" ng-model=user.password ng-minlength=5 ng-maxlength=50 required maxlength=50> <div ng-show=\"form.password.$dirty && form.password.$invalid\"> <p class=help-block ng-show=form.password.$error.required translate=settings.messages.validate.password.required> Your password is required. </p> <p class=help-block ng-show=form.password.$error.minlength translate=settings.messages.validate.password.minlength> Your password is required to be at least 1 character. </p> <p class=help-block ng-show=form.password.$error.maxlength translate=settings.messages.validate.password.maxlength> Your password cannot be longer than 50 characters. </p> </div> </div> <div class=form-group> <label translate=mycontractApp.user.firstname>First Name</label> <input class=form-control name=firstName placeholder=\"{{'mycontractApp.user.form.firstname.placeholder' | translate}}\" ng-model=user.firstName ng-minlength=1 ng-maxlength=50 required maxlength=50> <div ng-show=\"form.firstName.$dirty && form.firstName.$invalid\"> <p class=help-block ng-show=form.firstName.$error.required translate=settings.messages.validate.firstname.required> Your first name is required. </p> <p class=help-block ng-show=form.firstName.$error.minlength translate=settings.messages.validate.firstname.minlength> Your first name is required to be at least 1 character. </p> <p class=help-block ng-show=form.firstName.$error.maxlength translate=settings.messages.validate.firstname.maxlength> Your first name cannot be longer than 50 characters. </p> </div> </div> <div class=form-group> <label translate=mycontractApp.user.lastname>Last Name</label> <input class=form-control name=lastName placeholder=\"{{'mycontractApp.user.form.lastname.placeholder' | translate}}\" ng-model=user.lastName ng-minlength=1 ng-maxlength=50 required maxlength=50> <div ng-show=\"form.lastName.$dirty && form.lastName.$invalid\"> <p class=help-block ng-show=form.lastName.$error.required translate=settings.messages.validate.lastname.required> Your last name is required. </p> <p class=help-block ng-show=form.lastName.$error.minlength translate=settings.messages.validate.lastname.minlength> Your last name is required to be at least 1 character. </p> <p class=help-block ng-show=form.lastName.$error.maxlength translate=settings.messages.validate.lastname.maxlength> Your last name cannot be longer than 50 characters. </p> </div> </div> <div class=form-group> <label translate=global.form.email>E-mail</label> <input type=email class=form-control name=email placeholder=\"{{'global.form.email.placeholder' | translate}}\" ng-model=user.email ng-minlength=5 ng-maxlength=100 required maxlength=100> <div ng-show=\"form.email.$dirty && form.email.$invalid\"> <p class=help-block ng-show=form.email.$error.required translate=global.messages.validate.email.required> Your e-mail is required. </p> <p class=help-block ng-show=form.email.$error.email translate=global.messages.validate.email.invalid> Your e-mail is invalid. </p> <p class=help-block ng-show=form.email.$error.minlength translate=global.messages.validate.email.minlength> Your e-mail is required to be at least 5 characters. </p> <p class=help-block ng-show=form.email.$error.maxlength translate=global.messages.validate.email.maxlength> Your e-mail cannot be longer than 100 characters. </p> </div> </div> <div class=form-group> <label translate=mycontractApp.user.department>Department</label> <select name=department class=form-control ng-model=data.selectedDept ng-controller=DepartmentController ng-options=\"department as department.name for department in departments\"></select> </div> <div class=form-group> <label translate=mycontractApp.user.language>Language</label> <select name=langKey class=form-control ng-model=user.langKey ng-controller=LanguageController ng-options=\"code as (code | findLanguageFromKey) for code in languages\"></select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form> </div>"
  );


  $templateCache.put('scripts/app/admin/user/users.html',
    "<div> <h2 translate=mycontractApp.user.home.title>Users</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=user.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.user.home.createLabel>Create a new User</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteUserConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.user.delete.question translate-values=\"{id: '{{user.id}}'}\">Are you sure you want to delete this User?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.user.name>Name</th> <th translate=mycontractApp.user.email>Email</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"user in users\"> <td><a ui-sref=user.detail({id:user.id})>{{user.lastName}} {{user.firstName}}</a></td> <td>{{user.email}}</td> <td> <button type=submit ui-sref=user.detail({id:user.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=user.edit({id:user.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(user.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/dashboard/dashboard.html',
    "<div ng-cloak> <div class=row> <div class=\"col-lg-3 col-md-6\"> <div class=\"panel panel-primary\"> <div class=panel-heading> <div class=row> <div class=col-xs-3> <i class=\"fa fa-comments fa-5x\"></i> </div> <div class=\"col-xs-9 text-right\"> <div class=huge>26</div> <div>New Comments!</div> </div> </div> </div> <a href=#> <div class=panel-footer> <span class=pull-left>View Details</span> <span class=pull-right><i class=\"fa fa-arrow-circle-right\"></i></span> <div class=clearfix></div> </div> </a> </div> </div> <div class=\"col-lg-3 col-md-6\"> <div class=\"panel panel-green\"> <div class=panel-heading> <div class=row> <div class=col-xs-3> <i class=\"fa fa-tasks fa-5x\"></i> </div> <div class=\"col-xs-9 text-right\"> <div class=huge>12</div> <div>New Tasks!</div> </div> </div> </div> <a href=#> <div class=panel-footer> <span class=pull-left>View Details</span> <span class=pull-right><i class=\"fa fa-arrow-circle-right\"></i></span> <div class=clearfix></div> </div> </a> </div> </div> <div class=\"col-lg-3 col-md-6\"> <div class=\"panel panel-yellow\"> <div class=panel-heading> <div class=row> <div class=col-xs-3> <i class=\"fa fa-shopping-cart fa-5x\"></i> </div> <div class=\"col-xs-9 text-right\"> <div class=huge>124</div> <div>New Orders!</div> </div> </div> </div> <a href=#> <div class=panel-footer> <span class=pull-left>View Details</span> <span class=pull-right><i class=\"fa fa-arrow-circle-right\"></i></span> <div class=clearfix></div> </div> </a> </div> </div> <div class=\"col-lg-3 col-md-6\"> <div class=\"panel panel-red\"> <div class=panel-heading> <div class=row> <div class=col-xs-3> <i class=\"fa fa-support fa-5x\"></i> </div> <div class=\"col-xs-9 text-right\"> <div class=huge>13</div> <div>Support Tickets!</div> </div> </div> </div> <a href=#> <div class=panel-footer> <span class=pull-left>View Details</span> <span class=pull-right><i class=\"fa fa-arrow-circle-right\"></i></span> <div class=clearfix></div> </div> </a> </div> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/address/address-detail.html',
    "<div> <div class=table-responsive> <table class=table> <tbody> <tr> <td> <span translate=mycontractApp.address.address_line_1>Address_line_1</span> </td> <td> <input class=\"input-sm form-control\" value={{address.address_line_1}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.address.address_line_2>Address_line_2</span> </td> <td> <input class=\"input-sm form-control\" value={{address.address_line_2}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.address.city>City</span> </td> <td> <input class=\"input-sm form-control\" value={{address.city}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.address.province>Province</span> </td> <td> <input class=\"input-sm form-control\" value={{address.province}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.address.country>Country</span> </td> <td> <input class=\"input-sm form-control\" value={{address.country}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.address.postal_code>Postal_code</span> </td> <td> <input class=\"input-sm form-control\" value={{address.postal_code}} readonly> </td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/address/address-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myAddressLabel translate=mycontractApp.address.home.createOrEditLabel>Create or edit a Address</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=address.id readonly> </div> <div class=form-group> <label translate=mycontractApp.address.address_line_1 for=field_address_line_1>Address_line_1</label> <input class=form-control name=address_line_1 id=field_address_line_1 ng-model=address.address_line_1> </div> <div class=form-group> <label translate=mycontractApp.address.address_line_2 for=field_address_line_2>Address_line_2</label> <input class=form-control name=address_line_2 id=field_address_line_2 ng-model=address.address_line_2> </div> <div class=form-group> <label translate=mycontractApp.address.city for=field_city>City</label> <input class=form-control name=city id=field_city ng-model=address.city> <div ng-show=editForm.city.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.address.province for=field_province>Province</label> <input class=form-control name=province id=field_province ng-model=address.province> <div ng-show=editForm.province.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.address.country for=field_country>Country</label> <input class=form-control name=country id=field_country ng-model=address.country> </div> <div class=form-group> <label translate=mycontractApp.address.postal_code for=field_postal_code>Postal_code</label> <input class=form-control name=postal_code id=field_postal_code ng-model=address.postal_code> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/address/addresss.html',
    "<div> <h2 translate=mycontractApp.address.home.title>Addresss</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=address.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.address.home.createLabel>Create a new Address</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteAddressConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(address.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.address.delete.question translate-values=\"{id: '{{address.id}}'}\">Are you sure you want to delete this Address?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=global.field.id>ID</th> <th translate=mycontractApp.address.address_line_1>Address_line_1</th> <th translate=mycontractApp.address.address_line_2>Address_line_2</th> <th translate=mycontractApp.address.city>City</th> <th translate=mycontractApp.address.province>Province</th> <th translate=mycontractApp.address.country>Country</th> <th translate=mycontractApp.address.postal_code>Postal_code</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"address in addresss\"> <td><a ui-sref=address.detail({id:address.id})>{{address.id}}</a></td> <td>{{address.address_line_1}}</td> <td>{{address.address_line_2}}</td> <td>{{address.city}}</td> <td>{{address.province}}</td> <td>{{address.country}}</td> <td>{{address.postal_code}}</td> <td> <button type=submit ui-sref=address.detail({id:address.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=address.edit({id:address.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(address.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> <nav> <ul class=pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/bank_account/bank_account-detail.html',
    "<div> <div class=table-responsive> <table class=\"table table-striped\"> <tbody> <tr> <td> <span translate=mycontractApp.bank_account.bank_name>Bank_name</span> </td> <td> <input class=\"input-sm form-control\" value={{bank_account.bank_name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.bank_account.account_name>Account_name</span> </td> <td> <input class=\"input-sm form-control\" value={{bank_account.account_name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.bank_account.account_number>Account_number</span> </td> <td> <input class=\"input-sm form-control\" value={{bank_account.account_number}} readonly> </td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/bank_account/bank_account-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myBank_accountLabel translate=mycontractApp.bank_account.home.createOrEditLabel>Create or edit a Bank_account</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=bank_account.id readonly> </div> <div class=form-group> <label translate=mycontractApp.bank_account.bank_name for=field_bank_name>Bank_name</label> <input class=form-control name=bank_name id=field_bank_name ng-model=bank_account.bank_name> <div ng-show=editForm.bank_name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.bank_account.account_name for=field_account_name>Account_name</label> <input class=form-control name=account_name id=field_account_name ng-model=bank_account.account_name> <div ng-show=editForm.account_name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.bank_account.account_number for=field_account_number>Account_number</label> <input class=form-control name=account_number id=field_account_number ng-model=bank_account.account_number> <div ng-show=editForm.account_number.$invalid> </div> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/bank_account/bank_accounts.html',
    "<div> <div class=\"modal fade\" id=deleteBank_accountConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(bank_account.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.bank_account.delete.question translate-values=\"{id: '{{bank_account.id}}'}\">Are you sure you want to delete this Bank_account?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive ng-show=\"contract_party.bank_accounts.length > 0\"> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.bank_account.bank_name>Bank_name</th> <th translate=mycontractApp.bank_account.account_name>Account_name</th> <th translate=mycontractApp.bank_account.account_number>Account_number</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"bank_account in bank_accounts\"> <td>{{bank_account.bank_name}}</td> <td>{{bank_account.account_name}}</td> <td>{{bank_account.account_number}}</td> <td> <button type=submit ui-sref=bank_account.edit({id:bank_account.id}) class=\"btn btn-primary btn-sm\"> <span class=\"fa fa-pencil\"></span> </button> <button type=submit ng-click=delete(bank_account.id) class=\"btn btn-danger btn-sm\"> <span class=\"fa fa-trash\"></span> </button> </td> </tr> </tbody> </table> </div> <form name=editForm role=form novalidate ng-submit=saveBank() show-validation ng-show=showNewBankInfo> <table class=table> <tbody> <tr> <td> <label translate=mycontractApp.bank_account.bank_name for=field_bank_name>Bank_name</label> </td> <td> <input class=form-control name=bank_name id=field_bank_name ng-model=bank_account.bank_name required> <div ng-show=editForm.bank_name.$invalid></div> </td> </tr> <tr> <td> <label translate=mycontractApp.bank_account.account_name for=field_account_name>Account_name</label> </td> <td> <input class=form-control name=account_name id=field_account_name ng-model=bank_account.account_name required> <div ng-show=editForm.account_name.$invalid></div> </td> </tr> <tr> <td> <label translate=mycontractApp.bank_account.account_number for=field_account_number>Account_number</label> </td> <td> <input class=form-control name=account_number id=field_account_number ng-model=bank_account.account_number required> <div ng-show=editForm.account_number.$invalid></div> </td> </tr> </tbody> </table> <div> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clearBankInfo()> <span class=\"fa fa-cancel\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"fa fa-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form> <div ng-show=showAddButton> <button type=button ng-click=showNewBank() class=btn> <span class=\"fa fa-plus\"></span>&nbsp;<span translate=entity.action.add> Add</span> </button> </div> </div> <hr>"
  );


  $templateCache.put('scripts/app/entities/category/category-detail.html',
    "<div> <h2><span translate=mycontractApp.category.detail.title>Category</span> {{category.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.category.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{category.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.category.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{category.description}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.category.parent_category>parent_category</span> </td> <td> <input class=\"input-sm form-control\" value={{category.parent_category.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.category.workflow>workflow</span> </td> <td> <a ui-sref=workflow.detail({id:category.workflow.id})> <input class=\"input-sm form-control\" value={{category.workflow.name}} readonly></a> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=category class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/category/category-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myCategoryLabel translate=mycontractApp.category.home.createOrEditLabel>Create or edit a Category</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=category.id readonly> </div> <div class=form-group> <label translate=mycontractApp.category.name for=field_name>Name</label> <input class=form-control name=name id=field_name ng-model=category.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.category.description for=field_description>Description</label> <input class=form-control name=description id=field_description ng-model=category.description> </div> <div class=form-group> <label translate=mycontractApp.category.parent_category for=field_parent_category>parent_category</label> <select class=form-control id=field_parent_category name=parent_category ng-model=category.parent_category.id ng-controller=CategoryController ng-options=\"category.id as category.name for category in categorys\"> </select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/category/categorys.html',
    "<div> <h2 translate=mycontractApp.category.home.title>Categorys</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=category.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.category.home.createLabel>Create a new Category</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteCategoryConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(category.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.category.delete.question translate-values=\"{id: '{{category.id}}'}\">Are you sure you want to delete this Category?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=global.field.id>ID</th> <th translate=mycontractApp.category.name>Name</th> <th translate=mycontractApp.category.description>Description</th> <th translate=mycontractApp.category.parent_category>parent_category</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"category in categories\"> <td><a ui-sref=category.detail({id:category.id})>{{category.id}}</a></td> <td>{{category.name}}</td> <td>{{category.description}}</td> <td>{{category.parent_category.name}}</td> <td> <button type=submit ui-sref=category.detail({id:category.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=category.edit({id:category.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(category.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> <nav> <ul class=pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/contract/contract-detail-activities.html',
    "<div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th>user</th> <th>Action</th> <th>process</th> <th>Datetime</th> </tr> </thead> <tbody> <tr ng-repeat=\"contract_history in contract_histories\"> <td>{{contract_history.user.login}}</td> <td>{{contract_history.action}}</td> <td>{{contract_history.taskProcessName}}</td> <td>{{contract_history.action_datetime}}</td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/contract/contract-detail-attachments.html',
    "contract detail attachment"
  );


  $templateCache.put('scripts/app/entities/contract/contract-detail-info.html',
    "<table class=table> <tbody> <tr ng-if=\"$root.showElement('ADVANCED')\"> <td> <span translate=mycontractApp.contract.review_identifier>Review_identifier</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.reviewIdentifier}} readonly> </td> <td> <span translate=mycontractApp.contract.contract_identifier>Contract_identifier</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.contractIdentifier}} readonly> </td> </tr> <tr ng-if=\"$root.showElement('ADVANCED')\"> <td> <span translate=mycontractApp.contract.contracting_method>ContractingMethod</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.contractingMethod}} readonly> </td> <td> <span translate=mycontractApp.contract.amount_current_year>Amount_current_year</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.amountCurrentYear}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract.start_date>Start_date</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.startDate}} readonly> </td> <td> <span translate=mycontractApp.contract.end_date>End_date</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.endDate}} readonly> </td> </tr> <tr> <td ng-if=\"$root.showElement('ADVANCED')\"> <span translate=mycontractApp.contract.expire_date>Expire_date</span> </td> <td ng-if=\"$root.showElement('ADVANCED')\"> <input class=\"input-sm form-control\" value={{contract.expireDate}} readonly> </td> <td ng-if=\"$root.showElement('ADVANCED')\"> <span translate=mycontractApp.contract.is_multi_year>Is_multi_year</span> </td> <td ng-if=\"$root.showElement('ADVANCED')\"> <input class=\"input-sm form-control\" value={{contract.is_multi_year}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract.approve_date>Approve_date</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.approveDate}} readonly> </td> <td> <span translate=mycontractApp.contract.sign_date>Sign_date</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.signDate}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract.archive_date>Archive_date</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.archiveDate}} readonly> </td> <td> <span translate=mycontractApp.contract.contract_sample>contract_sample</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.contractSample.name}} readonly> </td> </tr> </tbody> </table>"
  );


  $templateCache.put('scripts/app/entities/contract/contract-detail-notes.html',
    "<div> <div class=table-responsive ng-show=\"contract_histories.length > 0\"> <table class=\"table table-striped\"> <thead> <tr> <th>user</th> <th>note</th> <th>AddedDatetime</th> </tr> </thead> <tbody> <tr ng-repeat=\"history in contract_histories\" ng-if=\"history.note != null\"> <td>{{history.user.login}}</td> <td>{{history.note}}</td> <td>{{history.action_datetime}}</td> </tr> </tbody> </table> </div> <div ng-show=showComment> <textarea id=commentArea rows=4 cols=70 ng-model=addedComment name=comment focus-me=true ng-maxlength=255></textarea> </div> <div ng-show=showAddButton> <button type=button ng-click=showCommentArea() class=btn> <span class=\"glyphicon glyphicon-plus-sign\"></span>&nbsp;<span translate=entity.action.add> Add</span> </button> </div> <div ng-show=showCancelSave> <button type=button ng-click=cancelComment() class=btn> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel> Cancel</span> </button> <button type=button ng-click=addComment() class=btn> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save> Save</span> </button> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/contract/contract-detail-projects.html',
    "<table class=table> <tbody> <tr ng-repeat=\"project in contract.projects\"> <td> <span translate=mycontractApp.contract.detail.project.name>Project</span> </td> <td> <a ui-sref=project.detail({id:project.id})> <input class=\"input-sm form-control\" value={{project.name}} readonly></a> </td> <td> <span translate=mycontractApp.contract.detail.project.manager>Manager</span> </td> <td> <input class=\"input-sm form-control\" value={{project.manager}} readonly> </td> </tr> </tbody> </table>"
  );


  $templateCache.put('scripts/app/entities/contract/contract-detail.html',
    "<div> <h2><span translate=mycontractApp.contract.detail.title>Contract</span> {{contract.id}} ---- {{contract.status}}</h2> <div class=\"panel panel-default\" ng-show=\"contract.status != 'Archived'\"> <div class=panel-body> <div class=row> <div class=col-md-1> <div ng-switch=\"contract.status == 'Drafting'\"> <div ng-switch-when=true> <button type=submit ui-sref=contract.edit({id:contract.id}) class=\"btn btn-info\"> <span>Edit</span> </button> </div> </div> </div> <div class=col-md-1> <button type=submit ui-sref=contract class=\"btn btn-info\"> <span>Assign</span> </button> </div> <div class=col-md-2> <button type=submit ui-sref=contract class=\"btn btn-info\"> <span>Comment</span> </button> </div> <div class=col-md-5> <div ng-switch=\"contract.status == 'Drafting'\"> <div ng-switch-when=true> <button type=submit ng-click=submitToNextProcess() class=\"btn btn-success\"> <span>Complete and submit to: {{contract.nextTask.processName}}</span> </button> </div> <div ng-switch-when=false> <button type=submit ng-click=approveContractRequest() class=\"btn btn-success\" ng-show=contract.approvable> <span>Approve</span> </button> <button type=submit ng-click=rejectContractRequest() class=\"btn btn-danger\" ng-show=contract.rejectable> <span>Reject</span> </button> <button type=submit ng-click=submitToNextProcess() class=\"btn btn-success\" ng-show=\"!contract.rejectable && contract.nextTask\"> <span>Complete and submit to: {{contract.nextTask.processName}}</span> </button> <button type=submit ng-click=submitToNextProcess() class=\"btn btn-success\" ng-show=\"!contract.nextTask && contract.status != 'Archived'\"> <span>Archive</span> </button> </div> </div> </div> </div> </div> </div> <div class=\"modal fade\" id=submitToNextProcess_Confirmation> <div class=modal-dialog> <div class=modal-content> <form name=submitToNextProcessForm ng-submit=confirmToNextProcess()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=mycontractApp.contract.submitToNextProcess.title>Submit to next process</h4> </div> <div class=modal-body> <p translate=mycontractApp.contract.submitToNextProcess.question translate-values=\"{nextProcess: '{{contract.nextTask.processName}}'}\">Are you sure you want to submit to next process?</p> <label>Please enter your note</label> <textarea id=commentArea rows=4 cols=70 required ng-model=note name=comment focus-me=true ng-maxlength=255></textarea> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=submitToNextProcessForm.$invalid class=\"btn btn-success\"> <span class=\"glyphicon glyphicon-ok-circle\"></span>&nbsp;<span translate=entity.action.ok>OK</span> </button> </div> </form> </div> </div> </div> <div class=\"modal fade\" id=rejectRequest_Confirmation> <div class=modal-dialog> <div class=modal-content> <form name=rejectProcessForm ng-submit=confirmToReject()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=mycontractApp.contract.rejectProcess.title>Reject the current contract</h4> </div> <div class=modal-body> <p translate=mycontractApp.contract.rejectProcess.question>Are you sure you want to send back to draft?</p> <label>Please enter your note</label> <textarea id=rejectNote rows=4 cols=70 required ng-model=note name=comment focus-me=true ng-maxlength=255></textarea> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=rejectProcessForm.$invalid class=\"btn btn-success\"> <span class=\"glyphicon glyphicon-ok-circle\"></span>&nbsp;<span translate=entity.action.ok>OK</span> </button> </div> </form> </div> </div> </div> <div class=\"modal fade\" id=approveRequest_Confirmation> <div class=modal-dialog> <div class=modal-content> <form name=approveProcessForm ng-submit=confirmToApprove()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=mycontractApp.contract.approveProcess.title>Approve the current contract</h4> </div> <div class=modal-body> <p translate=mycontractApp.contract.approveProcess.question>Are you sure you want to approve current request?</p> <label>Please enter your note</label> <textarea id=approveNote rows=4 cols=70 required ng-model=note name=comment focus-me=true ng-maxlength=255></textarea> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=approveProcessForm.$invalid class=\"btn btn-success\"> <span class=\"glyphicon glyphicon-ok-circle\"></span>&nbsp;<span translate=entity.action.ok>OK</span> </button> </div> </form> </div> </div> </div> <div class=row> <div class=col-md-9> <div class=table-responsive> <table class=table> <tbody style=\"display:block; overflow: auto\"> <tr> <td> <span translate=mycontractApp.contract.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.description}}> </td> </tr> <tr ng-if=\"$root.showElement('STANDARD,ADVANCED')\"> <td> <span translate=mycontractApp.contract.category>category</span> </td> <td><a ui-sref=category.detail({id:contract.category.id})> <input class=\"input-sm form-control\" value={{contract.category.name}} readonly></a> </td> </tr> <tr> <td> <span translate=mycontractApp.contract.contract_party>Contract Party</span> </td> <td><a ui-sref=contract_party.detail({id:contract.contractParty.id})> <input class=\"input-sm form-control\" value={{contract.contractParty.name}} readonly></a> </td> <!--\n" +
    "                    <td>\n" +
    "                        <span translate=\"mycontractApp.contract.status\">Status</span>\n" +
    "                    </td>\n" +
    "                    <td>\n" +
    "                        <input type=\"text\" class=\"input-sm form-control\" value=\"{{contract.status}}\" readonly>\n" +
    "                    </td>--> </tr> <tr> <td> <span translate=mycontractApp.contract.amount>Amount</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.amount}} readonly> </td> <td ng-if=\"$root.showElement('ADVANCED')\"> <span translate=mycontractApp.contract.currency>Currency</span> </td> <td ng-if=\"$root.showElement('ADVANCED')\"> <input class=\"input-sm form-control\" value={{contract.currency}} readonly> </td> </tr> <tr ng-if=\"$root.showElement('ADVANCED')\"> <td> <span translate=mycontractApp.contract.amount_written>Amount_written</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.amountWritten}} readonly> </td> <td> <span translate=mycontractApp.contract.fund_source>fund_source</span> </td> <td> <input class=\"input-sm form-control\" value={{contract.fundSource.name}} readonly> </td> </tr> </tbody> </table> </div> <hr> <div id=content> <ul class=\"nav nav-tabs\" id=myTab> <li class=active><a data-target=#info data-toggle=tab>Detail Info</a></li> <li ng-if=\"$root.showElement('STANDARD,ADVANCED')\"><a data-target=#project data-toggle=tab>Project Info</a></li> <li><a data-target=#notes data-toggle=tab>Notes</a></li> <li><a data-target=#activities data-toggle=tab>Activities</a></li> <li><a data-target=#attachments data-toggle=tab>Attachments</a></li> </ul> <div class=tab-content> <div class=\"tab-pane active\" id=info><div ui-view=info></div></div> <div class=tab-pane id=project ng-if=\"$root.showElement('STANDARD,ADVANCED')\"><div ui-view=project></div></div> <div class=tab-pane id=notes><div ui-view=notes></div></div> <div class=tab-pane id=activities><div ui-view=activities></div></div> <div class=tab-pane id=attachments><div ui-view=attachments></div></div> </div> </div> </div> <div class=col-md-3> <div style=\"height:400px; overflow:auto\"> <table> <thead> <tr> <th>People</th> </tr> </thead> <tbody> <tr><td><h5>Administrator</h5></td></tr> <tr><td>{{contract.administrator.lastName}} {{contract.administrator.firstName}}</td></tr> <tr><td><h5>Author</h5></td></tr> <tr><td>{{contract.author.lastName}} {{contract.author.firstName}}</td></tr> <tr><td><h5>Assignee</h5></td></tr> <tr><td>{{contract.assignee.lastName}} {{contract.assignee.firstName}}</td></tr> <tr><td><h5>Administrative Department</h5></td></tr> <tr><td>{{contract.administrativeDepartment.name}}</td></tr> <tr><td><h5>Related Department</h5></td></tr> <tr ng-repeat=\"dept in contract.relatedDepartments\"><td>{{dept.name}}</td></tr> </tbody> </table> </div> <div style=\"height:200px; overflow:auto\"> <table> <thead> <tr> <th>Date</th> </tr> </thead> <tbody> <tr><td><h5>date created</h5></td></tr> <tr><td>{{contract.createdDate}}</td></tr> <tr><td><h5>last modified</h5></td></tr> <tr><td>{{contract.modifiedDate}}</td></tr> </tbody> </table> </div> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/contract/contract-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myContractLabel translate=mycontractApp.contract.home.createLabel>Create a Contract</h4> </div> <div class=modal-body> <div class=table-responsive> <table class=table> <tbody style=\"display:block; overflow: auto; height: 500px\"> <tr> <td class=col-sm-1><label translate=mycontractApp.contract.name for=field_name>Name</label></td> <td class=col-sm-12> <input class=form-control name=name id=field_name required ng-model=contract.name> <div ng-show=\"editForm.name.$dirty && editForm.name.$invalid\"> <p class=help-block ng-show=editForm.name.$error.required translate=mycontractApp.contract.messages.validate.namerequired> Contract name is required. </p> </div> </td> </tr> <tr> <td><label translate=mycontractApp.contract.description for=desc>Description</label></td> <td><input class=form-control name=desc id=desc ng-model=contract.description></td> </tr> <tr ng-if=\"$root.showElement('STANDARD,ADVANCED')\"> <td><label translate=mycontractApp.contract.category for=category>Category</label></td> <td><select name=category id=category class=form-control ng-model=contract.category ng-change=categorySelected() ng-controller=CategoryController ng-options=\"category as category.name for category in categories\"> <option value=\"\">Select A Category</option> </select></td> </tr> <tr ng-if=\"$root.showElement('STANDARD,ADVANCED')\"> <td><label translate=mycontractApp.contract.project for=project>Project</label></td> <td><select name=project id=project class=form-control ng-model=addedProject ng-change=addProject(addedProject) ng-controller=ProjectController ng-options=\"project as project.name for project in projects\"> <option value=\"\">Select A Project</option> </select></td> </tr> <tr> <td><label translate=mycontractApp.contract.contract_party for=contractParty>contract party</label></td> <td><select name=contractParty id=contractParty class=form-control required ng-model=contract.contractParty ng-controller=Contract_partyController ng-options=\"party as party.name for party in contract_parties\"> <option value=\"\">Select A Contract Party</option> </select></td> </tr> <tr ng-if=\"$root.showElement('ADVANCED')\" ng-show=\"nextProcesses.length > 1\"> <td><label>Select next step </label></td> <td><select name=nextStep id=selectedStep class=form-control ng-model=contract.firstReviewProcess ng-options=\"process as process.name for process in nextProcesses\"> <option value=\"\">Select Next Step</option> </select></td> </tr> <tr ng-if=\"$root.showElement('ADVANCED')\"> <td class=col-sm-6> <div style=\"display: table-cell\"> <label>Need Related Divisions Review </label> <input type=checkbox name=hasRelatedIntervalDivs id=hasRelatedIntervalDivs ng-model=hasRelatedIntervalDivs> </div></td> <td class=col-sm-6> <div ng-switch=hasRelatedIntervalDivs> <div ng-switch-when=true> <table> <tr ng-repeat=\"dept in addedRelatedInternvalDivisions track by dept.id\"> <td> <input class=input-sm value={{dept.name}} readonly> </td> <td> <button type=button ng-click=removeInternalDivs(dept) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-trash\"></span> </button> </td> </tr> </table> <select name=relatedDiv id=addedDiv class=form-control ng-model=addedDiv ng-change=addDivs(addedDiv) ng-controller=DepartmentController ng-options=\"dept as dept.name for dept in internalDivisions\"> <option value=\"\">Select A Division</option> </select> </div> </div> </td> </tr> <tr ng-if=\"$root.showElement('ADVANCED')\"> <td><label translate=mycontractApp.contract.contracting_method for=field_contracting_method>ContractingMethod</label></td> <td><select class=form-control name=contracting_method ng-model=contract.contractingMethod id=field_contracting_method> <option value=Bid>Bid</option> <option value=Proposal>Proposal</option> <option value=Exemption>Exemption</option> <option value=Other>Other</option> </select></td> </tr> <tr> <td><label translate=mycontractApp.contract.amount for=field_amount>Amount</label></td> <td><input type=number class=form-control name=amount id=field_amount required ng-model=contract.amount></td> </tr> <tr ng-if=\"$root.showElement('ADVANCED')\"> <td><label translate=mycontractApp.contract.currency for=field_currency>Currency</label></td> <td><select class=form-control name=currency ng-model=contract.currency id=field_currency> <option value=ChineseYuan>ChineseYuan</option> <option value=USDollar>USDollar</option> <option value=JapaneseYen>JapaneseYen</option> <option value=HKDollar>HKDollar</option> <option value=EURO>EURO</option> <option value=UKPound>UKPound</option> </select></td> </tr> <tr ng-if=\"$root.showElement('ADVANCED')\"> <td><label translate=mycontractApp.contract.amount_written for=field_amount_written>Amount_written</label></td> <td><input class=form-control name=amountWritten id=field_amount_written ng-model=contract.amountWritten></td> </tr> <tr ng-if=\"$root.showElement('ADVANCED')\"> <td><label translate=mycontractApp.contract.fund_source for=field_fund_source>fund_source</label></td> <td><select class=form-control id=field_fund_source name=fundSource ng-model=contract.fundSource.id ng-options=\"fund_source.id as fund_source.name for fund_source in fund_sources\"> </select></td> </tr> <tr ng-if=\"$root.showElement('ADVANCED')\"> <td><label translate=mycontractApp.contract.amount_current_year for=field_amount_current_year>Amount_current_year</label></td> <td><input type=number class=form-control name=amountCurrentYear id=field_amount_current_year ng-model=contract.amountCurrentYear></td> </tr> <tr> <td><label translate=mycontractApp.contract.start_date for=field_start_date>Start_date</label></td> <td><input type=date class=form-control name=startDate id=field_start_date required ng-model=contract.startDate ng-model-options=\"{timezone: 'UTC'}\"></td> </tr> <tr> <td><label translate=mycontractApp.contract.end_date for=field_end_date>End_date</label></td> <td><input type=date class=form-control name=endDate id=field_end_date required ng-model=contract.endDate ng-model-options=\"{timezone: 'UTC'}\"></td> </tr> <tr ng-if=\"$root.showElement('ADVANCED')\"> <td><label translate=mycontractApp.contract.expire_date for=field_expire_date>Expire_date</label></td> <td><input type=date class=form-control name=expireDate id=field_expire_date ng-model=contract.expireDate ng-model-options=\"{timezone: 'UTC'}\"></td> </tr><tr ng-if=\"$root.showElement('ADVANCED')\"> <td><label translate=mycontractApp.contract.is_multi_year for=field_is_multi_year>Is_multi_year</label></td> <td><input type=checkbox class=form-control name=isMultiYear id=field_is_multi_year ng-model=contract.isMultiYear></td> </tr> <tr ng-if=\"$root.showElement('STANDARD,ADVANCED')\"> <td><label translate=mycontractApp.contract.contract_sample for=field_contract_sample>contract_sample</label></td> <td><select class=form-control id=field_contract_sample name=contractSample ng-model=contract.contractSample.id ng-options=\"contract_sample.id as contract_sample.name for contract_sample in contract_samples\"> </select></td> </tr> </tbody> </table> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </div></form>"
  );


  $templateCache.put('scripts/app/entities/contract/contract-dialog_origin.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myContractLabel translate=mycontractApp.contract.home.createOrEditLabel>Create or edit a Contract</h4> </div> <div class=modal-body> <div class=form-group> <label translate=mycontractApp.contract.name for=field_name>Name</label> <input class=form-control name=name id=field_name ng-model=contract.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.contract.review_identifier for=field_review_identifier>Review_identifier</label> <input class=form-control name=review_identifier id=field_review_identifier ng-model=contract.review_identifier> </div> <div class=form-group> <label translate=mycontractApp.contract.contract_identifier for=field_contract_identifier>Contract_identifier</label> <input class=form-control name=contract_identifier id=field_contract_identifier ng-model=contract.contract_identifier> </div> <div class=form-group> <label translate=mycontractApp.contract.contracting_method for=field_contracting_method>ContractingMethod</label> <select class=form-control name=contracting_method ng-model=contract.contracting_method id=field_contracting_method> <option value=Bid>Bid</option> <option value=Proposal>Proposal</option> <option value=Exemption>Exemption</option> <option value=Other>Other</option> </select> </div> <div class=form-group> <label translate=mycontractApp.contract.amount for=field_amount>Amount</label> <input type=number class=form-control name=amount id=field_amount ng-model=contract.amount> </div> <div class=form-group> <label translate=mycontractApp.contract.amount_written for=field_amount_written>Amount_written</label> <input class=form-control name=amount_written id=field_amount_written ng-model=contract.amount_written> </div> <div class=form-group> <label translate=mycontractApp.contract.currency for=field_currency>Currency</label> <select class=form-control name=currency ng-model=contract.currency id=field_currency> <option value=ChineseYuan>ChineseYuan</option> <option value=USDollar>USDollar</option> <option value=JapaneseYen>JapaneseYen</option> <option value=HKDollar>HKDollar</option> <option value=EURO>EURO</option> <option value=UKPound>UKPound</option> </select> </div> <div class=form-group> <label translate=mycontractApp.contract.amount_current_year for=field_amount_current_year>Amount_current_year</label> <input type=number class=form-control name=amount_current_year id=field_amount_current_year ng-model=contract.amount_current_year> </div> <div class=form-group> <label translate=mycontractApp.contract.submit_date for=field_submit_date>Submit_date</label> <input type=datetime-local class=form-control name=submit_date id=field_submit_date ng-model=contract.submit_date ng-model-options=\"{timezone: 'UTC'}\"> </div> <div class=form-group> <label translate=mycontractApp.contract.start_date for=field_start_date>Start_date</label> <input type=datetime-local class=form-control name=start_date id=field_start_date ng-model=contract.start_date ng-model-options=\"{timezone: 'UTC'}\"> </div> <div class=form-group> <label translate=mycontractApp.contract.end_date for=field_end_date>End_date</label> <input type=datetime-local class=form-control name=end_date id=field_end_date ng-model=contract.end_date ng-model-options=\"{timezone: 'UTC'}\"> </div> <div class=form-group> <label translate=mycontractApp.contract.expire_date for=field_expire_date>Expire_date</label> <input type=datetime-local class=form-control name=expire_date id=field_expire_date ng-model=contract.expire_date ng-model-options=\"{timezone: 'UTC'}\"> </div> <div class=form-group> <label translate=mycontractApp.contract.is_multi_year for=field_is_multi_year>Is_multi_year</label> <input type=checkbox class=form-control name=is_multi_year id=field_is_multi_year ng-model=contract.is_multi_year> </div> <div class=form-group> <label translate=mycontractApp.contract.status for=field_status>Status</label> <select class=form-control name=status ng-model=contract.status id=field_status> <option value=drafting>drafting</option> <option value=reviewing>reviewing</option> <option value=approved>approved</option> <option value=signed>signed</option> <option value=archived>archived</option> </select> </div> <div class=form-group> <label translate=mycontractApp.contract.state for=field_state>State</label> <select class=form-control name=state ng-model=contract.state id=field_state> <option value=drafting>drafting</option> <option value=internal_division_review>internal_division_review</option> <option value=related_division_review>related_division_review</option> <option value=internal_department_review>internal_department_review</option> <option value=related_department_review>related_department_review</option> <option value=finance_department_review>finance_department_review</option> <option value=legal_department_review>legal_department_review</option> <option value=executive_review>executive_review</option> <option value=contract_manager_review>contract_manager_review</option> <option value=contract_sign>contract_sign</option> <option value=contract_archive>contract_archive</option> </select> </div> <div class=form-group> <label translate=mycontractApp.contract.approve_date for=field_approve_date>Approve_date</label> <input type=datetime-local class=form-control name=approve_date id=field_approve_date ng-model=contract.approve_date ng-model-options=\"{timezone: 'UTC'}\"> </div> <div class=form-group> <label translate=mycontractApp.contract.sign_date for=field_sign_date>Sign_date</label> <input type=datetime-local class=form-control name=sign_date id=field_sign_date ng-model=contract.sign_date ng-model-options=\"{timezone: 'UTC'}\"> </div> <div class=form-group> <label translate=mycontractApp.contract.archive_date for=field_archive_date>Archive_date</label> <input type=datetime-local class=form-control name=archive_date id=field_archive_date ng-model=contract.archive_date ng-model-options=\"{timezone: 'UTC'}\"> </div> <div class=form-group> <label translate=mycontractApp.contract.executing_department for=field_executing_department>executing_department</label> <select class=form-control id=field_executing_department name=executing_department ng-model=contract.executing_department.id ng-options=\"department.id as department.name for department in departments\"> </select> </div> <div class=form-group> <label translate=mycontractApp.contract.category for=field_category>category</label> <select class=form-control id=field_category name=category ng-model=contract.category.id ng-options=\"category.id as category.name for category in categorys\"> </select> </div> <div class=form-group> <label translate=mycontractApp.contract.fund_source for=field_fund_source>fund_source</label> <select class=form-control id=field_fund_source name=fund_source ng-model=contract.fund_source.id ng-options=\"fund_source.id as fund_source.name for fund_source in fund_sources\"> </select> </div> <div class=form-group> <label translate=mycontractApp.contract.contract_sample for=field_contract_sample>contract_sample</label> <select class=form-control id=field_contract_sample name=contract_sample ng-model=contract.contract_sample.id ng-options=\"contract_sample.id as contract_sample.name for contract_sample in contract_samples\"> </select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/contract/contract-search.html',
    "<form name=editForm role=form novalidate ng-submit=search() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <label>Search contract</label> </div> <div class=modal-body> <div class=table-responsive> <table class=table> <tbody style=\"display:block; overflow: auto; height: 500px\"> <tr> <td><label>Name like</label></td> <td> <input class=form-control name=name id=field_name ng-model=searchText.name> </td> <td><label translate=mycontractApp.contract.contract_party for=contractParty>contract party</label></td> <td><select name=contractParty id=contractParty class=form-control ng-model=searchText.contractParty ng-controller=Contract_partyController ng-options=\"party as party.name for party in contract_parties\"> <option value=\"\">Select A Contract Party</option> </select></td> </tr> <tr ng-if=\"$root.showElement('STANDARD,ADVANCED')\"> <td><label translate=mycontractApp.contract.project for=project>Project</label></td> <td><select name=project id=project class=form-control ng-model=searchText.project ng-controller=ProjectController ng-options=\"project as project.name for project in projects\"> <option value=\"\">Select A Project</option> </select></td> <td><label translate=mycontractApp.contract.category for=category>Category</label></td> <td><select name=category id=category class=form-control ng-model=searchText.category ng-change=categorySelected() ng-controller=CategoryController ng-options=\"category as category.name for category in categories\"> <option value=\"\">Select A Category</option> </select></td> </tr> <tr> <td><label>Amount between</label></td> <td class=col-sm-2><input type=number class=form-control name=amount id=field_amount_1 ng-model=searchText.amount1></td> <td class=col-sm-2><label>and</label></td> <td class=col-sm-2><input type=number class=form-control name=amount id=field_amount_2 ng-model=searchText.amount2></td> </tr> <tr> <td><label>Sign date between</label></td> <td><input type=date class=form-control name=signDate1 id=field_sign_date_1 ng-model=searchText.signDate1></td> <td><label>and </label></td> <td><input type=date class=form-control name=signDate2 id=field_sign_date_2 ng-model=searchText.signDate2></td> </tr> </tbody> </table> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.submit>Submit</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/contract/contracts-statistics.html',
    "<div> <h2 translate=mycontractApp.contract.statistics.title>Contracts Statistics</h2> <div class=table-responsive> <label>Contract amount by month</label> <canvas id=myBarChart width=400 height=200></canvas> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/contract/contracts.html',
    "<div> <h2 translate=mycontractApp.contract.home.title>Contracts</h2> <!--\n" +
    "    <div class=\"container\">\n" +
    "        <div class=\"row\">\n" +
    "            <div class=\"col-md-4\">\n" +
    "                <button class=\"btn btn-primary\" ui-sref=\"contract.new\">\n" +
    "                    <span class=\"glyphicon glyphicon-flash\"></span> <span translate=\"mycontractApp.contract.home.createLabel\">Create a new Contract</span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "--> <div class=\"modal fade\" id=deleteContractConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(contract.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.contract.delete.question translate-values=\"{id: '{{contract.id}}'}\">Are you sure you want to delete this Contract?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.contract.name>Name</th> <th translate=mycontractApp.contract.amount>Amount</th> <th translate=mycontractApp.contract.created_date>Created_date</th> <th translate=mycontractApp.contract.status>Status</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"contract in contracts\"> <td><a ui-sref=contract.detail({id:contract.id})>{{contract.name}}</a></td> <td>{{contract.amount}}</td> <td>{{contract.createdDate}}</td> <td>{{contract.status}}</td> <!--\n" +
    "                    <td>\n" +
    "                        <button type=\"submit\"\n" +
    "                                ui-sref=\"contract.edit({id:contract.id})\"\n" +
    "                                class=\"btn btn-primary btn-sm\">\n" +
    "                            <span class=\"glyphicon glyphicon-pencil\"></span>\n" +
    "                        </button>\n" +
    "                        <button type=\"submit\"\n" +
    "                                ng-click=\"delete(contract.id)\"\n" +
    "                                class=\"btn btn-danger btn-sm\">\n" +
    "                            <span class=\"glyphicon glyphicon-trash\"></span>\n" +
    "                        </button>\n" +
    "                    </td>\n" +
    "                    --> </tr> </tbody> </table> <nav> <ul class=pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/contract_history/contract_history-detail.html',
    "<div> <h2><span translate=mycontractApp.contract_history.detail.title>Contract_history</span> {{contract_history.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.contract_history.note>Note</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_history.note}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_history.action>Action</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_history.action}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_history.action_datetime>Action_datetime</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_history.action_datetime}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_history.contract>contract</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_history.contractId}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_history.user>user</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_history.userId}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_history.process>process</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_history.processId}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=contract_history class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/contract_history/contract_history-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myContract_historyLabel translate=mycontractApp.contract_history.home.createOrEditLabel>Create or edit a Contract_history</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=contract_history.id readonly> </div> <div class=form-group> <label translate=mycontractApp.contract_history.note for=field_note>Note</label> <input class=form-control name=note id=field_note ng-model=contract_history.note> </div> <div class=form-group> <label translate=mycontractApp.contract_history.action for=field_action>Action</label> <select class=form-control name=action ng-model=contract_history.action id=field_action> <option value=APPROVE>APPROVE</option> <option value=REJECT>REJECT</option> <option value=COMMENT>COMMENT</option> <option value=CREATE>CREATE</option> <option value=DELETE>DELETE</option> <option value=ADD>ADD</option> <option value=SIGN>SIGN</option> <option value=ARCHIVE>ARCHIVE</option> <option value=MODIFY>MODIFY</option> </select> </div> <div class=form-group> <label translate=mycontractApp.contract_history.action_datetime for=field_action_datetime>Action_datetime</label> <input type=datetime-local class=form-control name=action_datetime id=field_action_datetime ng-model=contract_history.action_datetime ng-model-options=\"{timezone: 'UTC'}\"> </div> <div class=form-group> <label translate=mycontractApp.contract_history.contract for=field_contract>contract</label> <select class=form-control id=field_contract name=contract ng-model=contract_history.contract.id ng-options=\"contract.id as contract.id for contract in contracts\"> </select> </div> <div class=form-group> <label translate=mycontractApp.contract_history.user for=field_user>user</label> <select class=form-control id=field_user name=user ng-model=contract_history.user.id ng-options=\"user.id as user.id for user in users\"> </select> </div> <div class=form-group> <label translate=mycontractApp.contract_history.process for=field_process>process</label> <select class=form-control id=field_process name=process ng-model=contract_history.process.id ng-options=\"process.id as process.id for process in processs\"> </select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/contract_history/contract_historys.html',
    "<div> <h2 translate=mycontractApp.contract_history.home.title>Contract_historys</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=contract_history.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.contract_history.home.createLabel>Create a new Contract_history</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteContract_historyConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(contract_history.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.contract_history.delete.question translate-values=\"{id: '{{contract_history.id}}'}\">Are you sure you want to delete this Contract_history?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=global.field.id>ID</th> <th translate=mycontractApp.contract_history.note>Note</th> <th translate=mycontractApp.contract_history.action>Action</th> <th translate=mycontractApp.contract_history.action_datetime>Action_datetime</th> <th translate=mycontractApp.contract_history.contract>contract</th> <th translate=mycontractApp.contract_history.user>user</th> <th translate=mycontractApp.contract_history.process>process</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"contract_history in contract_histories\"> <td><a ui-sref=contract_history.detail({id:contract_history.id})>{{contract_history.id}}</a></td> <td>{{contract_history.note}}</td> <td>{{contract_history.action}}</td> <td>{{contract_history.action_datetime}}</td> <td>{{contract_history.contractId}}</td> <td>{{contract_history.userId}}</td> <td>{{contract_history.processId}}</td> <td> <button type=submit ui-sref=contract_history.detail({id:contract_history.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=contract_history.edit({id:contract_history.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(contract_history.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> <nav> <ul class=pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/contract_party/contract_parties.html',
    "<div> <h2 translate=mycontractApp.contract_party.home.title>Contract Parties</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=contract_party.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.contract_party.home.createLabel>Create a new Contract_party</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteContract_partyConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(contract_party.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.contract_party.delete.question translate-values=\"{id: '{{contract_party.id}}'}\">Are you sure you want to delete this Contract_party?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.contract_party.name>Name</th> <th translate=mycontractApp.contract_party.registration_id>Registration_id</th> <th translate=mycontractApp.contract_party.legal_representative>Legal_representative</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"contract_party in contract_parties\"> <td><a ui-sref=contract_party.detail({id:contract_party.id})>{{contract_party.name}}</a></td> <td>{{contract_party.registration_id}}</td> <td>{{contract_party.legal_representative}}</td> <td> <button type=submit ui-sref=contract_party.edit({id:contract_party.id}) class=\"btn btn-primary btn-sm\"> <span class=\"fa fa-pencil\"></span> </button> <button type=submit ng-click=delete(contract_party.id) class=\"btn btn-danger btn-sm\"> <span class=\"fa fa-trash\"></span> </button> </td> </tr> </tbody> </table> <nav> <ul class=pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/contract_party/contract_party-detail.html',
    "<div> <h2><span translate=mycontractApp.contract_party.detail.title>Contract_party</span> {{contract_party.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.contract_party.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_party.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_party.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_party.description}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_party.registration_id>Registration_id</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_party.registration_id}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_party.registered_capital>Registered_capital</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_party.registered_capital}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_party.legal_representative>Legal_representative</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_party.legal_representative}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_party.registration_inspection_record>Registration_inspection_record</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_party.registration_inspection_record}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_party.professional_certificate>Professional_certificate</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_party.professional_certificate}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_party.business_certificate>Business_certificate</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_party.business_certificate}} readonly> </td> </tr> </tbody> </table> </div> <div id=content> <ul class=\"nav nav-tabs\" id=myTab> <li class=active><a data-target=#address data-toggle=tab>Address</a></li> <li><a data-target=#bank data-toggle=tab>Bank Information</a></li> <li><a data-target=#contracts data-toggle=tab>Contracts</a></li> </ul> <div class=tab-content> <div class=\"tab-pane active\" id=address><div ui-view=address></div></div> <div class=tab-pane id=bank><div ui-view=bank></div></div> <div class=tab-pane id=contracts><div ui-view=contracts></div></div> </div> </div> <button type=submit ui-sref=contract_party class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/contract_party/contract_party-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myContract_partyLabel translate=mycontractApp.contract_party.home.createOrEditLabel>Create or edit a Contract_party</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=contract_party.id readonly> </div> <div class=form-group> <label translate=mycontractApp.contract_party.name for=field_name>Name</label> <input class=form-control name=name id=field_name ng-model=contract_party.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.contract_party.description for=field_description>Description</label> <input class=form-control name=description id=field_description ng-model=contract_party.description> </div> <div class=form-group> <label translate=mycontractApp.contract_party.registration_id for=field_registration_id>Registration_id</label> <input class=form-control name=registration_id id=field_registration_id ng-model=contract_party.registration_id> <div ng-show=editForm.registration_id.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.contract_party.registered_capital for=field_registered_capital>Registered_capital</label> <input type=number class=form-control name=registered_capital id=field_registered_capital ng-model=contract_party.registered_capital> </div> <div class=form-group> <label translate=mycontractApp.contract_party.legal_representative for=field_legal_representative>Legal_representative</label> <input class=form-control name=legal_representative id=field_legal_representative ng-model=contract_party.legal_representative> </div> <div class=form-group> <label translate=mycontractApp.contract_party.registration_inspection_record for=field_registration_inspection_record>Registration_inspection_record</label> <input class=form-control name=registration_inspection_record id=field_registration_inspection_record ng-model=contract_party.registration_inspection_record> </div> <div class=form-group> <label translate=mycontractApp.contract_party.professional_certificate for=field_professional_certificate>Professional_certificate</label> <input class=form-control name=professional_certificate id=field_professional_certificate ng-model=contract_party.professional_certificate> </div> <div class=form-group> <label translate=mycontractApp.contract_party.business_certificate for=field_business_certificate>Business_certificate</label> <input class=form-control name=business_certificate id=field_business_certificate ng-model=contract_party.business_certificate> </div> <div class=form-group> <label translate=mycontractApp.contract_party.address for=field_address>address</label> <select class=form-control id=field_address name=address ng-model=contract_party.address.id ng-options=\"address.id as address.id for address in addresss\"> </select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/contract_process/contract_process-detail.html',
    "<div> <h2><span translate=mycontractApp.contract_process.detail.title>Contract_process</span> {{contract_process.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.contract_process.sequence>Sequence</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_process.sequence}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_process.process>process</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_process.process.id}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_process.department>department</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_process.department.id}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_process.user>user</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_process.user.id}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=contract_process class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/contract_process/contract_process-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myContract_processLabel translate=mycontractApp.contract_process.home.createOrEditLabel>Create or edit a Contract_process</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=contract_process.id readonly> </div> <div class=form-group> <label translate=mycontractApp.contract_process.sequence for=field_sequence>Sequence</label> <input type=number class=form-control name=sequence id=field_sequence ng-model=contract_process.sequence> </div> <div class=form-group> <label translate=mycontractApp.contract_process.process for=field_process>process</label> <select class=form-control id=field_process name=process ng-model=contract_process.process.id ng-options=\"process.id as process.id for process in processs\"> </select> </div> <div class=form-group> <label translate=mycontractApp.contract_process.department for=field_department>department</label> <select class=form-control id=field_department name=department ng-model=contract_process.department.id ng-options=\"department.id as department.id for department in departments\"> </select> </div> <div class=form-group> <label translate=mycontractApp.contract_process.user for=field_user>user</label> <select class=form-control id=field_user name=user ng-model=contract_process.user.id ng-options=\"user.id as user.id for user in users\"> </select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/contract_process/contract_processs.html',
    "<div> <h2 translate=mycontractApp.contract_process.home.title>Contract_processs</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=contract_process.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.contract_process.home.createLabel>Create a new Contract_process</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteContract_processConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(contract_process.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.contract_process.delete.question translate-values=\"{id: '{{contract_process.id}}'}\">Are you sure you want to delete this Contract_process?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=global.field.id>ID</th> <th translate=mycontractApp.contract_process.sequence>Sequence</th> <th translate=mycontractApp.contract_process.process>process</th> <th translate=mycontractApp.contract_process.department>department</th> <th translate=mycontractApp.contract_process.user>user</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"contract_process in contract_processs\"> <td><a ui-sref=contract_process.detail({id:contract_process.id})>{{contract_process.id}}</a></td> <td>{{contract_process.sequence}}</td> <td>{{contract_process.process.id}}</td> <td>{{contract_process.department.id}}</td> <td>{{contract_process.user.id}}</td> <td> <button type=submit ui-sref=contract_process.detail({id:contract_process.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=contract_process.edit({id:contract_process.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(contract_process.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/contract_sample/contract_sample-detail.html',
    "<div> <h2><span translate=mycontractApp.contract_sample.detail.title>Contract_sample</span> {{contract_sample.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.contract_sample.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_sample.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_sample.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_sample.description}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_sample.path>Path</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_sample.path}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_sample.file_name>File_name</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_sample.file_name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_sample.uploaded_by>Uploaded_by</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_sample.uploaded_by}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_sample.uploaded_date_time>Uploaded_date_time</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_sample.uploaded_date_time}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_sample.modified_date_time>Modified_date_time</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_sample.modified_date_time}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.contract_sample.revision>Revision</span> </td> <td> <input class=\"input-sm form-control\" value={{contract_sample.revision}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=contract_sample class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> <button type=button ng-click=previewFile() class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.viewfile> View File</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/contract_sample/contract_sample-dialog-working.html',
    "<!--\n" +
    "<form name=\"editForm\" role=\"form\" novalidate ng-submit=\"uploadFile()\" show-validation>\n" +
    "    File to upload: <input type=\"file\" file-model=\"uploadedFile\"><br />\n" +
    "    <button type=\"submit\" ng-disabled=\"editForm.$invalid\" class=\"btn btn-primary start\">\n" +
    "        <span class=\"glyphicon glyphicon-upload\"></span>&nbsp;<span>Start upload</span>\n" +
    "    </button>\n" +
    "</form>--><!--\n" +
    "<form method=\"POST\" enctype=\"multipart/form-data\"\n" +
    "      action=\"http://localhost:9090/api/fileupload\">\n" +
    "    File to upload: <input type=\"file\" name=\"uploadedFile\"><br />\n" +
    "\n" +
    "</form>--> <input type=file name=file onchange=\"angular.element(this).scope().uploadFile(this.files)\">"
  );


  $templateCache.put('scripts/app/entities/contract_sample/contract_sample-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=uploadFile() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myContract_sampleLabel translate=mycontractApp.contract_sample.home.createOrEditLabel>Create or edit a Contract_sample</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=contract_sample.id readonly> </div> <div class=form-group> <label translate=mycontractApp.contract_sample.name for=field_name>Name</label> <input class=form-control name=name id=field_name ng-model=contract_sample.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.contract_sample.description for=field_description>Description</label> <input class=form-control name=description id=field_description ng-model=contract_sample.description> </div> <div class=form-group ng-switch=isFileSelected()> <span class=\"btn btn-primary fileinput-button\" ng-class=\"{disabled: disabled}\"> <i class=\"glyphicon glyphicon-plus\"></i> <span>Select file</span> <input type=file name=file onchange=\"angular.element(this).scope().selectFile(this.files)\"> </span> <span ng-switch-when=true class=file-selected> {{ uploadedFile.name }}</span> </div> </div> <div class=modal-footer> <!--\n" +
    "        <span class=\"btn btn-success fileinput-button\" ng-class=\"{disabled: disabled}\">\n" +
    "            <i class=\"glyphicon glyphicon-plus\"></i>\n" +
    "            <span>Add files...</span>\n" +
    "            <input type=\"file\" name=\"file\" onchange=\"angular.element(this).scope().addFileToQueue(this.files)\"/>\n" +
    "        </span>--> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/contract_sample/contract_samples.html',
    "<div> <h2 translate=mycontractApp.contract_sample.home.title>Contract_samples</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=contract_sample.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.contract_sample.home.createLabel>Create a new Contract_sample</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteContract_sampleConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(contract_sample.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.contract_sample.delete.question translate-values=\"{id: '{{contract_sample.id}}'}\">Are you sure you want to delete this Contract_sample?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.contract_sample.name>Name</th> <th translate=mycontractApp.contract_sample.uploaded_by>Uploaded_by</th> <th translate=mycontractApp.contract_sample.uploaded_date_time>Uploaded_date_time</th> <th translate=mycontractApp.contract_sample.file_name>File_name</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"contract_sample in contract_samples\"> <!--<td><a ui-sref=\"contract_sample.detail({id:contract_sample.id})\">{{contract_sample.id}}</a></td>--> <td><a ui-sref=contract_sample.detail({id:contract_sample.id})>{{contract_sample.name}}</a></td> <td>{{contract_sample.uploaded_by}}</td> <td>{{contract_sample.uploaded_date_time}}</td> <td>{{contract_sample.file_name}}</td> <td> <button type=submit ui-sref=contract_sample.detail({id:contract_sample.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=contract_sample.edit({id:contract_sample.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(contract_sample.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> <nav> <ul class=pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/contract_sample/samplePDF.html',
    "<div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <embed ng-src={{pdfContent}} style=width:870px;height:1000px> </div>"
  );


  $templateCache.put('scripts/app/entities/firstEntity/firstEntity-detail.html',
    "<div> <h2><span translate=mycontractApp.firstEntity.detail.title>FirstEntity</span> {{firstEntity.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.firstEntity.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{firstEntity.name}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=firstEntity class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/firstEntity/firstEntity-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myFirstEntityLabel translate=mycontractApp.firstEntity.home.createOrEditLabel>Create or edit a FirstEntity</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=firstEntity.id readonly> </div> <div class=form-group> <label translate=mycontractApp.firstEntity.name for=field_name>Name</label> <input class=form-control name=name id=field_name ng-model=firstEntity.name> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/firstEntity/firstEntitys.html',
    "<div> <h2 translate=mycontractApp.firstEntity.home.title>FirstEntitys</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=firstEntity.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.firstEntity.home.createLabel>Create a new FirstEntity</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteFirstEntityConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(firstEntity.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.firstEntity.delete.question translate-values=\"{id: '{{firstEntity.id}}'}\">Are you sure you want to delete this FirstEntity?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=global.field.id>ID</th> <th translate=mycontractApp.firstEntity.name>Name</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"firstEntity in firstEntitys\"> <td><a ui-sref=firstEntity.detail({id:firstEntity.id})>{{firstEntity.id}}</a></td> <td>{{firstEntity.name}}</td> <td> <button type=submit ui-sref=firstEntity.detail({id:firstEntity.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=firstEntity.edit({id:firstEntity.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(firstEntity.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> <nav> <ul class=pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/fund_source/fund_source-detail.html',
    "<div> <h2><span translate=mycontractApp.fund_source.detail.title>Fund_source</span> {{fund_source.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.fund_source.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{fund_source.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.fund_source.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{fund_source.description}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.fund_source.deleted>Deleted</span> </td> <td> <input class=\"input-sm form-control\" value={{fund_source.deleted}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.fund_source.deleted_date_time>Deleted_date_time</span> </td> <td> <input class=\"input-sm form-control\" value={{fund_source.deleted_date_time}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=fund_source class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/fund_source/fund_source-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myFund_sourceLabel translate=mycontractApp.fund_source.home.createOrEditLabel>Create or edit a Fund_source</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=fund_source.id readonly> </div> <div class=form-group> <label translate=mycontractApp.fund_source.name for=field_name>Name</label> <input class=form-control name=name id=field_name ng-model=fund_source.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.fund_source.description for=field_description>Description</label> <input class=form-control name=description id=field_description ng-model=fund_source.description> </div> <div class=form-group> <label translate=mycontractApp.fund_source.deleted for=field_deleted>Deleted</label> <input type=checkbox class=form-control name=deleted id=field_deleted ng-model=fund_source.deleted> </div> <div class=form-group> <label translate=mycontractApp.fund_source.deleted_date_time for=field_deleted_date_time>Deleted_date_time</label> <input type=datetime-local class=form-control name=deleted_date_time id=field_deleted_date_time ng-model=fund_source.deleted_date_time ng-model-options=\"{timezone: 'UTC'}\"> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/fund_source/fund_sources.html',
    "<div> <h2 translate=mycontractApp.fund_source.home.title>Fund_sources</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=fund_source.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.fund_source.home.createLabel>Create a new Fund_source</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteFund_sourceConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(fund_source.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.fund_source.delete.question translate-values=\"{id: '{{fund_source.id}}'}\">Are you sure you want to delete this Fund_source?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=global.field.id>ID</th> <th translate=mycontractApp.fund_source.name>Name</th> <th translate=mycontractApp.fund_source.description>Description</th> <th translate=mycontractApp.fund_source.deleted>Deleted</th> <th translate=mycontractApp.fund_source.deleted_date_time>Deleted_date_time</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"fund_source in fund_sources\"> <td><a ui-sref=fund_source.detail({id:fund_source.id})>{{fund_source.id}}</a></td> <td>{{fund_source.name}}</td> <td>{{fund_source.description}}</td> <td>{{fund_source.deleted}}</td> <td>{{fund_source.deleted_date_time}}</td> <td> <button type=submit ui-sref=fund_source.detail({id:fund_source.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=fund_source.edit({id:fund_source.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(fund_source.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> <nav> <ul class=pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/message/message-detail.html',
    "<div> <h2><span translate=mycontractApp.message.detail.title>Message</span> {{message.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.message.subject>Subject</span> </td> <td> <input class=\"input-sm form-control\" value={{message.subject}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.message.content>Content</span> </td> <td> <input class=\"input-sm form-control\" value={{message.content}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.message.send_datetime>Send_datetime</span> </td> <td> <input class=\"input-sm form-control\" value={{message.send_datetime}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.message.read>Read</span> </td> <td> <input class=\"input-sm form-control\" value={{message.read}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.message.sender>sender</span> </td> <td> <input class=\"input-sm form-control\" value={{message.sender.login}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.message.recipient>recipient</span> </td> <td> <input class=\"input-sm form-control\" value={{message.recipient.login}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=message class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/message/message-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myMessageLabel translate=mycontractApp.message.home.createOrEditLabel>Create or edit a Message</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=message.id readonly> </div> <div class=form-group> <label translate=mycontractApp.message.subject for=field_subject>Subject</label> <input class=form-control name=subject id=field_subject ng-model=message.subject> </div> <div class=form-group> <label translate=mycontractApp.message.content for=field_content>Content</label> <input class=form-control name=content id=field_content ng-model=message.content> </div> <div class=form-group> <label translate=mycontractApp.message.send_datetime for=field_send_datetime>Send_datetime</label> <input type=datetime-local class=form-control name=send_datetime id=field_send_datetime ng-model=message.send_datetime ng-model-options=\"{timezone: 'UTC'}\"> </div> <div class=form-group> <label translate=mycontractApp.message.read for=field_read>Read</label> <input type=checkbox class=form-control name=read id=field_read ng-model=message.read> </div> <div class=form-group> <label translate=mycontractApp.message.sender for=field_sender>sender</label> <select class=form-control id=field_sender name=sender ng-model=message.sender.id ng-options=\"user.id as user.login for user in users\"> </select> </div> <div class=form-group> <label translate=mycontractApp.message.recipient for=field_recipient>recipient</label> <select class=form-control id=field_recipient name=recipient ng-model=message.recipient.id ng-options=\"user.id as user.login for user in users\"> </select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/message/messages.html',
    "<div> <h2 translate=mycontractApp.message.home.title>Messages</h2> <div class=\"modal fade\" id=deleteMessageConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(message.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.message.delete.question translate-values=\"{id: '{{message.id}}'}\">Are you sure you want to delete this message?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.message.sender>sender</th> <th translate=mycontractApp.message.subject>Subject</th> <th translate=mycontractApp.message.send_datetime>Send_datetime</th> </tr> </thead> <tbody> <tr ng-repeat=\"message in messages\"> <td><a ui-sref=message.detail({id:message.id})><span ng-class=strong>{{message.sender.login}}</span></a></td> <td>{{message.subject}}</td> <td>{{message.send_datetime}}</td> <td><button type=submit ng-click=delete(message.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-trash\"></span> </button></td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/organization/organization-detail.html',
    "<div> <h2><span translate=mycontractApp.organization.detail.title>Organization</span> {{organization.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.organization.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{organization.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.organization.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{organization.description}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.organization.active>Active</span> </td> <td> <input class=\"input-sm form-control\" value={{organization.active}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.organization.session_timeout>Session_timeout</span> </td> <td> <input class=\"input-sm form-control\" value={{organization.session_timeout}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.organization.smtp_enabled>Smtp_enabled</span> </td> <td> <input class=\"input-sm form-control\" value={{organization.smtp_enabled}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.organization.smtp_server_address>Smtp_server_address</span> </td> <td> <input class=\"input-sm form-control\" value={{organization.smtp_server_address}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.organization.smtp_username>Smtp_username</span> </td> <td> <input class=\"input-sm form-control\" value={{organization.smtp_username}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.organization.smtp_password>Smtp_password</span> </td> <td> <input class=\"input-sm form-control\" value={{organization.smtp_password}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.organization.smtp_port>Smtp_port</span> </td> <td> <input class=\"input-sm form-control\" value={{organization.smtp_port}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=organization class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/organization/organization-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myOrganizationLabel translate=mycontractApp.organization.home.createOrEditLabel>Create or edit a Organization</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=organization.id readonly> </div> <div class=form-group> <label translate=mycontractApp.organization.name for=field_name>Name</label> <input class=form-control name=name id=field_name ng-model=organization.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.organization.description for=field_description>Description</label> <input class=form-control name=description id=field_description ng-model=organization.description> </div> <div class=form-group> <label translate=mycontractApp.organization.active for=field_active>Active</label> <input type=checkbox class=form-control name=active id=field_active ng-model=organization.active> </div> <div class=form-group> <label translate=mycontractApp.organization.session_timeout for=field_session_timeout>Session_timeout</label> <input type=number class=form-control name=session_timeout id=field_session_timeout ng-model=organization.session_timeout> </div> <div class=form-group> <label translate=mycontractApp.organization.smtp_enabled for=field_smtp_enabled>Smtp_enabled</label> <input type=checkbox class=form-control name=smtp_enabled id=field_smtp_enabled ng-model=organization.smtp_enabled> </div> <div class=form-group> <label translate=mycontractApp.organization.smtp_server_address for=field_smtp_server_address>Smtp_server_address</label> <input class=form-control name=smtp_server_address id=field_smtp_server_address ng-model=organization.smtp_server_address> </div> <div class=form-group> <label translate=mycontractApp.organization.smtp_username for=field_smtp_username>Smtp_username</label> <input class=form-control name=smtp_username id=field_smtp_username ng-model=organization.smtp_username> </div> <div class=form-group> <label translate=mycontractApp.organization.smtp_password for=field_smtp_password>Smtp_password</label> <input class=form-control name=smtp_password id=field_smtp_password ng-model=organization.smtp_password> </div> <div class=form-group> <label translate=mycontractApp.organization.smtp_port for=field_smtp_port>Smtp_port</label> <input type=number class=form-control name=smtp_port id=field_smtp_port ng-model=organization.smtp_port> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/organization/organizations.html',
    "<div> <h2 translate=mycontractApp.organization.home.title>Organizations</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=organization.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.organization.home.createLabel>Create a new Organization</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteOrganizationConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(organization.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.organization.delete.question translate-values=\"{id: '{{organization.id}}'}\">Are you sure you want to delete this Organization?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=global.field.id>ID</th> <th translate=mycontractApp.organization.name>Name</th> <th translate=mycontractApp.organization.description>Description</th> <th translate=mycontractApp.organization.active>Active</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"organization in organizations\"> <td><a ui-sref=organization.detail({id:organization.id})>{{organization.id}}</a></td> <td>{{organization.name}}</td> <td>{{organization.description}}</td> <td>{{organization.active}}</td> <td> <button type=submit ui-sref=organization.detail({id:organization.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=organization.edit({id:organization.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(organization.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> <nav> <ul class=pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/process/process-detail.html',
    "<div> <h2><span translate=mycontractApp.process.detail.title>Process</span> {{process.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.process.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{process.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.process.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{process.description}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.process.eligible_personnel>eligible_personnel</span> </td> <td> <input class=\"input-sm form-control\" value={{process.eligible_personnel.name}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=process class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/process/process-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myProcessLabel translate=mycontractApp.process.home.createOrEditLabel>Create or edit a Process</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=process.id readonly> </div> <div class=form-group> <label translate=mycontractApp.process.name for=field_name>Name</label> <input class=form-control name=name id=field_name ng-model=process.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.process.description for=field_description>Description</label> <input class=form-control name=description id=field_description ng-model=process.description> </div> <div class=form-group> <label translate=mycontractApp.process.eligible_personnel for=field_eligible_personnel>eligible_personnel</label> <select class=form-control id=field_eligible_personnel name=eligible_personnel ng-model=process.eligible_personnel.id ng-options=\"role.id as role.name for role in roles\"> </select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/process/processs.html',
    "<div> <h2 translate=mycontractApp.process.home.title>Processs</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=process.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.process.home.createLabel>Create a new Process</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteProcessConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(process.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.process.delete.question translate-values=\"{id: '{{process.id}}'}\">Are you sure you want to delete this Process?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.process.name>Name</th> <th translate=mycontractApp.process.description>Description</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"process in processes\"> <td><a ui-sref=process.detail({id:process.id})>{{process.name}}</a></td> <td>{{process.description}}</td> <td> <button type=submit ui-sref=process.detail({id:process.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span> </button> <button type=submit ui-sref=process.edit({id:process.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span> </button> <button type=submit ng-click=delete(process.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-trash\"></span> </button> </td> </tr> </tbody> </table> <nav> <ul class=pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/task/task-detail.html',
    "<div> <h2><span translate=mycontractApp.task.detail.title>Task</span> {{task.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.task.sequence>Sequence</span> </td> <td> <input class=\"input-sm form-control\" value={{task.sequence}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.task.contract>contract</span> </td> <td> <input class=\"input-sm form-control\" value={{task.contract.id}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.task.process>process</span> </td> <td> <input class=\"input-sm form-control\" value={{task.process.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.task.department>department</span> </td> <td> <input class=\"input-sm form-control\" value={{task.department.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.task.user>user</span> </td> <td> <input class=\"input-sm form-control\" value={{task.user.login}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=task class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/task/task-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myTaskLabel translate=mycontractApp.task.home.createOrEditLabel>Create or edit a Task</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=task.id readonly> </div> <div class=form-group> <label translate=mycontractApp.task.sequence for=field_sequence>Sequence</label> <input type=number class=form-control name=sequence id=field_sequence ng-model=task.sequence> </div> <div class=form-group> <label translate=mycontractApp.task.contract for=field_contract>contract</label> <select class=form-control id=field_contract name=contract ng-model=task.contract.id ng-options=\"contract.id as contract.id for contract in contracts\"> </select> </div> <div class=form-group> <label translate=mycontractApp.task.process for=field_process>process</label> <select class=form-control id=field_process name=process ng-model=task.process.id ng-options=\"process.id as process.id for process in processs\"> </select> </div> <div class=form-group> <label translate=mycontractApp.task.department for=field_department>department</label> <select class=form-control id=field_department name=department ng-model=task.department.id ng-options=\"department.id as department.id for department in departments\"> </select> </div> <div class=form-group> <label translate=mycontractApp.task.user for=field_user>user</label> <select class=form-control id=field_user name=user ng-model=task.user.id ng-options=\"user.id as user.id for user in users\"> </select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/task/tasks.html',
    "<div> <h2 translate=mycontractApp.task.home.title>Tasks</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.task.contract>contract</th> <th translate=mycontractApp.task.process>process</th> <th translate=mycontractApp.task.assignee>assignee</th> <th translate=mycontractApp.task.result>result</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"task in tasks\"> <td><a ui-sref=contract.detail({id:task.contractId})>{{task.contractName}}</a></td> <td>{{task.processName}}</td> <td>{{task.assignee}}</td> <td>{{task.result}}</td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/testEntity/testEntity-detail.html',
    "<div> <h2><span translate=mycontractApp.testEntity.detail.title>TestEntity</span> {{testEntity.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.testEntity.testField>TestField</span> </td> <td> <input class=\"input-sm form-control\" value={{testEntity.testField}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=testEntity class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/testEntity/testEntity-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myTestEntityLabel translate=mycontractApp.testEntity.home.createOrEditLabel>Create or edit a TestEntity</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=testEntity.id readonly> </div> <div class=form-group> <label translate=mycontractApp.testEntity.testField for=field_testField>TestField</label> <input type=date class=form-control name=testField id=field_testField ng-model=testEntity.testField> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/testEntity/testEntitys.html',
    "<div> <h2 translate=mycontractApp.testEntity.home.title>TestEntitys</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=testEntity.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.testEntity.home.createLabel>Create a new TestEntity</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteTestEntityConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(testEntity.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.testEntity.delete.question translate-values=\"{id: '{{testEntity.id}}'}\">Are you sure you want to delete this TestEntity?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=global.field.id>ID</th> <th translate=mycontractApp.testEntity.testField>TestField</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"testEntity in testEntitys\"> <td><a ui-sref=testEntity.detail({id:testEntity.id})>{{testEntity.id}}</a></td> <td>{{testEntity.testField}}</td> <td> <button type=submit ui-sref=testEntity.detail({id:testEntity.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=testEntity.edit({id:testEntity.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(testEntity.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/entities/workflow/workflow-detail.html',
    "<div> <h2><span translate=mycontractApp.workflow.detail.title>Workflow</span> {{workflow.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.workflow.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{workflow.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.workflow.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{workflow.description}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.workflow.account>Account</span> </td> <td> <input class=\"input-sm form-control\" value={{workflow.account.name}} readonly> </td> </tr> <tr> <table class=\"table table-striped\"> <thead> <tr> <th translate=mycontractApp.workflow.process>Process</th> <th> <button type=button ng-click=showProcess() class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-plus-sign\"></span>add process </button> </th> <th> <button type=button ng-click=addWorkflowProcess() class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-save\"></span>Save </button> </th> </tr> </thead> <tbody> <tr ng-repeat=\"process in workflow.processes\"> <td> <label>step:</label> </td> <td> <input class=\"input-sm form-control\" value={{process.sequence}} readonly> </td> <td> <input class=\"input-sm form-control\" value={{process.name}} readonly> </td> <td> <button type=button ng-click=removeWorkflowProcess(process) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-trash\"></span> </button> </td> </tr> <tr ng-show=show> <td> <span translate=mycontractApp.workflow.process>Process</span> </td> <td> <select name=process class=form-control ng-model=addedProcess ng-change=addProcess(addedProcess) ng-controller=ProcessController ng-options=\"process as process.name for process in processes \"> <option value=\"\">Select Process</option> </select> </td> </tr> </tbody> </table> </tr> </tbody> </table> </div> <button type=submit ui-sref=workflow class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/entities/workflow/workflow-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myWorkflowLabel translate=mycontractApp.workflow.home.createOrEditLabel>Create or edit a Workflow</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=workflow.id readonly> </div> <div class=form-group> <label translate=mycontractApp.workflow.name for=field_name>Name</label> <input class=form-control name=name id=field_name ng-model=workflow.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.workflow.description for=field_description>Description</label> <input class=form-control name=description id=field_description ng-model=workflow.description> </div> <div class=form-group> <label translate=mycontractApp.workflow.process for=field_process>process</label> <select class=form-control id=field_process multiple name=process ng-model=workflow.processs ng-options=\"process as process.name for process in processs track by process.id\"> </select> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/entities/workflow/workflows.html',
    "<div> <h2 translate=mycontractApp.workflow.home.title>Workflows</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=workflow.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.workflow.home.createLabel>Create a new Workflow</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteWorkflowConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(workflow.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.workflow.delete.question translate-values=\"{id: '{{workflow.id}}'}\">Are you sure you want to delete this Workflow?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=global.field.id>ID</th> <th translate=mycontractApp.workflow.name>Name</th> <th translate=mycontractApp.workflow.description>Description</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"workflow in workflows\"> <td><a ui-sref=workflow.detail({id:workflow.id})>{{workflow.id}}</a></td> <td>{{workflow.name}}</td> <td>{{workflow.description}}</td> <td> <button type=submit ui-sref=workflow.detail({id:workflow.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=workflow.edit({id:workflow.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(workflow.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> </div> </div>"
  );


  $templateCache.put('scripts/app/error/accessdenied.html',
    "<div ng-cloak> <div class=row> <div class=col-md-4> <span class=\"hipster img-responsive img-rounded\"></span> </div> <div class=col-md-8> <h1 translate=error.title>Error Page!</h1> <div class=\"alert alert-danger\" translate=error.403>You are not authorized to access the page. </div> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/error/error.html',
    "<div ng-cloak> <div class=row> <div class=col-md-4> <span class=\"hipster img-responsive img-rounded\"></span> </div> <div class=col-md-8> <h1 translate=error.title>Error Page!</h1> <div ng-show=errorMessage> <div class=\"alert alert-danger\">{{errorMessage}} </div> </div> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/main/main.html',
    "<div ng-cloak> <div class=row> <div class=col-md-8> <h1 translate=main.title>Welcome, Java Hipster!</h1> <p class=lead translate=main.subtitle>This is your homepage</p> <div ng-switch=isAuthenticated()> <div class=\"alert alert-success\" ng-switch-when=true translate=main.logged.message translate-values=\"{username: '{{account.login}}'}\"> You are logged in as user \"{{account.login}}\". </div> <div ng-switch-when=false> </div> </div> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/project/project-detail.html',
    "<div> <h2><span translate=mycontractApp.project.detail.title>Project</span> {{project.id}}</h2> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=entity.detail.field>Field</th> <th translate=entity.detail.value>Value</th> </tr> </thead> <tbody> <tr> <td> <span translate=mycontractApp.project.name>Name</span> </td> <td> <input class=\"input-sm form-control\" value={{project.name}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.project.identifier>Identifier</span> </td> <td> <input class=\"input-sm form-control\" value={{project.identifier}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.project.description>Description</span> </td> <td> <input class=\"input-sm form-control\" value={{project.description}} readonly> </td> </tr> <tr> <td> <span translate=mycontractApp.project.manager>Manager</span> </td> <td> <input class=\"input-sm form-control\" value={{project.manager}} readonly> </td> </tr> </tbody> </table> </div> <button type=submit ui-sref=project class=\"btn btn-info\"> <span class=\"glyphicon glyphicon-arrow-left\"></span>&nbsp;<span translate=entity.action.back> Back</span> </button> </div>"
  );


  $templateCache.put('scripts/app/project/project-dialog.html',
    "<form name=editForm role=form novalidate ng-submit=save() show-validation> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=myProjectLabel translate=mycontractApp.project.home.createOrEditLabel>Create or edit a Project</h4> </div> <div class=modal-body> <div class=form-group> <label translate=global.field.id>ID</label> <input class=form-control name=id ng-model=project.id readonly> </div> <div class=form-group> <label translate=mycontractApp.project.name for=field_name>Name</label> <input class=form-control name=name id=field_name ng-model=project.name> <div ng-show=editForm.name.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.project.identifier for=field_identifier>Identifier</label> <input class=form-control name=identifier id=field_identifier ng-model=project.identifier> <div ng-show=editForm.identifier.$invalid> </div> </div> <div class=form-group> <label translate=mycontractApp.project.description for=field_description>Description</label> <input class=form-control name=description id=field_description ng-model=project.description> </div> <div class=form-group> <label translate=mycontractApp.project.manager for=field_manager>Manager</label> <input class=form-control name=manager id=field_manager ng-model=project.manager> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=editForm.$invalid class=\"btn btn-primary\"> <span class=\"glyphicon glyphicon-save\"></span>&nbsp;<span translate=entity.action.save>Save</span> </button> </div> </form>"
  );


  $templateCache.put('scripts/app/project/projects.html',
    "<div> <h2 translate=mycontractApp.project.home.title>Projects</h2> <div class=container> <div class=row> <div class=col-md-4> <button class=\"btn btn-primary\" ui-sref=project.new> <span class=\"glyphicon glyphicon-flash\"></span> <span translate=mycontractApp.project.home.createLabel>Create a new Project</span> </button> </div> </div> </div> <div class=\"modal fade\" id=deleteProjectConfirmation> <div class=modal-dialog> <div class=modal-content> <form name=deleteForm ng-submit=confirmDelete(project.id)> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title translate=entity.delete.title>Confirm delete operation</h4> </div> <div class=modal-body> <p translate=mycontractApp.project.delete.question translate-values=\"{id: '{{project.id}}'}\">Are you sure you want to delete this Project?</p> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal ng-click=clear()> <span class=\"glyphicon glyphicon-ban-circle\"></span>&nbsp;<span translate=entity.action.cancel>Cancel</span> </button> <button type=submit ng-disabled=deleteForm.$invalid class=\"btn btn-danger\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete>Delete</span> </button> </div> </form> </div> </div> </div> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=global.field.id>ID</th> <th translate=mycontractApp.project.name>Name</th> <th translate=mycontractApp.project.identifier>Identifier</th> <th translate=mycontractApp.project.description>Description</th> <th translate=mycontractApp.project.manager>Manager</th> <th></th> </tr> </thead> <tbody> <tr ng-repeat=\"project in projects\"> <td><a ui-sref=project.detail({id:project.id})>{{project.id}}</a></td> <td>{{project.name}}</td> <td>{{project.identifier}}</td> <td>{{project.description}}</td> <td>{{project.manager}}</td> <td> <button type=submit ui-sref=project.detail({id:project.id}) class=\"btn btn-info btn-sm\"> <span class=\"glyphicon glyphicon-eye-open\"></span>&nbsp;<span translate=entity.action.view> View</span> </button> <button type=submit ui-sref=project.edit({id:project.id}) class=\"btn btn-primary btn-sm\"> <span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;<span translate=entity.action.edit> Edit</span> </button> <button type=submit ng-click=delete(project.id) class=\"btn btn-danger btn-sm\"> <span class=\"glyphicon glyphicon-remove-circle\"></span>&nbsp;<span translate=entity.action.delete> Delete</span> </button> </td> </tr> </tbody> </table> <nav> <ul class=pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav> </div> </div>"
  );


  $templateCache.put('scripts/app/system/audits/audits.html',
    "<div> <h2 translate=audits.title>Audits</h2> <div class=row> <div class=col-md-5> <h4 translate=audits.filter.title>Filter by date</h4> <p class=input-group> <span class=input-group-addon translate=audits.filter.from>from</span> <input type=date class=\"input-sm form-control\" name=start ng-model=fromDate ng-change=onChangeDate() required> <span class=input-group-addon translate=audits.filter.to>to</span> <input type=date class=\"input-sm form-control\" name=end ng-model=toDate ng-change=onChangeDate() required> </p> </div> </div> <table class=\"table table-condensed table-striped table-bordered table-responsive\"> <thead> <tr> <th ng-click=\"predicate = 'timestamp'; reverse=!reverse\"><span translate=audits.table.header.date>Date</span></th> <th ng-click=\"predicate = 'principal'; reverse=!reverse\"><span translate=audits.table.header.principal>User</span></th> <th ng-click=\"predicate = 'type'; reverse=!reverse\"><span translate=audits.table.header.status>State</span></th> <th ng-click=\"predicate = 'data.message'; reverse=!reverse\"><span translate=audits.table.header.data>Extra data</span></th> </tr> </thead> <tr ng-repeat=\"audit in audits | filter:filter | orderBy:predicate:reverse\" ng-hide=audit.filtered> <td><span>{{audit.timestamp| date:'medium'}}</span></td> <td><small>{{audit.principal}}</small></td> <td>{{audit.type}}</td> <td> <span ng-show=audit.data.message>{{audit.data.message}}</span> <span ng-show=audit.data.remoteAddress><span translate=audits.table.data.remoteAddress>Remote Address</span> {{audit.data.remoteAddress}}</span> </td> </tr> </table> </div>"
  );


  $templateCache.put('scripts/app/system/configuration/configuration.html',
    "<div> <h2 translate=configuration.title>configuration</h2> <span translate=configuration.filter>Filter (by prefix)</span> <input ng-model=filter class=form-control> <table class=\"table table-condensed table-striped table-bordered table-responsive\" style=table-layout:fixed> <thead> <tr> <th ng-click=\"predicate = 'prefix'; reverse=!reverse\"><span translate=configuration.table.prefix>Prefix</span></th> <th translate=configuration.table.properties>Properties</th> </tr> </thead> <tr ng-repeat=\"entry in configuration | filter:filter | orderBy:predicate:reverse\"> <td><span>{{entry.prefix}}</span></td> <td> <div class=row ng-repeat=\"(key, value) in entry.properties\"> <div class=col-md-6>{{key}}</div> <div class=col-md-6><span class=\"pull-right label label-info\" style=\"white-space: normal;word-break:break-all\">{{value}}</span></div> </div> </td> </tr> </table> </div>"
  );


  $templateCache.put('scripts/app/system/docs/docs.html',
    "<iframe src=swagger-ui.html frameborder=0 marginheight=0 marginwidth=0 width=100% height=900 scrolling=auto target=_top></iframe>"
  );


  $templateCache.put('scripts/app/system/health/health.html',
    "<div> <h2 translate=health.title>Health Check</h2> <div class=\"modal fade\" id=showHealthModal tabindex=-1 role=dialog aria-labelledby=showHealthLabel aria-hidden=true> <div class=modal-dialog> <div class=modal-content> <form name=form role=form novalidate class=\"ng-scope ng-invalid ng-invalid-required ng-dirty ng-valid-minlength\" ng-submit=create()> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true ng-click=clear()>&times;</button> <h4 class=modal-title id=showHealthLabel> {{'health.indicator.' + baseName(currentHealth.name) | translate}} {{subSystemName(currentHealth.name)}} </h4> </div> <div class=modal-body> <div ng-show=currentHealth.details> <h4 translate=health.details.properties>Properties</h4> <table class=\"table table-striped\"> <thead> <tr> <th class=\"col-md-6 text-left\" translate=health.details.name>Name</th> <th class=\"col-md-6 text-left\" translate=health.details.value>Value</th> </tr> </thead> <tbody> <tr ng-repeat=\"(k,v) in currentHealth.details\"> <td class=\"col-md-6 text-left\">{{k}}</td> <td class=\"col-md-6 text-left\">{{v}}</td> </tr> </tbody> </table> </div> <div ng-show=currentHealth.error> <h4 translate=health.details.error>Error</h4> <pre>{{currentHealth.error}}</pre> </div> </div> </form> </div> </div> </div> <p> <button type=button class=\"btn btn-primary\" ng-click=refresh()><span class=\"glyphicon glyphicon-refresh\"></span>&nbsp;<span translate=health.refresh.button>Refresh</span> </button> </p> <table id=healthCheck class=\"table table-striped\"> <thead> <tr> <th class=col-md-7 translate=health.table.service>Service Name</th> <th class=\"col-md-2 text-center\" translate=health.table.status>Status</th> <th class=\"col-md-2 text-center\" translate=health.details.details>Details</th> <th class=\"col-md-1 text-center\"></th> </tr> </thead> <tbody> <tr ng-repeat=\"health in healthData\"> <td>{{'health.indicator.' + baseName(health.name) | translate}} {{subSystemName(health.name)}}</td> <td class=text-center> <span class=label ng-class=getLabelClass(health.status)> {{'health.status.' + health.status | translate}} </span> </td> <td class=text-center> <a class=hand ng-click=showHealth(health) ng-show=\"health.details || health.error\"> <i class=\"glyphicon glyphicon-eye-open\"></i> </a> </td> <td></td> </tr> </tbody> </table> </div>"
  );


  $templateCache.put('scripts/app/system/logs/logs.html',
    "<div> <h2 translate=logs.title>Logs</h2> <p translate=logs.nbloggers translate-values=\"{total: '{{ loggers.length }}'}\">There are {{ loggers.length }} loggers.</p> <span translate=logs.filter>Filter</span> <input ng-model=filter class=form-control> <table class=\"table table-condensed table-striped table-bordered table-responsive\"> <thead> <tr title=\"click to order\"> <th ng-click=\"predicate = 'name'; reverse=!reverse\"><span translate=logs.table.name>Name</span></th> <th ng-click=\"predicate = 'level'; reverse=!reverse\"><span translate=logs.table.level>Level</span></th> </tr> </thead> <tr ng-repeat=\"logger in loggers | filter:filter | orderBy:predicate:reverse\"> <td><small>{{logger.name | characters:140}}</small></td> <td> <button ng-click=\"changeLevel(logger.name, 'TRACE')\" ng-class=\"(logger.level=='TRACE') ? 'btn-danger' : 'btn-default'\" class=\"btn btn-default btn-xs\">TRACE</button> <button ng-click=\"changeLevel(logger.name, 'DEBUG')\" ng-class=\"(logger.level=='DEBUG') ? 'btn-warning' : 'btn-default'\" class=\"btn btn-default btn-xs\">DEBUG</button> <button ng-click=\"changeLevel(logger.name, 'INFO')\" ng-class=\"(logger.level=='INFO') ? 'btn-info' : 'btn-default'\" class=\"btn btn-default btn-xs\">INFO</button> <button ng-click=\"changeLevel(logger.name, 'WARN')\" ng-class=\"(logger.level=='WARN') ? 'btn-success' : 'btn-default'\" class=\"btn btn-default btn-xs\">WARN</button> <button ng-click=\"changeLevel(logger.name, 'ERROR')\" ng-class=\"(logger.level=='ERROR') ? 'btn-primary' : 'btn-default'\" class=\"btn btn-default btn-xs\">ERROR</button> </td> </tr> </table> </div>"
  );


  $templateCache.put('scripts/app/system/metrics/metrics.html',
    "<div> <h2 translate=metrics.title>Application Metrics</h2> <p> <button type=button class=\"btn btn-primary\" ng-click=refresh()><span class=\"glyphicon glyphicon-refresh\"></span>&nbsp;<span translate=metrics.refresh.button>Refresh</span></button> </p> <h3 translate=metrics.jvm.title>JVM Metrics</h3> <div class=row ng-hide=updatingMetrics> <div class=col-md-4> <b translate=metrics.jvm.memory.title>Memory</b> <p><span translate=metrics.jvm.memory.total>Total Memory</span> ({{metrics.gauges['jvm.memory.total.used'].value / 1000000 | number:0}}M / {{metrics.gauges['jvm.memory.total.max'].value / 1000000 | number:0}}M)</p> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-success\" role=progressbar aria-valuenow=\"{{metrics.gauges['jvm.memory.total.used'].value / 1000000 | number:0}}\" aria-valuemin=0 aria-valuemax=\"{{metrics.gauges['jvm.memory.total.max'].value / 1000000 | number:0}}\" ng-style=\"{width: (metrics.gauges['jvm.memory.total.used'].value * 100 / metrics.gauges['jvm.memory.total.max'].value | number:0) + '%'}\"> {{metrics.gauges['jvm.memory.total.used'].value * 100 / metrics.gauges['jvm.memory.total.max'].value | number:0}}% </div> </div> <p><span translate=metrics.jvm.memory.heap>Heap Memory</span> ({{metrics.gauges['jvm.memory.heap.used'].value / 1000000 | number:0}}M / {{metrics.gauges['jvm.memory.heap.max'].value / 1000000 | number:0}}M)</p> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-success\" role=progressbar aria-valuenow=\"{{metrics.gauges['jvm.memory.heap.used'].value / 1000000 | number:0}}\" aria-valuemin=0 aria-valuemax=\"{{metrics.gauges['jvm.memory.heap.max'].value / 1000000 | number:0}}\" ng-style=\"{width: (metrics.gauges['jvm.memory.heap.usage'].value * 100 | number:0) + '%'}\"> {{(metrics.gauges['jvm.memory.heap.usage'].value * 100 | number:0)}}% </div> </div> <p><span translate=metrics.jvm.memory.nonheap>Non-Heap Memory</span> ({{metrics.gauges['jvm.memory.non-heap.used'].value / 1000000 | number:0}}M / {{metrics.gauges['jvm.memory.non-heap.committed'].value / 1000000 | number:0}}M)</p> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-success\" role=progressbar aria-valuenow=\"{{metrics.gauges['jvm.memory.non-heap.used'].value / 1000000 | number:0}}\" aria-valuemin=0 aria-valuemax=\"{{metrics.gauges['jvm.memory.non-heap.committed'].value / 1000000 | number:0}}\" ng-style=\"{width: (metrics.gauges['jvm.memory.non-heap.committed'].value / 1000000 | number:0) + '%'}\"> {{(metrics.gauges['jvm.memory.non-heap.used'].value * 100 / metrics.gauges['jvm.memory.non-heap.committed'].value | number:0)}}% </div> </div> </div> <div class=col-md-4> <b translate=metrics.jvm.threads.title>Threads</b> (Total: {{metrics.gauges['jvm.threads.count'].value}}) <a class=hand ng-click=refreshThreadDumpData() data-toggle=modal data-target=#threadDump><i class=\"glyphicon glyphicon-eye-open\"></i></a> <p><span translate=metrics.jvm.threads.runnable>Runnable</span> {{metrics.gauges['jvm.threads.runnable.count'].value}}</p> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-success\" role=progressbar aria-valuenow=\"{{metrics.gauges['jvm.threads.runnable.count'].value}}\" aria-valuemin=0 aria-valuemax=\"{{metrics.gauges['jvm.threads.count'].value}}\" ng-style=\"{width: (metrics.gauges['jvm.threads.runnable.count'].value * 100 / metrics.gauges['jvm.threads.count'].value | number:0) + '%'}\"> {{metrics.gauges['jvm.threads.runnable.count'].value * 100 / metrics.gauges['jvm.threads.count'].value | number:0}}% </div> </div> <p><span translate=metrics.jvm.threads.timedwaiting>Timed Waiting</span> ({{metrics.gauges['jvm.threads.timed_waiting.count'].value}})</p> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-warning\" role=progressbar aria-valuenow=\"{{metrics.gauges['jvm.threads.timed_waiting.count'].value}}\" aria-valuemin=0 aria-valuemax=\"{{metrics.gauges['jvm.threads.count'].value}}\" ng-style=\"{width: (metrics.gauges['jvm.threads.timed_waiting.count'].value * 100 / metrics.gauges['jvm.threads.count'].value | number:0) + '%'}\"> {{metrics.gauges['jvm.threads.timed_waiting.count'].value * 100 / metrics.gauges['jvm.threads.count'].value | number:0}}% </div> </div> <p><span translate=metrics.jvm.threads.waiting>Waiting</span> ({{metrics.gauges['jvm.threads.waiting.count'].value}})</p> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-warning\" role=progressbar aria-valuenow=\"{{metrics.gauges['jvm.threads.waiting.count'].value}}\" aria-valuemin=0 aria-valuemax=\"{{metrics.gauges['jvm.threads.count'].value}}\" ng-style=\"{width: (metrics.gauges['jvm.threads.waiting.count'].value * 100 / metrics.gauges['jvm.threads.count'].value | number:0) + '%'}\"> {{metrics.gauges['jvm.threads.waiting.count'].value * 100 / metrics.gauges['jvm.threads.count'].value | number:0}}% </div> </div> <p><span translate=metrics.jvm.threads.blocked>Blocked</span> ({{metrics.gauges['jvm.threads.blocked.count'].value}})</p> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-danger\" role=progressbar aria-valuenow=\"{{metrics.gauges['jvm.threads.blocked.count'].value}}\" aria-valuemin=0 aria-valuemax=\"{{metrics.gauges['jvm.threads.count'].value}}\" ng-style=\"{width: (metrics.gauges['jvm.threads.blocked.count'].value * 100 / metrics.gauges['jvm.threads.count'].value | number:0) + '%'}\"> {{metrics.gauges['jvm.threads.blocked.count'].value * 100 / metrics.gauges['jvm.threads.count'].value | number:0}}% </div> </div> </div> <div class=col-md-4> <b translate=metrics.jvm.gc.title>Garbage collections</b> <div class=row> <div class=col-md-9 translate=metrics.jvm.gc.marksweepcount>Mark Sweep count</div> <div class=\"col-md-3 text-right\">{{metrics.gauges['jvm.garbage.PS-MarkSweep.count'].value}}</div> </div> <div class=row> <div class=col-md-9 translate=metrics.jvm.gc.marksweeptime>Mark Sweep time</div> <div class=\"col-md-3 text-right\">{{metrics.gauges['jvm.garbage.PS-MarkSweep.time'].value}}ms</div> </div> <div class=row> <div class=col-md-9 translate=metrics.jvm.gc.scavengecount>Scavenge count</div> <div class=\"col-md-3 text-right\">{{metrics.gauges['jvm.garbage.PS-Scavenge.count'].value}}</div> </div> <div class=row> <div class=col-md-9 translate=metrics.jvm.gc.scavengetime>Scavenge time</div> <div class=\"col-md-3 text-right\">{{metrics.gauges['jvm.garbage.PS-Scavenge.time'].value}}ms</div> </div> </div> </div> <div class=\"well well-lg\" ng-show=updatingMetrics translate=metrics.updating>Updating...</div> <h3 translate=metrics.jvm.http.title>HTTP requests (events per second)</h3> <p><span translate=metrics.jvm.http.active>Active requests</span> <b>{{metrics.counters['com.codahale.metrics.servlet.InstrumentedFilter.activeRequests'].count | number:0}}</b> - <span translate=metrics.jvm.http.total>Total requests</span> <b>{{metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count | number:0}}</b></p> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=metrics.jvm.http.table.code>Code</th> <th translate=metrics.jvm.http.table.count>Count</th> <th class=text-right translate=metrics.jvm.http.table.mean>Mean</th> <th class=text-right><span translate=metrics.jvm.http.table.average>Average</span> (1 min)</th> <th class=text-right><span translate=metrics.jvm.http.table.average>Average</span> (5 min)</th> <th class=text-right><span translate=metrics.jvm.http.table.average>Average</span> (15 min)</th> </tr> </thead> <tbody> <tr> <td translate=metrics.jvm.http.code.ok>OK</td> <td> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-success\" role=progressbar aria-valuenow=\"{{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].count * 100 / metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}}\" aria-valuemin=0 aria-valuemax=\"{{metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}}\" ng-style=\"{width: ((metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].count * 100 / metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count) | number:0) + '%'}\"> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].count}} </div> </div></td> <td class=text-right> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].mean_rate | number:2}} </td> <td class=text-right>{{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].m1_rate | number:2}} </td> <td class=text-right>{{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].m5_rate | number:2}} </td> <td class=text-right> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].m15_rate | number:2}} </td> </tr> <tr> <td translate=metrics.jvm.http.code.notfound>Not Found</td> <td> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-warning\" role=progressbar aria-valuenow=\"{{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].count * 100 / metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}}\" aria-valuemin=0 aria-valuemax=\"{{metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}}\" ng-style=\"{width: ((metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].count * 100 / metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count) | number:0) + '%'}\"> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].count}} </div> </div> </td> <td class=text-right> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].mean_rate | number:2}} </td> <td class=text-right> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].m1_rate | number:2}} </td> <td class=text-right> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].m5_rate | number:2}} </td> <td class=text-right> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].m15_rate | number:2}} </td> </tr> <tr> <td translate=metrics.jvm.http.code.servererror>Server error</td> <td> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-danger\" role=progressbar aria-valuenow=\"{{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].count * 100 / metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}}\" aria-valuemin=0 aria-valuemax=\"{{metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}}\" ng-style=\"{width: ((metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].count * 100 / metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count) | number:0) + '%'}\"> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].count}} </div> </div> </td> <td class=text-right> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].mean_rate | number:2}} </td> <td class=text-right> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].m1_rate | number:2}} </td> <td class=text-right> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].m5_rate | number:2}} </td> <td class=text-right> {{metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].m15_rate | number:2}} </td> </tr> </tbody> </table> </div> <h3 translate=metrics.servicesstats.title>Services statistics (time in millisecond)</h3> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=metrics.servicesstats.table.name>Service name</th> <th class=text-right translate=metrics.servicesstats.table.count>Count</th> <th class=text-right translate=metrics.servicesstats.table.mean>Mean</th> <th class=text-right translate=metrics.servicesstats.table.min>Min</th> <th class=text-right translate=metrics.servicesstats.table.p50>p50</th> <th class=text-right translate=metrics.servicesstats.table.p75>p75</th> <th class=text-right translate=metrics.servicesstats.table.p95>p95</th> <th class=text-right translate=metrics.servicesstats.table.p99>p99</th> <th class=text-right translate=metrics.servicesstats.table.max>Max</th> </tr> </thead> <tbody> <tr ng-repeat=\"(k, v) in servicesStats\"> <td>{{k}}</td> <td class=text-right>{{v.count}}</td> <td class=text-right>{{v.mean * 1000 | number:0}}</td> <td class=text-right>{{v.min * 1000 | number:0}}</td> <td class=text-right>{{v.p50 * 1000 | number:0}}</td> <td class=text-right>{{v.p75 * 1000 | number:0}}</td> <td class=text-right>{{v.p95 * 1000 | number:0}}</td> <td class=text-right>{{v.p99 * 1000 | number:0}}</td> <td class=text-right>{{v.max * 1000 | number:0}}</td> </tr> </tbody> </table> </div> <h3 translate=metrics.ehcache.title>Ehcache statistics</h3> <div class=table-responsive> <table class=\"table table-striped\"> <thead> <tr> <th translate=metrics.ehcache.cachename>Cache name</th> <th class=text-right translate=metrics.ehcache.objects>Objects</th> <th class=text-right translate=metrics.ehcache.hits>Hits</th> <th class=text-right translate=metrics.ehcache.misses>Misses</th> <th class=text-right translate=metrics.ehcache.evictioncount>Eviction count</th> <th class=text-right translate=metrics.ehcache.mean>Mean get time (ms)</th> </tr> </thead> <tbody> <tr ng-repeat=\"(k, v) in cachesStats\" ng-once> <td>{{v.name}}</td> <td class=text-right>{{metrics.gauges[k + '.objects'].value}}</td> <td class=text-right>{{metrics.gauges[k + '.hits'].value}}</td> <td class=text-right>{{metrics.gauges[k + '.misses'].value}}</td> <td class=text-right>{{metrics.gauges[k + '.eviction-count'].value}}</td> <td class=text-right>{{metrics.gauges[k + '.mean-get-time'].value | number:2}}</td> </tr> </tbody> </table> </div> <h3 translate=metrics.datasource.title ng-show=\"metrics.gauges['HikariPool-0.pool.TotalConnections'].value > 0\">DataSource statistics (time in millisecond)</h3> <div class=table-responsive ng-show=\"metrics.gauges['HikariPool-0.pool.TotalConnections'].value > 0\"> <table class=\"table table-striped\"> <thead> <tr> <th><span translate=metrics.datasource.usage>Usage</span> ({{metrics.gauges['HikariPool-0.pool.ActiveConnections'].value}} / {{metrics.gauges['HikariPool-0.pool.TotalConnections'].value}})</th> <th class=text-right translate=metrics.datasource.count>Count</th> <th class=text-right translate=metrics.datasource.mean>Mean</th> <th class=text-right translate=metrics.datasource.min>Min</th> <th class=text-right translate=metrics.datasource.p50>p50</th> <th class=text-right translate=metrics.datasource.p75>p75</th> <th class=text-right translate=metrics.datasource.p95>p95</th> <th class=text-right translate=metrics.datasource.p99>p99</th> <th class=text-right translate=metrics.datasource.max>Max</th> </tr> </thead> <tbody> <tr> <td> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-success\" role=progressbar aria-valuenow=\"{{metrics.gauges['HikariPool-0.pool.ActiveConnections'].value | number:0}}\" aria-valuemin=0 aria-valuemax=\"{{metrics.gauges['HikariPool-0.pool.TotalConnections'].value | number:0}}\" ng-style=\"{width: (metrics.gauges['HikariPool-0.pool.ActiveConnections'].value * 100 / metrics.gauges['HikariPool-0.pool.TotalConnections'].value | number:0) + '%'}\"> {{metrics.gauges['HikariPool-0.pool.ActiveConnections'].value * 100 / metrics.gauges['HikariPool-0.pool.TotalConnections'].value | number:0}}% </div> </div> </td> <td class=text-right>{{metrics.histograms['HikariPool-0.pool.Usage'].count}}</td> <td class=text-right>{{metrics.histograms['HikariPool-0.pool.Usage'].mean | number:2}}</td> <td class=text-right>{{metrics.histograms['HikariPool-0.pool.Usage'].min | number:2}}</td> <td class=text-right>{{metrics.histograms['HikariPool-0.pool.Usage'].p50 | number:2}}</td> <td class=text-right>{{metrics.histograms['HikariPool-0.pool.Usage'].p75 | number:2}}</td> <td class=text-right>{{metrics.histograms['HikariPool-0.pool.Usage'].p95 | number:2}}</td> <td class=text-right>{{metrics.histograms['HikariPool-0.pool.Usage'].p99 | number:2}}</td> <td class=text-right>{{metrics.histograms['HikariPool-0.pool.Usage'].max | number:2}}</td> </tr> </tbody> </table> </div> </div> <!-- Modal used to display the threads dump --> <div id=threadDump class=\"modal fade\" tabindex=-1 role=dialog aria-labelledby=myModalLabel aria-hidden=true> <div class=\"modal-dialog modal-lg\"> <div class=modal-content> <div class=modal-header> <button type=button class=close data-dismiss=modal aria-hidden=true>&times;</button> <h4 class=modal-title id=myModalLabel translate=metrics.jvm.threads.dump.title>Threads dump</h4> </div> <div class=\"modal-body well\"> <span class=\"label label-primary\" ng-click=\"threadDumpFilter = {}\"><span translate=metrics.jvm.threads.all>All</span>&nbsp;<span class=badge>{{threadDumpAll}}</span></span>&nbsp; <span class=\"label label-success\" ng-click=\"threadDumpFilter = {threadState: 'RUNNABLE'}\"><span translate=metrics.jvm.threads.runnable>Runnable</span>&nbsp;<span class=badge>{{threadDumpRunnable}}</span></span>&nbsp; <span class=\"label label-info\" ng-click=\"threadDumpFilter = {threadState: 'WAITING'}\"><span translate=metrics.jvm.threads.waiting>Waiting</span>&nbsp;<span class=badge>{{threadDumpWaiting}}</span></span>&nbsp; <span class=\"label label-warning\" ng-click=\"threadDumpFilter = {threadState: 'TIMED_WAITING'}\"><span translate=metrics.jvm.threads.timedwaiting>Timed Waiting</span>&nbsp;<span class=badge>{{threadDumpTimedWaiting}}</span></span>&nbsp; <span class=\"label label-danger\" ng-click=\"threadDumpFilter = {threadState: 'BLOCKED'}\"><span translate=metrics.jvm.threads.blocked>Blocked</span>&nbsp;<span class=badge>{{threadDumpBlocked}}</span></span>&nbsp; <div class=voffset2>&nbsp;</div> <div class=row ng-repeat=\"(k, v) in threadDump | filter:threadDumpFilter\"> <h5><span class=label ng-class=getLabelClass(v.threadState)>&nbsp;</span>&nbsp;{{v.threadName}} (<span translate=metrics.jvm.threads.dump.id>Id</span> {{v.threadId}})</h5> <table class=\"table table-condensed\"> <thead> <tr> <th class=text-right translate=metrics.jvm.threads.dump.blockedtime>Blocked Time</th> <th class=text-right translate=metrics.jvm.threads.dump.blockedcount>Blocked Count</th> <th class=text-right translate=metrics.jvm.threads.dump.waitedtime>Waited Time</th> <th class=text-right translate=metrics.jvm.threads.dump.waitedcount>Waited Count</th> <th translate=metrics.jvm.threads.dump.lockname>Lock Name</th> <th translate=metrics.jvm.threads.dump.stacktrace>StackTrace</th> </tr> </thead> <tbody> <tr> <td>{{v.blockedTime}}</td> <td>{{v.blockedCount}}</td> <td>{{v.waitedTime}}</td> <td>{{v.waitedCount}}</td> <td>{{v.lockName}}</td> <td> <a ng-click=\"show = !show\" data-placement=left> <span ng-show=!show translate=metrics.jvm.threads.dump.show>show</span> <span ng-show=show translate=metrics.jvm.threads.dump.hide>hide</span> </a> <div class=\"popover left\" ng-show=show> <div class=popover-title> <h4><span translate=metrics.jvm.threads.dump.stacktrace>Stacktrace</span><button type=button class=close ng-click=\"show = !show\">&times;</button></h4> </div> <div class=popover-content> <div ng-repeat=\"(stK, stV) in v.stackTrace\"> {{stV.className}}.{{stV.methodName}}({{stV.fileName}}:{{stV.lineNumber}}) <span class=voffset1></span> </div> </div> </div> </td> </tr> </tbody> </table> </div> </div> <div class=modal-footer> <button type=button class=\"btn btn-default\" data-dismiss=modal>Close</button> </div> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/useraccount/activate/activate.html',
    "<div> <div class=row> <div class=\"col-md-8 col-md-offset-2\"> <h1 translate=activate.title>Activation</h1> <div class=\"alert alert-success\" ng-show=success translate=activate.messages.success> <strong>Your user has been activated.</strong> Please authenticate. </div> <div class=\"alert alert-danger\" ng-show=error translate=activate.messages.error> <strong>Your user could not be activated.</strong> Please use the registration form to sign up. </div> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/useraccount/login/login.html',
    "<div> <div class=row> <div class=\"col-md-4 col-md-offset-4\"> <h1 translate=login.title>Authentication</h1> <div class=\"alert alert-danger\" ng-show=authenticationError translate=login.messages.error.authentication> <strong>Authentication failed!</strong> Please check your credentials and try again. </div> <form class=form role=form ng-submit=login($event)> <div class=form-group> <label for=username translate=global.form.username>Login</label> <input class=form-control id=username placeholder=\"{{'global.form.username.placeholder' | translate}}\" ng-model=username> </div> <div class=form-group> <label for=password translate=login.form.password>Password</label> <input type=password class=form-control id=password placeholder=\"{{'login.form.password.placeholder' | translate}}\" ng-model=password> </div> <button type=submit class=\"btn btn-primary\" translate=login.form.button>Authenticate</button> </form> <p></p> <div class=\"alert alert-warning\"> <a href=#/reset/request translate=login.password.forgot>Did you forget your password?</a> </div> <div class=\"alert alert-warning\" translate=global.messages.info.register> You don't have an account yet? <a href=#/register>Register a new account</a> </div> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/useraccount/password/password.html',
    "<div> <div class=row> <div class=\"col-md-8 col-md-offset-2\"> <h2 translate=password.title translate-values=\"{username: '{{account.login}}'}\">Password for [<b>{{account.login}}</b>]</h2> <div class=\"alert alert-success\" ng-show=success translate=password.messages.success> <strong>Password changed!</strong> </div> <div class=\"alert alert-danger\" ng-show=error translate=password.messages.error> <strong>An error has occurred!</strong> The password could not be changed. </div> <div class=\"alert alert-danger\" ng-show=doNotMatch translate=global.messages.error.dontmatch> The password and its confirmation do not match! </div> <form name=form role=form novalidate ng-submit=changePassword() show-validation> <div class=form-group> <label translate=global.form.newpassword>New password</label> <input type=password class=form-control name=password placeholder=\"{{'global.form.newpassword.placeholder' | translate}}\" ng-model=password ng-minlength=5 ng-maxlength=50 required> <div ng-show=\"form.password.$dirty && form.password.$invalid\"> <p class=help-block ng-show=form.password.$error.required translate=global.messages.validate.newpassword.required> Your password is required. </p> <p class=help-block ng-show=form.password.$error.minlength translate=global.messages.validate.newpassword.minlength> Your password is required to be at least 5 characters. </p> <p class=help-block ng-show=form.password.$error.maxlength translate=global.messages.validate.newpassword.maxlength> Your password cannot be longer than 50 characters. </p> </div> <password-strength-bar password-to-check=password></password-strength-bar> </div> <div class=form-group> <label translate=global.form.confirmpassword>New password confirmation</label> <input type=password class=form-control name=confirmPassword placeholder=\"{{'global.form.confirmpassword.placeholder' | translate}}\" ng-model=confirmPassword ng-minlength=5 ng-maxlength=50 required> <div ng-show=\"form.confirmPassword.$dirty && form.confirmPassword.$invalid\"> <p class=help-block ng-show=form.confirmPassword.$error.required translate=global.messages.validate.confirmpassword.required> Your confirmation password is required. </p> <p class=help-block ng-show=form.confirmPassword.$error.minlength translate=global.messages.validate.confirmpassword.minlength> Your confirmation password is required to be at least 5 characters. </p> <p class=help-block ng-show=form.confirmPassword.$error.maxlength translate=global.messages.validate.confirmpassword.maxlength> Your confirmation password cannot be longer than 50 characters. </p> </div> </div> <button type=submit ng-disabled=form.$invalid class=\"btn btn-primary\" translate=password.form.button>Save</button> </form> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/useraccount/register/register.html',
    "<div> <div class=row> <div class=\"col-md-8 col-md-offset-2\"> <h1 translate=register.title>Registration</h1> <div class=\"alert alert-success\" ng-show=success translate=register.messages.success> <strong>Registration saved!</strong> Please check your email for confirmation. </div> <div class=\"alert alert-danger\" ng-show=error translate=register.messages.error.fail> <strong>Registration failed!</strong> Please try again later. </div> <div class=\"alert alert-danger\" ng-show=errorUserExists translate=register.messages.error.userexists> <strong>Login name already registered!</strong> Please choose another one. </div> <div class=\"alert alert-danger\" ng-show=errorEmailExists translate=register.messages.error.emailexists> <strong>E-mail is already in use!</strong> Please choose another one. </div> <div class=\"alert alert-danger\" ng-show=doNotMatch translate=global.messages.error.dontmatch> The password and its confirmation do not match! </div> <form ng-show=!success name=form role=form novalidate ng-submit=register() show-validation> <div class=form-group> <label translate=global.form.username>Login</label> <input class=form-control name=login placeholder=\"{{'global.form.username.placeholder' | translate}}\" ng-model=registerAccount.login ng-minlength=1 ng-maxlength=50 ng-pattern=\"/^[a-z0-9]*$/\" required> <div ng-show=\"form.login.$dirty && form.login.$invalid\"> <p class=help-block ng-show=form.login.$error.required translate=register.messages.validate.login.required> Your login is required. </p> <p class=help-block ng-show=form.login.$error.minlength translate=register.messages.validate.login.minlength> Your login is required to be at least 1 character. </p> <p class=help-block ng-show=form.login.$error.maxlength translate=register.messages.validate.login.maxlength> Your login cannot be longer than 50 characters. </p> <p class=help-block ng-show=form.login.$error.pattern translate=register.messages.validate.login.pattern> Your login can only contain lower-case letters and digits. </p> </div> </div> <div class=form-group> <label translate=global.form.email>E-mail</label> <input type=email class=form-control name=email placeholder=\"{{'global.form.email.placeholder' | translate}}\" ng-model=registerAccount.email ng-minlength=5 ng-maxlength=100 required> <div ng-show=\"form.email.$dirty && form.email.$invalid\"> <p class=help-block ng-show=form.email.$error.required translate=global.messages.validate.email.required> Your e-mail is required. </p> <p class=help-block ng-show=form.email.$error.email translate=global.messages.validate.email.invalid> Your e-mail is invalid. </p> <p class=help-block ng-show=form.email.$error.minlength translate=global.messages.validate.email.minlength> Your e-mail is required to be at least 5 characters. </p> <p class=help-block ng-show=form.email.$error.maxlength translate=global.messages.validate.email.maxlength> Your e-mail cannot be longer than 100 characters. </p> </div> </div> <div class=form-group> <label translate=global.form.newpassword>New password</label> <input type=password class=form-control name=password placeholder=\"{{'global.form.newpassword.placeholder' | translate}}\" ng-model=registerAccount.password ng-minlength=5 ng-maxlength=50 required> <div ng-show=\"form.password.$dirty && form.password.$invalid\"> <p class=help-block ng-show=form.password.$error.required translate=global.messages.validate.newpassword.required> Your password is required. </p> <p class=help-block ng-show=form.password.$error.minlength translate=global.messages.validate.newpassword.minlength> Your password is required to be at least 5 characters. </p> <p class=help-block ng-show=form.password.$error.maxlength translate=global.messages.validate.newpassword.maxlength> Your password cannot be longer than 50 characters. </p> </div> <password-strength-bar password-to-check=registerAccount.password></password-strength-bar> </div> <div class=form-group> <label translate=global.form.confirmpassword>New password confirmation</label> <input type=password class=form-control name=confirmPassword placeholder=\"{{'global.form.confirmpassword.placeholder' | translate}}\" ng-model=confirmPassword ng-minlength=5 ng-maxlength=50 required> <div ng-show=\"form.confirmPassword.$dirty && form.confirmPassword.$invalid\"> <p class=help-block ng-show=form.confirmPassword.$error.required translate=global.messages.validate.confirmpassword.required> Your confirmation password is required. </p> <p class=help-block ng-show=form.confirmPassword.$error.minlength translate=global.messages.validate.confirmpassword.minlength> Your confirmation password is required to be at least 5 characters. </p> <p class=help-block ng-show=form.confirmPassword.$error.maxlength translate=global.messages.validate.confirmpassword.maxlength> Your confirmation password cannot be longer than 50 characters. </p> </div> </div> <button type=submit ng-disabled=form.$invalid class=\"btn btn-primary\" translate=register.form.button>Register</button> </form> <p></p> <div class=\"alert alert-warning\" translate=global.messages.info.authenticated> If you want to <a href=#/login>authenticate</a>, you can try the default accounts:<br>- Administrator (login=\"admin\" and password=\"admin\") <br>- User (login=\"user\" and password=\"user\"). </div> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/useraccount/reset/finish/reset.finish.html',
    "<div> <div class=row> <div class=\"col-md-4 col-md-offset-4\"> <h1 translate=reset.finish.title>Reset password</h1> <div class=\"alert alert-danger\" translate=reset.finish.messages.keymissing ng-show=keyMissing> <strong>The password reset key is missing.</strong> </div> <div class=\"alert alert-warning\" ng-hide=\"success || keyMissing\"> <p translate=reset.finish.messages.info>Choose a new password</p> </div> <div class=\"alert alert-danger\" ng-show=error> <p translate=reset.finish.messages.error>Your password couldn't be reset. Remember a password request is only valid for 24 hours.</p> </div> <div class=\"alert alert-success\" ng-show=success> <p translate=reset.finish.messages.success><strong>Your password has been reset.</strong> Please <a href=#/login>authenticate</a>.</p> </div> <div class=\"alert alert-danger\" ng-show=doNotMatch translate=global.messages.error.dontmatch> The password and its confirmation do not match! </div> <div ng-hide=keyMissing> <form ng-show=!success name=form role=form novalidate ng-submit=finishReset() show-validation> <div class=form-group> <label translate=global.form.newpassword>New password</label> <input type=password class=form-control name=password placeholder=\"{{'global.form.newpassword.placeholder' | translate}}\" ng-model=resetAccount.password ng-minlength=5 ng-maxlength=50 required> <div ng-show=\"form.password.$dirty && form.password.$invalid\"> <p class=help-block ng-show=form.password.$error.required translate=global.messages.validate.newpassword.required> Your password is required. </p> <p class=help-block ng-show=form.password.$error.minlength translate=global.messages.validate.newpassword.minlength> Your password is required to be at least 5 characters. </p> <p class=help-block ng-show=form.password.$error.maxlength translate=global.messages.validate.newpassword.maxlength> Your password cannot be longer than 50 characters. </p> </div> <password-strength-bar password-to-check=resetAccount.password></password-strength-bar> </div> <div class=form-group> <label translate=global.form.confirmpassword>New password confirmation</label> <input type=password class=form-control name=confirmPassword placeholder=\"{{'global.form.confirmpassword.placeholder' | translate}}\" ng-model=confirmPassword ng-minlength=5 ng-maxlength=50 required> <div ng-show=\"form.confirmPassword.$dirty && form.confirmPassword.$invalid\"> <p class=help-block ng-show=form.confirmPassword.$error.required translate=global.messages.validate.confirmpassword.required> Your password confirmation is required. </p> <p class=help-block ng-show=form.confirmPassword.$error.minlength translate=global.messages.validate.confirmpassword.minlength> Your password confirmation is required to be at least 5 characters. </p> <p class=help-block ng-show=form.confirmPassword.$error.maxlength translate=global.messages.validate.confirmpassword.maxlength> Your password confirmation cannot be longer than 50 characters. </p> </div> </div> <button type=submit ng-disabled=form.$invalid class=\"btn btn-primary\" translate=reset.finish.form.button>Reset Password</button> </form> </div> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/useraccount/reset/request/reset.request.html',
    "<div> <div class=row> <div class=\"col-md-8 col-md-offset-2\"> <h1 translate=reset.request.title>Reset your password</h1> <div class=\"alert alert-danger\" translate=reset.request.messages.notfound ng-show=errorEmailNotExists> <strong>E-Mail address isn't registered!</strong> Please check and try again. </div> <div class=\"alert alert-warning\" ng-hide=success> <p translate=reset.request.messages.info>Enter the e-mail address you used to register.</p> </div> <div class=\"alert alert-success\" ng-show=\"success == 'OK'\"> <p translate=reset.request.messages.success>Check your e-mails for details on how to reset your password.</p> </div> <form ng-show=!success name=form role=form novalidate ng-submit=requestReset() show-validation> <div class=form-group> <label translate=global.form.email>E-mail</label> <input type=email class=form-control name=email placeholder=\"{{'global.form.email.placeholder' | translate}}\" ng-model=resetAccount.email ng-minlength=5 ng-maxlength=100 required> <div ng-show=\"form.email.$dirty && form.email.$invalid\"> <p class=help-block ng-show=form.email.$error.required translate=global.messages.validate.email.required> Your e-mail is required. </p> <p class=help-block ng-show=form.email.$error.email translate=global.messages.validate.email.invalid> Your e-mail is invalid. </p> <p class=help-block ng-show=form.email.$error.minlength translate=global.messages.validate.email.minlength> Your e-mail is required to be at least 5 characters. </p> <p class=help-block ng-show=form.email.$error.maxlength translate=global.messages.validate.email.maxlength> Your e-mail cannot be longer than 100 characters. </p> </div> </div> <button type=submit ng-disabled=form.$invalid class=\"btn btn-primary\" translate=reset.request.form.button>Register</button> </form> </div> </div> </div>"
  );


  $templateCache.put('scripts/app/useraccount/settings/settings.html',
    "<div> <div class=row> <div class=\"col-md-8 col-md-offset-2\"> <h2 translate=settings.title translate-values=\"{username: '{{settingsAccount.login}}'} {account: '{{settingsAccount.currentAccount}}'}\">User settings for [<b>{{settingsAccount.login}} -- {{settingsAccount.currentAccount}}</b>]</h2> <div class=\"alert alert-success\" ng-show=success translate=settings.messages.success> <strong>Settings saved!</strong> </div> <div class=\"alert alert-danger\" ng-show=errorEmailExists translate=settings.messages.error.emailexists> <strong>E-mail is already in use!</strong> Please choose another one. </div> <div class=\"alert alert-danger\" ng-show=error translate=settings.messages.error.fail> <strong>An error has occurred!</strong> Settings could not be saved. </div> <form name=form role=form novalidate ng-submit=save() show-validation> <div class=form-group> <label translate=settings.form.firstname>First Name</label> <input class=form-control name=firstName placeholder=\"{{'settings.form.firstname.placeholder' | translate}}\" ng-model=settingsAccount.firstName ng-minlength=1 ng-maxlength=50 required maxlength=50> <div ng-show=\"form.firstName.$dirty && form.firstName.$invalid\"> <p class=help-block ng-show=form.firstName.$error.required translate=settings.messages.validate.firstname.required> Your first name is required. </p> <p class=help-block ng-show=form.firstName.$error.minlength translate=settings.messages.validate.firstname.minlength> Your first name is required to be at least 1 character. </p> <p class=help-block ng-show=form.firstName.$error.maxlength translate=settings.messages.validate.firstname.maxlength> Your first name cannot be longer than 50 characters. </p> </div> </div> <div class=form-group> <label translate=settings.form.lastname>Last Name</label> <input class=form-control name=lastName placeholder=\"{{'settings.form.lastname.placeholder' | translate}}\" ng-model=settingsAccount.lastName ng-minlength=1 ng-maxlength=50 required maxlength=50> <div ng-show=\"form.lastName.$dirty && form.lastName.$invalid\"> <p class=help-block ng-show=form.lastName.$error.required translate=settings.messages.validate.lastname.required> Your last name is required. </p> <p class=help-block ng-show=form.lastName.$error.minlength translate=settings.messages.validate.lastname.minlength> Your last name is required to be at least 1 character. </p> <p class=help-block ng-show=form.lastName.$error.maxlength translate=settings.messages.validate.lastname.maxlength> Your last name cannot be longer than 50 characters. </p> </div> </div> <div class=form-group> <label translate=global.form.email>E-mail</label> <input type=email class=form-control name=email placeholder=\"{{'global.form.email.placeholder' | translate}}\" ng-model=settingsAccount.email ng-minlength=5 ng-maxlength=100 required maxlength=100> <div ng-show=\"form.email.$dirty && form.email.$invalid\"> <p class=help-block ng-show=form.email.$error.required translate=global.messages.validate.email.required> Your e-mail is required. </p> <p class=help-block ng-show=form.email.$error.email translate=global.messages.validate.email.invalid> Your e-mail is invalid. </p> <p class=help-block ng-show=form.email.$error.minlength translate=global.messages.validate.email.minlength> Your e-mail is required to be at least 5 characters. </p> <p class=help-block ng-show=form.email.$error.maxlength translate=global.messages.validate.email.maxlength> Your e-mail cannot be longer than 100 characters. </p> </div> </div> <div class=form-group> <label translate=settings.form.language>Language</label> <select name=langKey class=form-control ng-model=settingsAccount.langKey ng-controller=LanguageController ng-options=\"code as (code | findLanguageFromKey) for code in languages\"></select> </div> <button type=submit ng-disabled=form.$invalid class=\"btn btn-primary\" translate=settings.form.button>Save</button> </form> </div> </div> </div>"
  );


  $templateCache.put('scripts/components/form/pager.html',
    "<nav> <ul class=mycontractApp-pager> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a href=#>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a href=#>&lt;</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a href=#>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a href=#>&gt;&gt;</a></li> </ul> </nav>"
  );


  $templateCache.put('scripts/components/form/pagination.html',
    "<nav> <ul class=mycontractApp-pagination> <li ng-show=\"links['first']\" ng-click=\"loadPage(links['first'])\"><a>&lt;&lt;</a></li> <li ng-show=\"links['prev']\" ng-click=\"loadPage(links['prev'])\"><a>&lt;</a></li> <li ng-show=\"page > 2\" ng-click=\"loadPage(page - 2)\"><a>{{page - 2}}</a></li> <li ng-show=\"page > 1\" ng-click=\"loadPage(page - 1)\"><a>{{page - 1}}</a></li> <li class=active><a>{{page}}</a></li> <li ng-show=\"page < links['last']\" ng-click=\"loadPage(page + 1)\"><a>{{page + 1}}</a></li> <li ng-show=\"page < links['last'] - 1\" ng-click=\"loadPage(page + 2)\"><a>{{page + 2}}</a></li> <li ng-show=\"links['next']\" ng-click=\"loadPage(links['next'])\"><a>&gt;</a></li> <li ng-show=\"links['last']\" ng-click=\"loadPage(links['last'])\"><a>&gt;&gt;</a></li> </ul> </nav>"
  );


  $templateCache.put('scripts/components/navbar/navbar.html',
    "<nav class=\"navbar navbar-default navbar-fixed-top\" role=navigation> <div class=navbar-header> <button type=button class=navbar-toggle data-toggle=collapse data-target=#navbar-collapse> <span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span> </button> <a class=navbar-brand href=\"#/\"><span translate=global.title>myContract</span></a> </div> <div class=\"collapse navbar-collapse\" id=navbar-collapse ng-switch=isAuthenticated()> <ul class=\"nav navbar-nav nav-pills navbar-right\"> <li ui-sref-active=active ng-switch-when=true><a ui-sref=message><span class=\"glyphicon glyphicon-envelope icon-success\"></span> &#xA0;<span translate=global.menu.entities.message>message</span></a></li> <li class=\"dropdown pointer\" ng-switch-when=true> <a class=dropdown-toggle data-toggle=dropdown href=\"\"> <span> <span class=\"glyphicon glyphicon-alert icon-success\"></span> <!--<i class=\"fa fa-camera-retro fa-lg\"></i>--> <span class=hidden-tablet translate=global.menu.alert> Alert </span> <b class=caret></b> </span> </a> </li> <li ng-class=\"{active: $state.includes('admin')}\" ng-switch-when=true has-role=ROLE_ADMIN class=\"dropdown pointer\"> <a class=dropdown-toggle data-toggle=dropdown href=\"\"> <span> <span class=\"glyphicon glyphicon-tower icon-success\"></span> <span class=hidden-tablet translate=global.menu.admin.main>Administration</span> <b class=caret></b> </span> </a> <ul class=dropdown-menu> <li ui-sref-active=active><a ui-sref=account><span class=\"glyphicon glyphicon-asterisk icon-success\"></span> &#xA0;<span translate=global.menu.entities.account>Account</span></a></li> <li ui-sref-active=active><a ui-sref=department><span class=\"glyphicon glyphicon-asterisk icon-success\"></span> &#xA0;<span translate=global.menu.entities.department>Department</span></a></li> <li ui-sref-active=active><a ui-sref=role><span class=\"glyphicon glyphicon-cog icon-success\"></span> &#xA0;<span translate=global.menu.admin.role>Role</span></a></li> <li ui-sref-active=active><a ui-sref=user><span class=\"glyphicon glyphicon-user icon-success\"></span> &#xA0;<span translate=global.menu.admin.user>User</span></a></li> <li ui-sref-active=active><a ui-sref=authority><span class=\"glyphicon glyphicon-certificate icon-success\"></span> &#xA0;<span translate=global.menu.admin.authority>Authority</span></a></li> </ul> </li> <li ng-class=\"{active: $state.includes('system')}\" ng-switch-when=true has-role=ROLE_ADMIN class=\"dropdown pointer\"> <a class=dropdown-toggle data-toggle=dropdown href=\"\"> <span> <span class=\"glyphicon glyphicon-info-sign icon-success\"></span> <span class=hidden-tablet translate=global.menu.system.main>System</span> <b class=caret></b> </span> </a> <ul class=dropdown-menu> <li ui-sref-active=active><a ui-sref=metrics><span class=\"glyphicon glyphicon-dashboard icon-success\"></span> &#xA0;<span translate=global.menu.system.metrics>Metrics</span></a></li> <li ui-sref-active=active><a ui-sref=health><span class=\"glyphicon glyphicon-heart icon-success\"></span> &#xA0;<span translate=global.menu.system.health>Health</span></a></li> <li ui-sref-active=active><a ui-sref=configuration><span class=\"glyphicon glyphicon-list-alt icon-success\"></span> &#xA0;<span translate=global.menu.system.configuration>Configuration</span></a></li> <li ui-sref-active=active><a ui-sref=audits><span class=\"glyphicon glyphicon-bell icon-success\"></span> &#xA0;<span translate=global.menu.system.audits>Audits</span></a></li> <li ui-sref-active=active><a ui-sref=logs><span class=\"glyphicon glyphicon-tasks icon-success\"></span> &#xA0;<span translate=global.menu.system.logs>Logs</span></a></li> <li ui-sref-active=active><a ui-sref=docs><span class=\"glyphicon glyphicon-book icon-success\"></span> &#xA0;<span translate=global.menu.system.apidocs>API</span></a></li> </ul> </li> <li ng-class=\"{active: $state.includes('useraccount')}\" class=\"dropdown pointer\" ng-switch-when=true> <a class=dropdown-toggle data-toggle=dropdown href=\"\"> <span> <span class=\"glyphicon glyphicon-user icon-success\"></span> <span class=hidden-tablet translate=global.menu.useraccount.main>You</span> <b class=caret></b> </span> </a> <ul class=dropdown-menu> <li ui-sref-active=active><a ui-sref=settings><span class=\"glyphicon glyphicon-wrench icon-success\"></span> &#xA0;<span translate=global.menu.useraccount.settings>Settings</span></a></li> <li ui-sref-active=active><a ui-sref=password><span class=\"glyphicon glyphicon-lock icon-success\"></span> &#xA0;<span translate=global.menu.useraccount.password>Password</span></a></li> <li ui-sref-active=active><a ui-sref=logout><span class=\"glyphicon glyphicon-log-out icon-success\"></span> &#xA0;<span translate=global.menu.useraccount.logout>Log out</span></a></li> <li ui-sref-active=active ng-switch-when=false><a ui-sref=login><span class=\"glyphicon glyphicon-log-in icon-success\"></span> &#xA0;<span translate=global.menu.useraccount.login>Authenticate</span></a></li> <li ui-sref-active=active ng-switch-when=false><a ui-sref=register><span class=\"glyphicon glyphicon-plus-sign icon-success\"></span> &#xA0;<span translate=global.menu.useraccount.register>Register</span></a></li> </ul> </li> </ul> </div> </nav> <div class=\"navbar-default sidebar\" role=navigation style=\"margin-top: 20px\"> <div class=\"sidebar-nav navbar-collapse\" ng-switch=isAuthenticated()> <ul class=nav id=side-menu ng-switch-when=true> <li class=sidebar-search> <div class=\"input-group custom-search-form\"> <input class=form-control placeholder=Search...> <span class=input-group-btn> <button class=\"btn btn-default\" type=button> <i class=\"glyphicon glyphicon-search icon-success\"></i> </button> </span> </div> <!-- /input-group --> </li> <li ui-sref-active=active> <a ui-sref=dashboard> <span class=\"glyphicon glyphicon-dashboard icon-success\"></span> <span translate=global.menu.dashboard>Dashboard</span> </a> </li> <li ng-if=\"showElement('STANDARD,ADVANCED')\" ui-sref-active=active has-any-role=ROLE_ADMIN,ROLE_EXECUTIVE> <a ui-sref=project> <span class=\"glyphicon glyphicon-th-list icon-success\"></span> <span translate=global.menu.project>Project</span> </a> </li> <li ng-if=\"showElement('STANDARD,ADVANCED')\" ui-sref-active=active has-any-role=ROLE_ADMIN,ROLE_EXECUTIVE> <a ui-sref=category> <span class=\"glyphicon glyphicon-list-alt\"></span> <span translate=global.menu.category>Category</span> </a> </li> <!--\n" +
    "            <li ui-sref-active=\"active\">\n" +
    "                <a ui-sref=\"contract\">\n" +
    "                    <span class=\"glyphicon glyphicon-file\"></span>\n" +
    "                    <span translate=\"global.menu.contract\">Contract</span>\n" +
    "                </a>\n" +
    "            </li>\n" +
    "            --> <li ui-sref-active=active class=\"dropdown pointer\"> <a class=dropdown-toggle data-toggle=dropdown href=\"\"> <span> <span class=\"glyphicon glyphicon-file\"></span> <span translate=global.menu.contract.main>Contract</span> <b class=caret></b> </span> </a> <ul class=dropdown-menu> <li class=nav-second-level><a ui-sref=contract><span class=\"fa fa-gears\"></span> &#xA0;<span translate=global.menu.contract.mine>My Contracts</span></a></li> <li class=nav-second-level><a ui-sref=contract.new><span class=\"fa fa-chain\"></span> &#xA0;<span translate=global.menu.contract.new>Create A Contract</span></a></li> <li class=nav-second-level><a ui-sref=contract.search><span class=\"fa fa-search\"></span> &#xA0;<span translate=global.menu.contract.search>Search Contracts</span></a></li> <li class=nav-second-level><a ui-sref=contract.statistics><span class=\"fa fa-line-chart\"></span> &#xA0;<span translate=global.menu.contract.statistics>Contracts Statistics</span></a></li> </ul> </li> <li ng-if=\"showElement('ADVANCED')\" ui-sref-active=active> <a ui-sref=task> <span class=\"glyphicon glyphicon-tasks\"></span> <span translate=global.menu.task>Task</span> </a> </li> <li ui-sref-active=active has-any-role=ROLE_ADMIN,ROLE_EXECUTIVE> <a ui-sref=contract_party> <span class=\"fa fa-external-link\"></span> <span translate=global.menu.contract_party>contract_party</span> </a> </li> <li ng-if=\"$root.showElement('ADVANCED')\" ui-sref-active=active class=\"dropdown pointer\" has-any-role=ROLE_ADMIN,ROLE_EXECUTIVE> <a class=dropdown-toggle data-toggle=dropdown href=\"\"> <span> <span class=\"glyphicon glyphicon-th-list\"></span> <span class=hidden-tablet translate=global.menu.configurations.main> Configurations </span> <b class=caret></b> </span> </a> <ul class=dropdown-menu> <li ui-sref-active=active><a ui-sref=process><span class=\"fa fa-gears\"></span> &#xA0;<span translate=global.menu.configurations.process>process</span></a></li> <li ui-sref-active=active><a ui-sref=workflow><span class=\"fa fa-chain\"></span> &#xA0;<span translate=global.menu.configurations.workflow>workflow</span></a></li> <li ui-sref-active=active><a ui-sref=contract_sample><span class=\"fa fa-upload\"></span> &#xA0;<span translate=global.menu.configurations.contract_sample>contract_sample</span></a></li> <li ui-sref-active=active><a ui-sref=fund_source><span class=\"fa fa-money\"></span> &#xA0;<span translate=global.menu.configurations.fund_source>fund_source</span></a></li> </ul> </li> </ul> </div> </div>"
  );


  $templateCache.put('scripts/components/navbar/navbar2.html',
    "<!-- Navigation --> <nav class=\"navbar navbar-default navbar-static-top\" role=navigation style=\"margin-bottom: 0\"> <div class=navbar-header> <button type=button class=navbar-toggle data-toggle=collapse data-target=.navbar-collapse> <span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span> </button> <a class=navbar-brand href=index.html>Admin</a> </div> <!-- /.navbar-header --> <ul class=\"nav navbar-top-links navbar-right\"> <li class=dropdown> <a class=dropdown-toggle data-toggle=dropdown href=#> <i class=\"fa fa-envelope fa-fw\"></i> <i class=\"fa fa-caret-down\"></i> </a> <ul class=\"dropdown-menu dropdown-messages\"> <li> <a href=#> <div> <strong>John Smith</strong> <span class=\"pull-right text-muted\"> <em>Yesterday</em> </span> </div> <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...</div> </a> </li> <li class=divider></li> <li> <a href=#> <div> <strong>John Smith</strong> <span class=\"pull-right text-muted\"> <em>Yesterday</em> </span> </div> <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...</div> </a> </li> <li class=divider></li> <li> <a href=#> <div> <strong>John Smith</strong> <span class=\"pull-right text-muted\"> <em>Yesterday</em> </span> </div> <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...</div> </a> </li> <li class=divider></li> <li> <a class=text-center href=#> <strong>Read All Messages</strong> <i class=\"fa fa-angle-right\"></i> </a> </li> </ul> <!-- /.dropdown-messages --> </li> <!-- /.dropdown --> <li class=dropdown> <a class=dropdown-toggle data-toggle=dropdown href=#> <i class=\"fa fa-tasks fa-fw\"></i> <i class=\"fa fa-caret-down\"></i> </a> <ul class=\"dropdown-menu dropdown-tasks\"> <li> <a href=#> <div> <p> <strong>Task 1</strong> <span class=\"pull-right text-muted\">40% Complete</span> </p> <div class=\"progress progress-striped active\"> <div class=\"progress-bar progress-bar-success\" role=progressbar aria-valuenow=40 aria-valuemin=0 aria-valuemax=100 style=\"width: 40%\"> <span class=sr-only>40% Complete (success)</span> </div> </div> </div> </a> </li> <li class=divider></li> <li> <a href=#> <div> <p> <strong>Task 2</strong> <span class=\"pull-right text-muted\">20% Complete</span> </p> <div class=\"progress progress-striped active\"> <div class=\"progress-bar progress-bar-info\" role=progressbar aria-valuenow=20 aria-valuemin=0 aria-valuemax=100 style=\"width: 20%\"> <span class=sr-only>20% Complete</span> </div> </div> </div> </a> </li> <li class=divider></li> <li> <a href=#> <div> <p> <strong>Task 3</strong> <span class=\"pull-right text-muted\">60% Complete</span> </p> <div class=\"progress progress-striped active\"> <div class=\"progress-bar progress-bar-warning\" role=progressbar aria-valuenow=60 aria-valuemin=0 aria-valuemax=100 style=\"width: 60%\"> <span class=sr-only>60% Complete (warning)</span> </div> </div> </div> </a> </li> <li class=divider></li> <li> <a href=#> <div> <p> <strong>Task 4</strong> <span class=\"pull-right text-muted\">80% Complete</span> </p> <div class=\"progress progress-striped active\"> <div class=\"progress-bar progress-bar-danger\" role=progressbar aria-valuenow=80 aria-valuemin=0 aria-valuemax=100 style=\"width: 80%\"> <span class=sr-only>80% Complete (danger)</span> </div> </div> </div> </a> </li> <li class=divider></li> <li> <a class=text-center href=#> <strong>See All Tasks</strong> <i class=\"fa fa-angle-right\"></i> </a> </li> </ul> <!-- /.dropdown-tasks --> </li> <!-- /.dropdown --> <li class=dropdown> <a class=dropdown-toggle data-toggle=dropdown href=#> <i class=\"fa fa-bell fa-fw\"></i> <i class=\"fa fa-caret-down\"></i> </a> <ul class=\"dropdown-menu dropdown-alerts\"> <li> <a href=#> <div> <i class=\"fa fa-comment fa-fw\"></i> New Comment <span class=\"pull-right text-muted small\">4 minutes ago</span> </div> </a> </li> <li class=divider></li> <li> <a href=#> <div> <i class=\"fa fa-twitter fa-fw\"></i> 3 New Followers <span class=\"pull-right text-muted small\">12 minutes ago</span> </div> </a> </li> <li class=divider></li> <li> <a href=#> <div> <i class=\"fa fa-envelope fa-fw\"></i> Message Sent <span class=\"pull-right text-muted small\">4 minutes ago</span> </div> </a> </li> <li class=divider></li> <li> <a href=#> <div> <i class=\"fa fa-tasks fa-fw\"></i> New Task <span class=\"pull-right text-muted small\">4 minutes ago</span> </div> </a> </li> <li class=divider></li> <li> <a href=#> <div> <i class=\"fa fa-upload fa-fw\"></i> Server Rebooted <span class=\"pull-right text-muted small\">4 minutes ago</span> </div> </a> </li> <li class=divider></li> <li> <a class=text-center href=#> <strong>See All Alerts</strong> <i class=\"fa fa-angle-right\"></i> </a> </li> </ul> <!-- /.dropdown-alerts --> </li> <!-- /.dropdown --> <li class=dropdown> <a class=dropdown-toggle data-toggle=dropdown href=#> <i class=\"fa fa-user fa-fw\"></i> <i class=\"fa fa-caret-down\"></i> </a> <ul class=\"dropdown-menu dropdown-user\"> <li><a href=#><i class=\"fa fa-user fa-fw\"></i> User Profile</a> </li> <li><a href=#><i class=\"fa fa-gear fa-fw\"></i> Settings</a> </li> <li class=divider></li> <li><a href=login.html><i class=\"fa fa-sign-out fa-fw\"></i> Logout</a> </li> </ul> <!-- /.dropdown-user --> </li> <!-- /.dropdown --> </ul> <!-- /.navbar-top-links --> <div class=\"navbar-default sidebar\" role=navigation> <div class=\"sidebar-nav navbar-collapse\"> <ul class=nav id=side-menu> <li class=sidebar-search> <div class=\"input-group custom-search-form\"> <input class=form-control placeholder=Search...> <span class=input-group-btn> <button class=\"btn btn-default\" type=button> <i class=\"fa fa-search\"></i> </button> </span> </div> <!-- /input-group --> </li> <li> <a href=#main><i class=\"fa fa-dashboard fa-fw\"></i> Dashboard</a> </li> <li> <a href=#><i class=\"fa fa-bar-chart-o fa-fw\"></i> Charts<span class=\"fa arrow\"></span></a> <ul class=\"nav nav-second-level\"> <li> <a href=#flot>Flot Charts</a> </li> <li> <a href=#morris>Morris.js Charts</a> </li> </ul> <!-- /.nav-second-level --> </li> <li> <a href=#tables><i class=\"fa fa-table fa-fw\"></i> Tables</a> </li> <li> <a href=#forms><i class=\"fa fa-edit fa-fw\"></i> Forms</a> </li> <li> <a href=#><i class=\"fa fa-wrench fa-fw\"></i> UI Elements<span class=\"fa arrow\"></span></a> <ul class=\"nav nav-second-level\"> <li> <a href=#panels-wells>Panels and Wells</a> </li> <li> <a href=#buttons>Buttons</a> </li> <li> <a href=#notifications>Notifications</a> </li> <li> <a href=#typography>Typography</a> </li> <li> <a href=#icons> Icons</a> </li> <li> <a href=#grid>Grid</a> </li> </ul> <!-- /.nav-second-level --> </li> <li> <a href=#><i class=\"fa fa-sitemap fa-fw\"></i> Multi-Level Dropdown<span class=\"fa arrow\"></span></a> <ul class=\"nav nav-second-level\"> <li> <a href=#>Second Level Item</a> </li> <li> <a href=#>Second Level Item</a> </li> <li> <a href=#>Third Level <span class=\"fa arrow\"></span></a> <ul class=\"nav nav-third-level\"> <li> <a href=#>Third Level Item</a> </li> <li> <a href=#>Third Level Item</a> </li> <li> <a href=#>Third Level Item</a> </li> <li> <a href=#>Third Level Item</a> </li> </ul> <!-- /.nav-third-level --> </li> </ul> <!-- /.nav-second-level --> </li> <li> <a href=#><i class=\"fa fa-files-o fa-fw\"></i> Sample Pages<span class=\"fa arrow\"></span></a> <ul class=\"nav nav-second-level\"> <li> <a href=#blank>Blank Page</a> </li> <li> <a href=#login>Login Page</a> </li> </ul> <!-- /.nav-second-level --> </li> </ul> </div> <!-- /.sidebar-collapse --> </div> <!-- /.navbar-static-side --> </nav>"
  );

}]);
