'use strict';

window.loadingScreen = window.pleaseWait({
        logo: 'assets/images/header.png',
        backgroundColor: '#FFFFFF',
        loadingHtml: '' +
        '<p class="text-primary text-bold">Loading</p>' +
        '<div class="spinner">' +
        '<div class="rect1"></div><div class="rect2"></div><div class="rect3"></div>' +
        '<div class="rect4"></div><div class="rect5"></div>' +
        '</div>'
});
'use strict';

if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (prefix) { // eslint-disable-line no-extend-native
        return this.indexOf(prefix) === 0;
    };
}

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (suffix) { // eslint-disable-line no-extend-native
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}
/* global angular */
(function () {
    'use strict';

    angular
        .module('flexget', [
            'ngCookies',
            'ngMaterial',
            'ngMessages',
            'ngSanitize',

            'angular-loading-bar',
            'http-etag',
            
            'blocks.error',
            'blocks.exception',
            'blocks.router',
            'blocks.urlInterceptor',

            'flexget.components',
            'flexget.directives',
            'flexget.plugins',

            'ui.router'
        ]);

    function bootstrapApplication() {
        /* Bootstrap app after page has loaded which allows plugins to register */
        angular.element(document).ready(function () {
            angular.bootstrap(document, ['flexget']);
        });
        window.loadingScreen.finish();
    }

    bootstrapApplication();
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('flexget.components', [
            'components.404',
            'components.auth',
            'components.core',
            'components.home',
            'components.sidenav',
            'components.toolbar',
            'components.user',
            'components.database'
        ]);
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('flexget.plugins', []);
}());

//Global function used to inject plugins as dependencies
function registerPlugin(plugin) { // eslint-disable-line no-unused-vars
    angular.module('flexget.plugins').requires.push(plugin);
}
/* global angular */
(function () {
    'use strict';

    schemaService.$inject = ["$http"];
    angular.module('flexget.services')
        .service('schema', schemaService);

    function schemaService($http) {
        this.get = function (path) {
            // TODO: Add cache?

            if (!path.endsWith('/')) {
                path = path + '/';
            }
            return $http.get('/api/schema/' + path)
                .then(
                function (response) {
                    return response.data;
                },
                function (httpError) {
                    throw httpError.status + ' : ' + httpError.data;
                });
        };

        this.config = function (name) {
            return this.get('config/' + name);
        };

        this.plugin = function (name) {
            return this.get('config/' + name);
        };
    }

});
/* global angular */
(function () {
    'use strict';

    angular
        .module('blocks.error', [
            'ngMaterial',
            'ngclipboard'
        ]);
}());
/* global angular*/
(function () {
    'use strict';

    errorDialogController.$inject = ["$mdDialog"];
    angular
        .module('blocks.error')
        .component('errorDialog', {
            templateUrl: 'blocks/error/error-dialog.tmpl.html',
            controller: errorDialogController,
            controllerAs: 'vm',
            bindings: {
                error: '<'
            }
        });

    function errorDialogController($mdDialog) {
        var vm = this;

        vm.close = close;

        function close() {
            $mdDialog.hide();
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    errorService.$inject = ["$mdToast", "$mdDialog"];
    angular
        .module('blocks.error')
        .factory('errorService', errorService);

    function errorService($mdToast, $mdDialog) {
        var toast = $mdToast.simple()
            .textContent('Well, this is awkward...')
            .action('Details')
            .highlightAction(true)
            .position('bottom right')
            .hideDelay(5000);

        //TODO: Would be good if ngMaterial supports opening components by name: https://github.com/angular/material/issues/8409#issuecomment-220759188
        var dialog = {
            template: '<error-dialog error=\'vm.error\'></error-dialog>',
            bindToController: true,
            controllerAs: 'vm',
            controller: function () { }
        };

        return {
            showToast: showToast,
            showDialog: showDialog
        };

        function showToast(error) {
            $mdToast.show(toast).then(function (response) {
                if (response === 'ok') {
                    showDialog(error);
                }
            });
        }

        //TODO: Test
        function showDialog(error) {
            dialog.locals = {
                error: error
            };

            $mdDialog.show(dialog);
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('blocks.exception', [
            'blocks.error'
        ]);
}());
/* global angular */
(function () {
    'use strict';

    exception.$inject = ["$log", "$q", "errorService"];
    angular
        .module('blocks.exception')
        .factory('exception', exception);

    function exception($log, $q, errorService) {
        return {
            catcher: catcher
        };

        function catcher(error) {
            //Don't show toast when request failed because of auth problems
            // 401 && 403 -> Authentication problems (session expired, not logged in, ...)
            // 304 -> Cached data
            if (error.status !== 401 && error.status !== 403 && error.status !== 304) {
                $log.log(error.data.message);

                //TODO: Check if this needs to improve
                // return function(e) {
                /*var thrownDescription;
                var newMessage;
                if (e.data && e.data.description) {
                  thrownDescription = '\n' + e.data.description;
                  newMessage = message + thrownDescription;
                }

                e.data.description = newMessage;*/

                errorService.showToast(error.data);
            }

            return $q.reject(error.data);
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('blocks.pagination', [
            'ig.linkHeaderParser'
        ]);
}());
/* global angular */
(function () {
    'use strict';
    
    paginationController.$inject = ["linkHeaderParser"];
    angular
        .module('blocks.pagination')
        .component('fgPagination', {
            templateUrl: 'blocks/pagination/pagination.tmpl.html',
            controllerAs: 'vm',
            controller: paginationController,
            bindings: {
                loadData: '&',
                linkHeader: '<',
                currentPage: '<'
            }
        });
    
    function paginationController(linkHeaderParser) {
        var vm = this;

        vm.linkGroupFirst = linkGroupFirst;
        vm.linkGroupLast = linkGroupLast;
        vm.setPage = setPage;
        vm.$onChanges = handleChanges;
        
        function handleChanges(changesObj) {
            if (changesObj.linkHeader) {
                var links = changesObj.linkHeader.currentValue ? linkHeaderParser.parse(vm.linkHeader) : {};

                vm.prev = links.prev;
                vm.next = links.next;
                vm.last = links.last;
            }
        }

        function linkGroupFirst() {
            var rightDebt = vm.last ? Math.max(0,
                +vm.currentPage - (+vm.last.page - 2)) : 0;
            return Math.max(1, +vm.currentPage - rightDebt - 2);
        }
        
        function linkGroupLast() {
            var leftDebt = Math.max(0,
                1 + 2 - (+vm.currentPage));
            return Math.min(vm.last ? +vm.last.page : 0, +vm.currentPage + leftDebt + 2);
        }

        function setPage(page) {
            if (page !== vm.currentPage) {
                vm.loadData({ page: page });
            }
        }
    }
})();
/* global angular */
(function () {
    'use strict';
    
    angular
        .module('blocks.pagination')
        .filter('makeRange', makeRangeFilter);
    
    function makeRangeFilter() {
        return function (input) {
            var lowBound = parseInt(input[0], 10);
            var highBound = parseInt(input[1], 10);

            var result = [];

            for (var i = lowBound; i <= highBound; i++) { result.push(i); }
            return result;
        };
    }
})();
/* global angular */
(function () {
    'use strict';

    angular
        .module('blocks.router', [
            'ui.router'
        ]);
}());
/* global angular */
(function () {
    'use strict';

    routerHelperProvider.$inject = ["$stateProvider", "$urlRouterProvider", "$windowProvider"];
    angular
        .module('blocks.router')
        .provider('routerHelper', routerHelperProvider);

    function routerHelperProvider($stateProvider, $urlRouterProvider, $windowProvider) {
        RouterHelper.$inject = ["$location", "$log", "$rootScope", "$state"];
        var $window = $windowProvider.$get();
        if (!($window.history && $window.history.pushState)) {
            $window.location.hash = '/';
        }

        //TODO: Figure out if htlm5Mode is possible
        //$locationProvider.html5Mode(true);

        this.configureStates = configureStates;
        this.$get = RouterHelper;

        var hasOtherwise = false;

        function configureStates(states, otherwisePath) {
            angular.forEach(states, function (state) {
                if (!state.config.root && !state.config.abstract) {
                    state.state = 'flexget.' + state.state;
                    state.config.template = '<' + state.config.component + ' flex layout="row"></' + state.config.component + '>';
                    delete state.config.component;
                }
                $stateProvider.state(state.state, state.config);

                if (state.when) {
                    for (var i = 0; i < state.when.length; i++) {
                        $urlRouterProvider.when(state.when[i], state.config.url);
                    }
                }
            });

            if (otherwisePath && !hasOtherwise) {
                hasOtherwise = true;
                $urlRouterProvider.otherwise(otherwisePath);
            }
        }

        function RouterHelper($location, $log, $rootScope, $state) {
            //var handlingStateChangeError = false;
            
            return {
                //configureStates: function () { },
                getStates: getStates
            };


            //init()

            /*function handleRoutingErrors() {
                //TODO: Convert to UI-router v1 (using transition.start etc.)
                $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                    if (handlingStateChangeError) {
                        return;
                    }

                    var destination = (toState &&
                        (toState.title || toState.name || toState.loadedTemplateUrl)) ||
                        'unknown target';

                    var msg = 'Error routing to ' + destination + '. ' +
                        (error.data || '') + '. <br/>' + (error.statusText || '') +
                        ': ' + (error.status || '');

                    $log.log(msg);


                    handlingStateChangeError = true;
                    $location.path('/');

                    //TODO: Maybe add some logging here to indicate the routing failed
                });
            }*/

            //TODO: Check if needed to be re-enabled
            /*function init() {
                handleRoutingErrors();
            }*/

            function getStates() {
                return $state.get();
            }
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('blocks.urlInterceptor', []);
}());
/* global angular */
(function () {
    'use strict';

    configInterceptor.$inject = ["$httpProvider"];
    angular
        .module('blocks.urlInterceptor')
        .config(configInterceptor);

    function configInterceptor($httpProvider) {
        $httpProvider.interceptors.push('urlInterceptor');
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('blocks.urlInterceptor')
        .factory('urlInterceptor', urlInterceptor);

    function urlInterceptor() {
        return {
            request: request
        };

        function request(config) {
            // Make sure api requests end with /
            if (config.url.contains('api') && !config.url.endsWith('/')) {
                config.url += '/';
            }

            // Make sure requests don't start with / (so it's able to use base_url)            
            if (config.url.contains('api') && config.url.startsWith('/')) {
                config.url = config.url.substring(1);
            }

            return config;
        }
    }
}());

/* global angular */
(function () {
    'use strict';

    angular
        .module('components.404', [
            'blocks.router'
        ]);
}());
/* global angular */
(function () {
    'use strict';

    notFoundController.$inject = ["$state"];
    angular
        .module('components.404')
        .component('notFound', {
            templateUrl: 'components/404/404.tmpl.html',
            controllerAs: 'vm',
            controller: notFoundController
        });

    function notFoundController($state) {
        var vm = this;

        vm.goHome = goHome;

        function goHome() {
            $state.go('flexget.home');
        }
    }
}());

/* global angular */
(function () {
    'use strict';

    notfoundConfig.$inject = ["routerHelperProvider"];
    angular
        .module('components.404')
        .config(notfoundConfig);

    function notfoundConfig(routerHelperProvider) {
        routerHelperProvider.configureStates(getStates(), '/404');
    }

    function getStates() {
        return [
            {
                state: '404',
                config: {
                    url: '/404',
                    component: 'notFound',
                    root: true
                }
            }
        ];
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('components.auth', [
            'blocks.exception',
            'blocks.router',
            'components.toolbar'
        ]);
}());
/* global angular*/
(function () {
    'use strict';

    authenticationSetup.$inject = ["$rootScope", "$state", "$transitions", "authService"];
    authInterceptor.$inject = ["$injector", "$q", "$rootScope", "$state"];
    authenticationConfig.$inject = ["$httpProvider"];
    angular
        .module('components.auth')
        .run(authenticationSetup)
        .factory('authInterceptor', authInterceptor)
        .config(authenticationConfig);

    function authenticationSetup($rootScope, $state, $transitions, authService) {
        $rootScope.$on('event:auth-loginRequired', function (event, timeout) {
            $state.go('login', { timeout: timeout });
        });

        /* Ensure user is authenticated when changing states (pages) unless we are on the login page */
        $transitions.onBefore({ to: 'flexget.*' }, function ($transition$) {
            authService.loggedIn()
                .catch(function () {
                    authService.state($transition$.to(), $transition$.params());
                    $rootScope.$broadcast('event:auth-loginRequired', false);
                });
        });
    }

    function authenticationConfig($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    }

    function authInterceptor($injector, $q, $rootScope, $state) {
        /* Intercept 401/403 http return codes and redirect to login page */
        return {
            responseError: responseError
        };

        function loginRequired() {
            var authService = $injector.get('authService');
            authService.state($state.current, $state.params);
            $rootScope.$broadcast('event:auth-loginRequired', true);
        }

        function responseError(rejection) {
            if (!rejection.config.ignoreAuthModule) {
                switch (rejection.status) {
                    case 401:
                    case 403:
                        loginRequired();
                        break;
                }
            }
            return $q.reject(rejection);
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    authService.$inject = ["$http", "$q", "$state", "exception"];
    angular
        .module('components.auth')
        .factory('authService', authService);

    function authService($http, $q, $state, exception) {
        var isLoggedIn, prevState, prevParams;

        isLoggedIn = false;

        return {
            loggedIn: loggedIn,
            login: login,
            logout: logout,
            state: state
        };

        //TODO: Implement idling system, that resets the isLoggedIn variable from the authservice


        //TODO: Test this function
        function loggedIn() {
            var def = $q.defer();

            if (isLoggedIn) {
                def.resolve(isLoggedIn);
            } else {
                $http.get('/api/server/version/', {
                    ignoreAuthModule: true
                })
                    .then(function () {
                        isLoggedIn = true;
                        def.resolve();
                    }, function () {
                        def.reject();
                    });
            }

            return def.promise;
        }

        function login(credentials, remember) {
            if (!remember) {
                remember = false;
            }

            return $http.post('/api/auth/login/', credentials,
                {
                    params: { remember: remember },
                    ignoreAuthModule: true
                })
                .then(loginComplete)
                .catch(loginCallFailed);

            function loginComplete() {
                isLoggedIn = true;
                if(prevState) {
                    $state.go(prevState, prevParams);
                } else {
                    $state.go('flexget.home');
                }
                return;
            }

            function loginCallFailed(error) {
                return $q.reject(error.data);
            }
        }

        function logout() {
            return $http.post('/api/auth/logout/')
                .then(logoutComplete)
                .catch(callFailed);

            function logoutComplete() {
                isLoggedIn = false;
                prevState = null;
                prevParams = null;
                $state.go('login');
                return;
            }
        }

        function state(state, params) {
            if (state.name !== 'login') {
                prevState = state.name;
                prevParams = params;
            }
        }

        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());

/* global angular */
(function () {
    'use strict';

    loginController.$inject = ["$stateParams", "authService"];
    angular
        .module('components.auth')
        .component('login', {
            templateUrl: 'components/auth/login.tmpl.html',
            controllerAs: 'vm',
            controller: loginController
        });

    function loginController($stateParams, authService) {
        var vm = this;

        vm.timeout = $stateParams.timeout;
        vm.login = login;
        vm.credentials = {};

        function login() {
            authService.login(vm.credentials, vm.remember)
                .catch(function (data) {
                    vm.credentials.password = '';
                    if (data.message) {
                        vm.error = data.message;
                    } else {
                        vm.error = 'Error during authentication';
                    }
                });
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    authConfig.$inject = ["routerHelperProvider", "toolbarHelperProvider", "authServiceProvider"];
    angular
        .module('components.auth')
        .config(authConfig);

    function authConfig(routerHelperProvider, toolbarHelperProvider, authServiceProvider) {
        routerHelperProvider.configureStates(getStates());

        var authService = authServiceProvider.$get();
       
        var logoutItem = {
            menu: 'Manage',
            type: 'menuItem',
            label: 'Logout',
            icon: 'sign-out',
            action: authService.logout,
            order: 255
        };

         toolbarHelperProvider.registerItem(logoutItem);
    }

    function getStates() {
        return [
            {
                state: 'login',
                config: {
                    url: '/login',
                    component: 'login',
                    root: true,
                    params: {
                        timeout: false
                    }
                }
            }
        ];
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('components.core', [
            'ngMaterial',

            'http-etag',            
            'blocks.router'
        ]);
}());
/* global angular */
(function () {
    'use strict';

    coreConfig.$inject = ["$httpProvider", "$mdThemingProvider", "httpEtagProvider"];
    angular
        .module('components.core')
        .config(coreConfig);

    function coreConfig($httpProvider, $mdThemingProvider, httpEtagProvider) {
        httpEtagProvider.setDefaultCacheConfig({
            cacheResponseHeaders: true
        })
            .defineCache('httpEtagCache');
        $httpProvider.useLegacyPromiseExtensions(false);

        $mdThemingProvider.theme('default')
            .primaryPalette('orange', {
                default: '800'
            })
            .accentPalette('deep-orange', {
                default: '500'
            })
            .warnPalette('amber');
    }

}());
/* global angular */
(function () {
    'use strict';

    flexTheme.$inject = ["$mdThemingProvider"];
    angular
        .module('components.core')
        .provider('flexTheme', flexTheme);

    function flexTheme($mdThemingProvider) {
        return {
            $get: function () {
                return {
                    getPaletteColor: function (paletteName, hue) {
                        if (
                            angular.isDefined($mdThemingProvider._PALETTES[paletteName])
                            && angular.isDefined($mdThemingProvider._PALETTES[paletteName][hue])
                        ) {
                            return $mdThemingProvider._PALETTES[paletteName][hue];
                        }
                    },
                    rgba: $mdThemingProvider._rgba,
                    palettes: $mdThemingProvider._PALETTES,
                    themes: $mdThemingProvider._THEMES,
                    parseRules: $mdThemingProvider._parseRules
                };
            }
        };
    }
}());
/* global angular */
(function () {
    'use strict';

    coreConfig.$inject = ["routerHelperProvider"];
    angular
        .module('components.core')
        .config(coreConfig);

    function coreConfig(routerHelperProvider) {
        routerHelperProvider.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'flexget',
                config: {
                    abstract: true,
                    templateUrl: 'layout.tmpl.html'
                }
            }
        ];
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('components.database', [
            'ngMaterial',
            'components.toolbar'
        ]);
}());
/* global angular */
(function () {
    'use strict';

    databaseController.$inject = ["$mdDialog", "$sce", "$mdToast", "databaseService"];
    angular
        .module('components.database')
        .component('databaseSidebar', {
            templateUrl: 'components/database/database.tmpl.html',
            controllerAs: 'vm',
            controller: databaseController
        });

    function databaseController($mdDialog, $sce, $mdToast, databaseService) {
        var vm = this;

        vm.$onInit = activate;
        vm.cleanup = cleanup;
        vm.vacuum = vacuum;
        vm.searchPlugin = searchPlugin;
        vm.resetPlugin = resetPlugin;

        function activate() {
            databaseService.getPlugins()
                .then(setPlugins)
                .cached(setPlugins);
        }

        function setPlugins(response) {
            vm.plugins = response.data;
        }

        function cleanup() {
            databaseService.cleanup()
                .then(openSuccess);
        }

        function vacuum() {
            databaseService.vacuum()
                .then(openSuccess);
        }

        function openSuccess(data) {
            var toast = $mdToast.simple()
                .textContent(data.message)
                .position('bottom right')
                .capsule(true)
                .toastClass('success');

            $mdToast.show(toast);
        }

        function searchPlugin(query) {
            var results = query ? vm.plugins.filter(createFilterFor(query)) : vm.plugins;
            return results;

            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);

                return function filterFn(plugin) {
                    return angular.lowercase(plugin).indexOf(lowercaseQuery) != -1;
                }
            }
        }

        function resetPlugin() {
            var confirm = $mdDialog.confirm()
                .title('Confirm resetting plugin.')
                .htmlContent($sce.trustAsHtml('Are you sure you want to reset the database for <b>' + vm.selectedPlugin + '</b>?'))
                .ok('Reset')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                var params = vm.selectedPlugin;
                databaseService.resetPlugin(params)
                    .then(openSuccess);
            });
        }
    }
}());

/* global angular */
(function () {
    'use strict';

    databaseConfig.$inject = ["toolbarHelperProvider", "databaseServiceProvider"];
    angular
        .module('components.database')
        .config(databaseConfig);
    
    function databaseConfig(toolbarHelperProvider, databaseServiceProvider) {
        var databaseService = databaseServiceProvider.$get();
        var databaseToggle = {
            menu: 'Manage',
            type: 'menuItem',
            label: 'Database',
            icon: 'database',
            action: databaseService.toggle,
            order: 250
        };

         toolbarHelperProvider.registerItem(databaseToggle);
    }
}());
/* global angular */
(function () {
    'use strict';

    databaseService.$inject = ["$http", "$mdSidenav", "exception"];
    angular
        .module('components.database')
        .factory('databaseService', databaseService);

    function databaseService($http, $mdSidenav, exception) {
        return {
            toggle: toggle,
            getPlugins: getPlugins,
            cleanup: cleanup,
            vacuum: vacuum,
            resetPlugin: resetPlugin
        };

        function toggle() {
            $mdSidenav('database').toggle();
        }

        function getPlugins() {
            return $http.get('/api/database/plugins/', {
                etagCache: true
            })
                .catch(callFailed);
        }

        function cleanup() {
            return $http.post('/api/database/', {
                operation: 'cleanup'
            })
                .then(callSucceeded)
                .catch(callFailed);
        }

        function vacuum() {
            return $http.post('/api/database/', {
                operation: 'vacuum'
            })
                .then(callSucceeded)
                .catch(callFailed);
        }

        function resetPlugin(params) {
            return $http.post('/api/database/', {
                operation: 'plugin_reset',
                plugin_name: params
            })
                .then(callSucceeded)
                .catch(callFailed);
        }

        function callSucceeded(response) {
            return response.data;
        }

        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());

/* global angular */
(function () {
    'use strict';

    angular
        .module('components.home', [
            'blocks.router'
        ]);
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('components.home')
        .component('home', {
            templateUrl: 'components/home/home.tmpl.html',
            controllerAs: 'vm',
            controller: homeController
        });

    function homeController() {
    }
}());
/* global angular */
(function () {
    'use strict';

    homeConfig.$inject = ["routerHelperProvider"];
    angular
        .module('components.home')
        .config(homeConfig);

    function homeConfig(routerHelperProvider) {
        routerHelperProvider.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'home',
                config: {
                    url: '/',
                    component: 'home'
                },
                when: [
                    '',
                    '/',
                    '/home'
                ]
            }
        ];
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('components.sidenav', [
            'ngMaterial',

            'blocks.router',
            'blocks.exception'
        ]);
}());
/* global angular */
(function () {
    'use strict';

    sideNavController.$inject = ["$rootScope", "routerHelper", "semver", "sideNavService"];
    angular
        .module('components.sidenav')
        .component('sideNav', {
            templateUrl: 'components/sidenav/sidenav.tmpl.html',
            controllerAs: 'vm',
            controller: sideNavController
        });

    function sideNavController($rootScope, routerHelper, semver, sideNavService) {
        var vm = this;

        var allStates = routerHelper.getStates();
        vm.close = sideNavService.close;
        vm.$onInit = activate;
        vm.isSmallMenu = isSmallMenu;
        vm.hasUpdate = hasUpdate;

        function activate() {
            getNavRoutes();
            getVersionInfo();
        }

        function getNavRoutes() {
            vm.navItems = allStates.filter(function (r) {
                return r.settings && r.settings.weight;
            }).sort(function (r1, r2) {
                return r1.settings.weight - r2.settings.weight;
            });
        }

        function getVersionInfo() {
            sideNavService.getVersionInfo().then(function (data) {
                vm.versions = data;
            });
        }

        function hasUpdate(current, latest) {
            return semver(vm.versions.latest_version, vm.versions.flexget_version) === 1;
        }

        function isSmallMenu() {
            return $rootScope.menuMini;
        }
    }
}());
(function(angular) {
  angular.module('components.sidenav').factory('semver', [
    function() {
      var temp = function() { /* global define */
        (function(root, factory) {
          /* istanbul ignore next */
          if (typeof define === 'function' && define.amd) {
            define([], factory);
          } else if (typeof exports === 'object') {
            module.exports = factory();
          } else {
            root.compareVersions = factory();
          }
        }(this, function() {

          var semver = /^v?(?:0|[1-9]\d*)(\.(?:[x*]|0|[1-9]\d*)(\.(?:[x*]|0|[1-9]\d*)(?:[.-][\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i;
          var patch = /-([0-9A-Za-z-.]+)/;

          function split(v) {
            var temp = v.split('.');
            var arr = temp.splice(0, 2);
            arr.push(temp.join('.'));
            return arr;
          }

          function tryParse(v) {
            return isNaN(Number(v)) ? v : Number(v);
          }

          function validate(version) {
            if (typeof version !== 'string') {
              throw new TypeError('Invalid argument expected string');
            }
            if (!semver.test(version)) {
              throw new Error('Invalid argument not valid semver');
            }
          }

          return function compareVersions(v1, v2) {
            [v1, v2].forEach(validate);

            var s1 = split(v1);
            var s2 = split(v2);

            for (var i = 0; i < 3; i++) {
              var n1 = parseInt(s1[i] || 0, 10);
              var n2 = parseInt(s2[i] || 0, 10);

              if (n1 > n2) return 1;
              if (n2 > n1) return -1;
            }

            if ([s1[2], s2[2]].every(patch.test.bind(patch))) {
              var p1 = patch.exec(s1[2])[1].split('.').map(tryParse);
              var p2 = patch.exec(s2[2])[1].split('.').map(tryParse);

              for (i = 0; i < Math.max(p1.length, p2.length); i++) {
                if (p1[i] === undefined || typeof p2[i] === 'string' && typeof p1[i] === 'number') return -1;
                if (p2[i] === undefined || typeof p1[i] === 'string' && typeof p2[i] === 'number') return 1;

                if (p1[i] > p2[i]) return 1;
                if (p2[i] > p1[i]) return -1;
              }
            } else if ([s1[2], s2[2]].some(patch.test.bind(patch))) {
              return patch.test(s1[2]) ? -1 : 1;
            }

            return 0;
          };

        }));
      };
      var context = {};
      var injected = {};
      temp.call(context);
      var propsAddedByTargetLib = [];
      angular.forEach(context, function(val, prop) {
        if (angular.isUndefined(injected[prop])) {
          propsAddedByTargetLib.push(val);
        }
      });
      if (propsAddedByTargetLib.length === 1) {
        return propsAddedByTargetLib.pop();
      } else {
        return context;
      }
    }
  ]);
})(window.angular);
/* global angular */
(function () {
    'use strict';

    sideNavService.$inject = ["$http", "$mdMedia", "$mdSidenav", "$rootScope", "exception"];
    angular
        .module('components.sidenav')
        .factory('sideNavService', sideNavService);

    function sideNavService($http, $mdMedia, $mdSidenav, $rootScope, exception) {
        return {
            toggle: toggle,
            close: close,
            getVersionInfo: getVersionInfo
        };

        function toggle() {
            if ($mdSidenav('left').isLockedOpen()) {
                $rootScope.menuMini = !$rootScope.menuMini;
            } else {
                $rootScope.menuMini = false;
                $mdSidenav('left').toggle();
            }
        }

        function close() {
            if (!$mdMedia('gt-lg')) {
                $mdSidenav('left').close();
            }
        }

        function getVersionInfo() {
            return $http.get('/api/server/version/')
                .then(getVersionInfoComplete)
                .catch(callFailed);
            
            function getVersionInfoComplete(response) {
                return response.data;
            }
        }

        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('components.toolbar', [
            'ngMaterial',
            'components.sidenav'
        ]);
}());
/* global angular */
(function () {
    'use strict';

    toolbarController.$inject = ["sideNavService", "toolbarHelper"];
    angular
        .module('components.toolbar')
        .component('toolBar', {
            templateUrl: 'components/toolbar/toolbar.tmpl.html',
            controllerAs: 'vm',
            controller: toolbarController
        });

    function toolbarController(sideNavService, toolbarHelper) {
        var vm = this;

        vm.$onInit = activate;
        vm.toggle = sideNavService.toggle;

        function activate() {
            vm.toolBarItems = toolbarHelper.items;
        }
    }

}());
/* global angular */
(function () {
    'use strict';

    toolbarConfig.$inject = ["toolbarHelperProvider"];
    angular
        .module('components.toolbar')
        .config(toolbarConfig);

    function toolbarConfig(toolbarHelperProvider) {
        var manageMenu = {
            type: 'menu',
            label: 'Manage',
            icon: 'cog',
            items: [],
            order: 255
        };

        //Register default Manage menu
        toolbarHelperProvider.registerItem(manageMenu);
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('components.toolbar')
        .provider('toolbarHelper', toolbarHelperProvider);

    function toolbarHelperProvider() {
        var items = [];
        var defaultOrder = 128;

        this.registerItem = registerItem;
        this.$get = toolbarHelper;

        function registerItem(item) {
            switch (item.type) {
                case 'menu':
                    registerMenu(item);
                    break;

                case 'menuItem':
                    registerMenuItem(item);
                    break;

                case 'button':
                    registerButton(item);
                    break;

                default:
                    throw 'Unknown toolbar item type found: ' + item.type;
            }

            function registerButton(item) {
                if (!item.order) {
                    item.order = defaultOrder;
                }
                items.push(item);
            }

            function registerMenu(item) {
                // Ignore if menu already registered
                var existingMenu = getMenu(item.label);
                if (!existingMenu) {
                    if (!item.order) {
                        item.order = defaultOrder;
                    }
                    items.push(item);
                } else {
                    throw (new Error('Menu ' + item.label + ' has already been registered'));
                }
            }

            function registerMenuItem(item) {
                if (!item.order) {
                    item.order = defaultOrder;
                }

                var menu = getMenu(item.menu);
                if (menu) {
                    menu.items.push(item);
                } else {
                    throw (new Error('Unable to register menu item ' + item.label + ' as Menu ' + item.menu + ' was not found'));
                }
            }

            function getMenu(menu) {
                for (var i = 0, len = items.length; i < len; i++) {
                    var item = items[i];
                    if (item.type === 'menu' && item.label === menu) {
                        return item;
                    }
                }
            }
        }

        function toolbarHelper() {
            return {
                items: items
            };
        }
    }
} ());
/* global angular */

(function () {
    'use strict';

    angular
        .module('components.user', []);
    //TODO: user component
 /*       .run(userConfig);

    function userConfig(toolBar) {
        toolBar.registerMenuItem('Manage', 'Profile', 'fa fa-user', function () {
            alert('not implemented yet')
        }, 100);
    }
*/
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('flexget.directives', [
        ]);
}());
/* global angular */
(function () {
    'use strict';

    paletteBackground.$inject = ["flexTheme"];
    angular
        .module('flexget.directives')
        .directive('paletteBackground', paletteBackground);

    /* @ngInject */
    function paletteBackground(flexTheme) {
        var directive = {
            bindToController: true,
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, $element, attrs) {
            var splitColor = attrs.paletteBackground.split(':');
            var color = flexTheme.getPaletteColor(splitColor[0], splitColor[1]);

            if (angular.isDefined(color)) {
                $element.css({
                    'background-color': flexTheme.rgba(color.value),
                    'border-color': flexTheme.rgba(color.value),
                    'color': flexTheme.rgba(color.contrast)
                });
            }
        }
    }
}());
/* global angular, registerPlugin */
(function () {
    'use strict';

    angular
        .module('plugins.config', [
            'ngMaterial',

            'ab-base64',

            'blocks.exception',
            'blocks.router',
            'components.toolbar',

            'ui.ace'
        ]);

    registerPlugin('plugins.config');
}());
/* global angular, ace */
(function () {
    'use strict';

    configController.$inject = ["$http", "base64", "$mdDialog", "CacheFactory", "configService"];
    angular
        .module('plugins.config')
        .component('configView', {
            templateUrl: 'plugins/config/config.tmpl.html',
            controllerAs: 'vm',
            controller: configController
        });

    function configController($http, base64, $mdDialog, CacheFactory, configService) {
        var vm = this;

        vm.$onInit = activate;
        vm.updateTheme = updateTheme;
        vm.saveConfiguration = saveConfiguration;
        vm.changeContent = changeContent;
        vm.variables = false;

        var aceThemeCache, editor;

        function activate() {
            loadConfig();
            initCache();

            setupAceOptions();
        }

        function changeContent() {
            vm.variables ? loadConfig() : loadVariables();
            vm.variables = !vm.variables;
        }

        function initCache() {
            if (!CacheFactory.get('aceThemeCache')) {
                CacheFactory.createCache('aceThemeCache', {
                    storageMode: 'localStorage'
                });
            }

            aceThemeCache = CacheFactory.get('aceThemeCache');
        }

        function loadConfig() {
            configService.getRawConfig()
                .then(decode)
                .cached(decode);
            
            function decode(response) {
                var decoded = base64.decode(response.data.raw_config);
                setConfiguration(decoded);
            }
        }

        function loadVariables() {
            configService.getVariables()
                .then(setVariables)
                .cached(setVariables);
            
            function setVariables(response) {
                var converted = YAML.stringify(response.data);
                setConfiguration(converted);
            }
        }

        function setConfiguration(config) {
            vm.configuration = config;
            editor.focus();
            saveOriginalValues();
        }

        function saveOriginalValues() {
            vm.originalValues = angular.copy(vm.configuration);
        }

        function setupAceOptions() {
            vm.aceOptions = {
                mode: 'yaml',
                theme: getTheme(),
                onLoad: aceLoaded
            };

            var themelist = ace.require('ace/ext/themelist');
            vm.themes = themelist.themes;
        }

        function aceLoaded(_editor) {
            editor = _editor;
            //Get all commands, but keep the find command
            var commandsToRemove = [
                'transposeletters',
                'gotoline'
            ];

            _editor.commands.removeCommands(commandsToRemove);

            _editor.commands.addCommand({
                name: 'saveConfiguration',
                bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
                exec: function () {
                    if (vm.configuration !== vm.originalValues) {
                        saveConfiguration();
                    }
                }
            });

            _editor.setShowPrintMargin(false);
        }

        function getTheme() {
            var theme = aceThemeCache.get('theme');
            return theme ? theme : 'chrome';
        }

        function updateTheme() {
            aceThemeCache.put('theme', vm.aceOptions.theme);
        }

        function saveConfiguration() {
            vm.variables ? saveVariables() : saveConfig();
        }

        function saveVariables() {
            var converted = YAML.parse(vm.configuration);
            configService.saveVariables(converted)
                .then(function () {
                    updateSuccess();
                }, function (error) {
                    console.log(error);
                    // TODO: Check errors
                    delete vm.errors;
                    delete vm.yamlError;
                    vm.errors = error;
                });
        }

        function saveConfig() {
            var encoded = base64.encode(vm.configuration);
            configService.saveRawConfig(encoded)
                .then(function () {
                    updateSuccess();
                }, function (error) {
                    delete vm.errors;
                    delete vm.yamlError;
                    error.errors ? vm.errors = error.errors : vm.yamlError = error;
                });
        }

        function updateSuccess() {
            var dialog = $mdDialog.alert()
                .title('Update success')
                .ok('Ok')
                .textContent('Your ' + (vm.variables ? 'variables have' : 'config has') + ' been successfully updated');
                    
            $mdDialog.show(dialog).then(function () {
                editor.focus();
            });

            delete vm.errorMessage;
            delete vm.errors;
            delete vm.yamlError;
                    
            saveOriginalValues();
        }
    }
}());

/* global angular */
(function () {
    'use strict';

    configConfig.$inject = ["routerHelperProvider", "toolbarHelperProvider", "$stateProvider"];
    angular
        .module('plugins.config')
        .config(configConfig);

    function configConfig(routerHelperProvider, toolbarHelperProvider, $stateProvider) {
        routerHelperProvider.configureStates(getStates());

        var $state = $stateProvider.$get();

        var configButton = {
            type: 'button',
            label: 'Config',
            icon: 'pencil',
            action: goToRoute,
            order: 1
        };

        function goToRoute() {
            $state.go('flexget.config');
        }

        toolbarHelperProvider.registerItem(configButton);
    }

    function getStates() {
        return [
            {
                state: 'config',
                config: {
                    url: '/config',
                    component: 'config-view',
                    settings: {
                        weight: 3,
                        icon: 'pencil',
                        caption: 'Config'
                    }
                }
            }
        ];
    }
}());
/* global angular */
(function () {
    'use strict';

    configService.$inject = ["$http", "exception", "$q"];
    angular
        .module('plugins.config')
        .factory('configService', configService);

    function configService($http, exception, $q) {
        return {
            getRawConfig: getRawConfig,
            saveRawConfig: saveRawConfig,
            getVariables: getVariables,
            saveVariables: saveVariables
        };

        function getRawConfig() {
            return $http.get('/api/server/raw_config', {
                etagCache: true
            })
                .catch(callFailed);
        }

        function saveRawConfig(encoded) {
            return $http.post('/api/server/raw_config', {
                'raw_config': encoded
            })
                .catch(saveFailed);
        }

        function getVariables() {
            return $http.get('/api/variables/', {
                etagCache: true
            })
                .catch(callFailed);
        }

        function saveVariables(variables) {
            return $http.put('/api/variables/', variables)
                .catch(saveFailed);
        }

        function saveFailed(response) {
            return $q.reject(response.data);
        }

        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());
/* global angular registerPlugin */
(function () {
    'use strict';

    angular
        .module('plugins.execute', [
            'angular-cache',
            
            'blocks.exception',
            'blocks.router'
        ]);

    registerPlugin('plugins.execute');
}());
/* global angular */
(function () {
    'use strict';

    executeController.$inject = ["$interval", "executeService"];
    angular
        .module('plugins.execute')
        .component('executeView', {
            templateUrl: 'plugins/execute/execute.tmpl.html',
            controllerAs: 'vm',
            controller: executeController
        });

    function executeController($interval, executeService) {
        var vm = this;

        vm.$onInit = activate;
        vm.$onDestroy = destroy;
        vm.execute = execute;
        vm.stopStream = stopStream;
        
        vm.streaming = false;
        vm.tasks = [];

        var taskInterval;

        function activate() {
            getRunning();
            getTasks();

            taskInterval = $interval(getRunning, 3000);
        }

        function getRunning() {
            executeService.getQueue().then(function (data) {
                vm.running = data;
            });
        }

        function getTasks() {
            var params = {
                include_config: false
            }

            executeService.getTasks(params)
                .then(setTasks)
                .cached(setTasks);
        }
            
        function setTasks(response) {
            for (var i = 0; i < response.data.length; i++) {
                vm.tasks.push(response.data[i]);
            }
        }

        function execute(options, tasks) {
            options.tasks = tasks;

            vm.options = options;
            vm.streaming = true;
        }

        function stopStream() {
            delete vm.options;
            vm.streaming = false;
        }

        function destroy() {
            $interval.cancel(taskInterval);
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('plugins.execute')
        .filter('executePhaseFilter', executePhaseFilter);

    function executePhaseFilter() {
        var phaseDescriptions = {
            input: 'Gathering Entries',
            metainfo: 'Figuring out meta data',
            filter: 'Filtering Entries',
            download: 'Downloading Accepted Entries',
            modify: 'Modifying Entries',
            output: 'Executing Outputs',
            exit: 'Finished'
        };

        return function (phase) {
            if (phase in phaseDescriptions) {
                return phaseDescriptions[phase];
            } else {
                return 'Processing';
            }
        };
    }

}());
/* global angular */
(function () {
    'use strict';

    executeConfig.$inject = ["routerHelperProvider"];
    angular
        .module('plugins.execute')
        .config(executeConfig);

    function executeConfig(routerHelperProvider) {
        routerHelperProvider.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'execute',
                config: {
                    url: '/execute',
                    component: 'execute-view',
                    settings: {
                        weight: 2,
                        icon: 'cog',
                        caption: 'Execute'
                    }
                }
            }
        ];
    }
}());
/* global angular, oboe */
(function () {
    'use strict';

    executeService.$inject = ["$http", "$q", "exception"];
    angular
        .module('plugins.execute')
        .factory('executeService', executeService);

    function executeService($http, $q, exception) {
        return {
            getTasks: getTasks,
            getQueue: getQueue,
            executeTasks: executeTasks
        };

        function getTasks(params) {
            return $http.get('/api/tasks/', {
                params: params,
                etagCache: true
            })
                .catch(callFailed);
        }

        function getQueue() {
            return $http.get('/api/tasks/queue/', {
                ignoreLoadingBar: true
            })
                .then(callCompleted)
                .catch(callFailed);
            
            function callCompleted(response) {
                return response.data;
            }
        }

        function executeTasks(options) {
            var deferred = $q.defer();

            var stream = oboe({
                url: 'api/tasks/execute/',
                body: options,
                method: 'POST'
            }).done(function () {
                deferred.resolve('finished stream');
            }).fail(function (error) {
                deferred.reject(error);
            });
            
            deferred.promise.tasks = function (callback) {
                stream.on('node', 'tasks', callback);
                return deferred.promise;
            };

            deferred.promise.log = function (callback) {
                stream.on('node', 'log', callback);
                return deferred.promise;
            };

            deferred.promise.progress = function (callback) {
                stream.on('node', 'progress', callback);
                return deferred.promise;
            };

            deferred.promise.summary = function (callback) {
                stream.on('node', 'summary', callback);
                return deferred.promise;
            };

            deferred.promise.entryDump = function (callback) {
                stream.on('node', 'entry_dump', callback);
                return deferred.promise;
            };

            deferred.promise.abort = function () {
                return stream.abort();
            };

            return deferred.promise;
        }

        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());

/* global angular, registerPlugin */
(function () {
    'use strict';

    angular
        .module('plugins.history', [
            'angular.filter',

            'blocks.pagination',
            'blocks.exception',
            'blocks.router'
        ]);

    registerPlugin('plugins.history');
}());
/* global angular */
(function () {
    'use strict';

    historyController.$inject = ["$filter", "historyService"];
    angular
        .module('plugins.history')
        .component('historyView', {
            templateUrl: 'plugins/history/history.tmpl.html',
            controllerAs: 'vm',
            controller: historyController
        });

    function historyController($filter, historyService) {
        var vm = this;

        vm.$onInit = activate;
        vm.getHistory = getHistory;
        vm.changeOrder = changeOrder;

        vm.sortOptions = [
            "Task",
            "Filename",
            "Url",
            "Title",
            "Time",
            "Details"
        ];

        vm.sortOption = "Time";
        vm.searchTerm = "";
        vm.order = "desc";

        function activate() {
            getHistory();
        }

        function changeOrder() {
            vm.order === 'desc' ? setOrder('asc') : setOrder('desc');

            function setOrder(direction) {
                vm.order = direction;
                getHistory();
            }
        }

        function getHistory(page) {
            var options = {
                page: page || 1,
                task: vm.searchTerm || undefined,
                sort_by: $filter('lowercase')(vm.sortOption),
                order: vm.order
            }
            historyService.getHistory(options)
                .then(setEntries)
                .cached(setEntries)
                .finally(function (data) {
                    vm.currentPage = options.page;
                });
        }
        
        function setEntries(response) {
            vm.entries = response.data;
            vm.linkHeader = response.headers().link;
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    historyConfig.$inject = ["routerHelperProvider"];
    angular
        .module('plugins.history')
        .config(historyConfig);

    function historyConfig(routerHelperProvider) {
        routerHelperProvider.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'history',
                config: {
                    url: '/history',
                    component: 'history-view',
                    settings: {
                        weight: 3,
                        icon: 'history',
                        caption: 'History'
                    }
                }
            }
        ];
    }
}());
/* global angular */
(function () {
    'use strict';

    historyService.$inject = ["$http", "exception"];
    angular
        .module('plugins.history')
        .factory('historyService', historyService);

    function historyService($http, exception) {
        return {
            getHistory: getHistory
        };

        function getHistory(options) {
            return $http.get('/api/history/', {
                params: options,
                etagCache: true
            })
                .catch(callFailed);
        }
        
        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());
/* global angular, registerPlugin */
(function () {
    'use strict';

    angular
        .module('plugins.log', [
            'blocks.exception',
            'blocks.router',

            'components.toolbar',
            'ui.grid',
            'ui.grid.autoResize',
            'ui.grid.autoScroll'
        ]);

    registerPlugin('plugins.log');
}());
/* global angular */
(function () {
    'use strict';

    logController.$inject = ["$scope", "logService"];
    angular
        .module('plugins.log')
        .component('logView', {
            templateUrl: 'plugins/log/log.tmpl.html',
            controllerAs: 'vm',
            controller: logController
        });

    function logController($scope, logService) {
        var vm = this;

        vm.$onInit = activate;
        vm.start = start;
        vm.clear = clear;
        vm.toggle = toggle;
        vm.refresh = refresh;
        vm.$onDestroy = destroy;
        vm.stop = stop;

        vm.filter = {
            lines: 400,
            search: ''
        };

        vm.refreshOpts = {
            debounce: 1000
        };

        var gridApi;

        function activate() {
            vm.start();
        }

        function toggle() {
            if (vm.status === 'Disconnected') {
                vm.start();
            } else {
                vm.stop();
            }
        }

        function clear() {
            vm.gridOptions.data = [];
        }

        function stop() {
            if (typeof vm.stream !== 'undefined' && vm.stream) {
                vm.stream.abort();
                vm.stream = false;
                vm.status = 'Disconnected';
            }
        }

        function refresh() {
            // Disconnect existing log streams
            vm.stop();

            vm.start();
        }

        function start() {
            vm.status = 'Connecting';
            vm.gridOptions.data = [];

            var queryParams = '?lines=' + vm.filter.lines;
            if (vm.filter.search) {
                queryParams = queryParams + '&search=' + vm.filter.search;
            }

            vm.stream = logService.startLogStream(queryParams);

            vm.stream.start(startFunction)
                .message(messageFunction)
                .catch(failFunction);

            function startFunction() {
                vm.status = 'Streaming';
            }

            function messageFunction(message) {
                vm.gridOptions.data.push(message);
                gridApi.core.notifyDataChange('row');
            }

            function failFunction() {
                vm.status = 'Disconnected';
            }
        }
        
        vm.gridOptions = {
            data: [],
            enableSorting: true,
            rowHeight: 20,
            columnDefs: [
                { field: 'timestamp', name: 'Time', cellFilter: 'date', enableSorting: true, width: 120 },
                { field: 'log_level', name: 'Level', enableSorting: false, width: 65 },
                { field: 'plugin', name: 'Plugin', enableSorting: false, width: 80, cellTooltip: true },
                { field: 'task', name: 'Task', enableSorting: false, width: 65, cellTooltip: true },
                { field: 'message', name: 'Message', enableSorting: false, minWidth: 400, cellTooltip: true }
            ],
            rowTemplate: 'row-template.html',
            onRegisterApi: function (api) {
                gridApi = api;
            }
        };

        // Cancel timer and stop the stream when navigating away
        function destroy() {
            vm.stop();
        }
    }

}());
/* global angular */
(function () {
    'use strict';

    logConfig.$inject = ["routerHelperProvider", "toolbarHelperProvider", "$stateProvider"];
    angular
        .module('plugins.log')
        .config(logConfig);

    function logConfig(routerHelperProvider, toolbarHelperProvider, $stateProvider) {
        routerHelperProvider.configureStates(getStates());

        var $state = $stateProvider.$get();        
        
        var logButton = {
            type: 'button',
            label: 'Log',
            icon: 'file-text-o',
            action: goToRoute,
            order: 1
        };

        function goToRoute() {
            $state.go('flexget.log');
        }

        toolbarHelperProvider.registerItem(logButton);
    }

    function getStates() {
        return [
            {
                state: 'log',
                config: {
                    url: '/log',
                    component: 'log-view',
                    settings: {
                        weight: 1,
                        icon: 'file-text-o',
                        caption: 'Log'
                    }
                }
            }
        ];
    }


}());
/* global angular, oboe */
(function () {
    'use strict';

    logService.$inject = ["$q"];
    angular
        .module('plugins.log')
        .factory('logService', logService);

    function logService($q) {
        return {
            startLogStream: startLogStream
        };

        function startLogStream(query) {
            var deferred = $q.defer();

            var stream = oboe({
                url: 'api/server/log/' + query,
                method: 'GET'
            }).done(function () {
                deferred.resolve('finished stream');
            }).fail(function (error) {
                deferred.reject(error);
            });

            deferred.promise.start = function (callback) {
                stream.on('start', callback);
                return deferred.promise;
            };

            deferred.promise.message = function (callback) {
                stream.on('node', '{message}', callback);
                return deferred.promise;
            };

            deferred.promise.abort = function () {
                return stream.abort();
            };

            return deferred.promise;
        }
    }
}());
/* global angular, registerPlugin */
(function () {
    'use strict';

    angular
        .module('plugins.movies', [
            'ngMaterial',
            'ngSanitize',

            'blocks.pagination',            
            'blocks.exception',
            'blocks.router'
        ]);

    registerPlugin('plugins.movies');
}());
/* global angular */
(function () {
    'use strict';

    moviesController.$inject = ["$document", "$mdDialog", "$mdPanel", "$sce", "$scope", "addMovieService", "moviesService"];
    angular
        .module('plugins.movies')
        .component('moviesView', {
            templateUrl: 'plugins/movies/movies.tmpl.html',
            controllerAs: 'vm',
            controller: moviesController
        });

    function moviesController($document, $mdDialog, $mdPanel, $sce, $scope, addMovieService, moviesService) {
        var vm = this;

        vm.lists = [];
        vm.$onInit = activate;
        vm.deleteList = deleteList;
        vm.newList = newList;
        vm.searchMovies = searchMovies;
        vm.loadMovies = loadMovies;

        vm.searchtext = "";

        function activate() {
            getMovieLists();
        }

        var position = $mdPanel.newPanelPosition().relativeTo('.search-menu').addPanelPosition($mdPanel.xPosition.ALIGN_END, $mdPanel.yPosition.BELOW);
        var panelConfig = {
            attachTo: angular.element($document[0].body),
            controller: 'addMovieController',
            controllerAs: 'vm',
            templateUrl: 'plugins/movies/components/add-movie/add-movie.tmpl.html',
            panelClass: 'add-movie-panel',
            position: position,
            locals: {},
            clickOutsideToClose: true,
            escapeToClose: true,
            focusOnOpen: false,
            zIndex: 2,
            onRemoving: addMovieService.clearWatcher,
            id: 'addMoviePanel'
        };
        
        function searchMovies() {
            panelConfig.locals.searchtext = vm.searchtext;
            panelConfig.locals.lists = vm.lists;
            panelConfig.locals.selectedlist = vm.selectedlist;

            $mdPanel.open(panelConfig);
        }

        function getMovieLists() {
            moviesService.getLists()
                .then(setLists)
                .cached(setLists);
        }
        
        function setLists(response) {
            vm.lists = response.data;
        }

        function deleteList($event, list) {
            $event.preventDefault();
            $event.stopPropagation();

            var confirm = $mdDialog.confirm()
                .title('Confirm deleting movie list.')
                .htmlContent($sce.trustAsHtml('Are you sure you want to delete the movie list <b>' + list.name + '</b>?'))
                .ok('Forget')
                .cancel('No');

            //Actually show the confirmation dialog and place a call to DELETE when confirmed
            $mdDialog.show(confirm).then(function () {
                moviesService.deleteList(list.id)
                    .then(function () {
                        var index = vm.lists.indexOf(list);
                        vm.lists.splice(index, 1);
                    });
            });
        }

        function newList($event) {
            $event.preventDefault();
            $event.stopPropagation();

            var listNames = vm.lists.map(function (list) {
                return list.name;
            });

            var dialog = {
                template: '<new-list lists="vm.lists"></new-list>',
                locals: {
                    lists: listNames
                },
                bindToController: true,
                controllerAs: 'vm',
                controller: function () { }
            };

            $mdDialog.show(dialog).then(function (newList) {
                if (newList) {
                    vm.lists.push(newList);
                }
            });
        }

        function loadMovies(data) {
            $scope.$emit('load-movies', { page: data });
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    moviesConfig.$inject = ["routerHelperProvider"];
    angular
        .module('plugins.movies')
        .config(moviesConfig);

    function moviesConfig(routerHelperProvider) {
        routerHelperProvider.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'movies',
                config: {
                    url: '/movies',
                    component: 'movies-view',
                    settings: {
                        weight: 5,
                        icon: 'film',
                        caption: 'Movies'
                    }
                }
            }
        ];
    }
}());
/* global angular */
(function () {
    'use strict';

    moviesService.$inject = ["$http", "exception"];
    angular
        .module('plugins.movies')
        .factory('moviesService', moviesService);

    function moviesService($http, exception) {
        return {
            getLists: getLists,
            deleteList: deleteList,
            getListMovies: getListMovies,
            deleteMovie: deleteMovie,
            createList: createList,
            getMovieMetadata: getMovieMetadata,
            addMovieToList: addMovieToList,
            searchMovies: searchMovies
        };

        function getLists() {
            return $http.get('/api/movie_list/', {
                etagCache: true
            })
                .catch(callFailed);
        }

        function deleteList(listId) {
            return $http.delete('/api/movie_list/' + listId + '/')
                .catch(callFailed);
        }

        function getListMovies(listId, options) {
            return $http.get('/api/movie_list/' + listId + '/movies/', {
                params: options,
                etagCache: true
            })
                .catch(callFailed);
        }

        function deleteMovie(listId, movieId) {
            return $http.delete('/api/movie_list/' + listId + '/movies/' + movieId + '/')
                .catch(callFailed);
        }

        function createList(name) {
            return $http.post('/api/movie_list/', {
                name: name
            })
                .then(callCompleted)
                .catch(callFailed);
            
            function callCompleted(response) {
                return response.data;
            }
        }

        function getMovieMetadata(params) {
            return $http.get('/api/tmdb/movies/', {
                params: params,
                etagCache: true
            })
                .catch(callFailed);
        }

        function addMovieToList(listid, movie) {
            return $http.post('/api/movie_list/' + listid + '/movies/', movie)
                .catch(callFailed);
        }

        function searchMovies(searchText) {
            return $http.get('/api/imdb/search/' + searchText, {
                etagCache: true
            })
                .catch(callFailed);
        }

        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());
/* global angular, registerPlugin */
(function () {
    'use strict';

    angular
        .module('plugins.pending', [
            'blocks.exception',
            'blocks.router'
        ]);

    registerPlugin('plugins.pending');
}());
/* global angular */
(function () {
    'use strict';

    pendingController.$inject = ["$filter", "pendingService"];
    angular
        .module('plugins.pending')
        .component('pendingView', {
            templateUrl: 'plugins/pending/pending.tmpl.html',
            controllerAs: 'vm',
            controller: pendingController
        });

    function pendingController($filter, pendingService) {
        var vm = this;

        vm.$onInit = activate;
        vm.updateEntry = updateEntry;
        vm.deleteEntry = deleteEntry;
            
        function activate() {
            getPending();
        }

        function getPending() {
            pendingService.getPending()
                .then(setEntries)
                .cached(setEntries);
        }

        function updateEntry(entry) {
            pendingService.updateEntry(entry.id, (entry.approved ? "reject" : "approve"))
                .then(function (response) {
                    var filtered = $filter('filter')(vm.entries, { id: entry.id });
                    var index = vm.entries.indexOf(filtered[0]);
                    vm.entries[index] = response.data;
                });
        }

        function deleteEntry(id) {
            pendingService.deleteEntry(id)
                .then(function (response) {
                    var filtered = $filter('filter')(vm.entries, { id: id });
                    var index = vm.entries.indexOf(filtered[0]);
                    vm.entries.splice(index, 1);
                });
        }
        
        function setEntries(response) {
            vm.entries = response.data;
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    pendingConfig.$inject = ["routerHelperProvider"];
    angular
        .module('plugins.pending')
        .config(pendingConfig);

    function pendingConfig(routerHelperProvider) {
        routerHelperProvider.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'pending',
                config: {
                    url: '/pending',
                    component: 'pending-view',
                    settings: {
                        weight: 3,
                        icon: 'check',
                        caption: 'Pending'
                    }
                }
            }
        ];
    }
}());

/* global angular */
(function () {
    'use strict';

    pendingService.$inject = ["$http", "exception"];
    angular
        .module('plugins.pending')
        .factory('pendingService', pendingService);

    function pendingService($http, exception) {
        return {
            getPending: getPending,
            updateEntry: updateEntry,
            deleteEntry: deleteEntry
        };

        function getPending() {
            return $http.get('/api/pending/', {
                etagCache: true
            })
                .catch(callFailed);
        }

        function updateEntry(entryId, operation) {
            return $http.put('/api/pending/' + entryId + '/', {
                operation: operation
            })
                .catch(callFailed);
        }

        function deleteEntry(entryId) {
            return $http.delete('/api/pending/' + entryId + '/')
                .catch(callFailed);
        }
        
        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());
/* global angular, registerPlugin */
(function () {
    'use strict';

    angular
        .module('plugins.schedule', [
            'blocks.exception',
            'blocks.router'
            //'schemaForm'
        ]);

    registerPlugin('plugins.schedule');
}());
/* global angular */
(function () {
    'use strict';

    scheduleController.$inject = ["schedulesService"];
    angular
        .module('plugins.schedule')
        .component('scheduleView', {
            templateUrl: 'plugins/schedule/schedule.tmpl.html',
            controllerAs: 'vm',
            controller: scheduleController
        });

    function scheduleController(schedulesService) {
        var vm = this;

        vm.$onInit = activate;

        /*vm.form = [
            '*',
            {
                type: 'submit',
                title: 'Save'
            }
        ];

        vm.onSubmit = function (form) {
            // First we broadcast an event so all fields validate themselves
            vm.$broadcast('schemaFormValidate');

            // Then we check if the form is valid
            if (form.$valid) {
                alert('test');
                // ... do whatever you need to do with your data.
            }
        };*/

        /*schema.get('config/schedules').then(function (schema) {
            vm.schema = { type: 'object', 'properties': { 'schedules': schema }, required: ['schedules'] };
        });*/

        function activate() {
            getSchedules();
        }

        function getSchedules() {
            schedulesService.getSchedules()
                .then(setSchedule)
                .cached(setSchedule);
        }
        
        function setSchedule(response) {
            vm.models = response.data;
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    scheduleConfig.$inject = ["routerHelperProvider"];
    angular
        .module('plugins.schedule')
        .config(scheduleConfig);

    function scheduleConfig(routerHelperProvider) {
        routerHelperProvider.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'schedule',
                config: {
                    url: '/schedule',
                    component: 'schedule-view',
                    settings: {
                        weight: 6,
                        icon: 'calendar',
                        caption: 'Schedule'
                    }
                }
            }
        ];
    }
}());
/* global angular */
(function () {
    'use strict';

    schedulesService.$inject = ["$http", "exception"];
    angular
        .module('plugins.schedule')
        .factory('schedulesService', schedulesService);

    function schedulesService($http, exception) {
        return {
            getSchedules: getSchedules
        };

        function getSchedules() {
            return $http.get('/api/schedules/', { etagCache: true })
                .catch(handleDisabledSchedules);
            
            function handleDisabledSchedules(response) {
                return response.status === 409 ? {} : callFailed(response);
            }
        }

        function callComplete(response) {
            return response.data;
        }

        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());
/* global angular, registerPlugin */
(function () {
    'use strict';

    angular
        .module('plugins.seen', [
            'blocks.pagination',
            'blocks.exception',
            'blocks.router'
        ]);

    registerPlugin('plugins.seen');
}());
/* global angular */
(function () {
    'use strict';

    seenController.$inject = ["$mdDialog", "$sce", "seenService"];
    angular
        .module('plugins.seen')
        .component('seenView', {
            templateUrl: 'plugins/seen/seen.tmpl.html',
            controllerAs: 'vm',
            controller: seenController
        });

    function seenController($mdDialog, $sce, seenService) {
        var vm = this;

        vm.$onInit = activate;
        vm.deleteEntry = deleteEntry;
        vm.getSeen = getSeen;
        
        var options = {};

        function activate() {
            getSeen(1);
        }

        function getSeen(page) {
            options.page = page;
            seenService.getSeen(options)
                .then(setEntries)
                .cached(setEntries)
                .finally(function () {
                    vm.currentPage = options.page;
                });
            
            function setEntries(response) {
                vm.entries = response.data;
                vm.linkHeader = response.headers().link;
            };
        }

        function deleteEntry(entry) {
            var confirm = $mdDialog.confirm()
                .title('Confirm forgetting Seen Entry.')
                .htmlContent($sce.trustAsHtml('Are you sure you want to delete <b>' + entry.title + '</b>?'))
                .ok('Forget')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                seenService.deleteEntryById(entry.id).then(function () {
                    getSeen(options.page);
                });
            });
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    seenConfig.$inject = ["routerHelperProvider"];
    angular
        .module('plugins.seen')
        .config(seenConfig);

    function seenConfig(routerHelperProvider) {
        routerHelperProvider.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'seen',
                config: {
                    url: '/seen',
                    component: 'seen-view',
                    settings: {
                        weight: 7,
                        icon: 'eye',
                        caption: 'Seen'
                    }
                }
            }
        ];
    }
}());
/* global angular */
(function () {
    'use strict';

    seenService.$inject = ["$http", "exception"];
    angular
        .module('plugins.seen')
        .factory('seenService', seenService);

    function seenService($http, exception) {
        return {
            getSeen: getSeen,
            deleteEntryById: deleteEntryById
        };

        function getSeen(options) {
            return $http.get('/api/seen/', {
                params: options,
                etagCache: true
            })
                .catch(callFailed);
        }

        function deleteEntryById(id) {
            return $http.delete('/api/seen/' + id + '/')
                .catch(callFailed);
        }

        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());
/* global angular, registerPlugin */
(function () {
    'use strict';

    angular
        .module('plugins.series', [
            'ngMaterial',

            'blocks.pagination',            
            'blocks.exception',
            'blocks.router'
        ]);

    registerPlugin('plugins.series');
}());
/* global angular */
(function () {
    'use strict';

    seriesController.$inject = ["$mdMedia", "$mdDialog", "$sce", "$timeout", "seriesService"];
    angular
        .module('plugins.series')
        .component('seriesView', {
            templateUrl: 'plugins/series/series.tmpl.html',
            controllerAs: 'vm',
            controller: seriesController
        });

    function seriesController($mdMedia, $mdDialog, $sce, $timeout, seriesService) {
        var vm = this;

        vm.sortOptions = [
            {
                nice: "Show name",
                small: "show_name"
            }, {
                nice: "Latest download date",
                small: "last_download_date"
            }
        ];

        vm.sortOption = "show_name";
        vm.order = "asc";

        var params = {
            forget: true
        };

        vm.searchTerm = '';

        vm.$onInit = activate;
        vm.forgetShow = forgetShow;
        vm.search = search;
        vm.toggleEpisodes = toggleEpisodes;
        vm.areEpisodesOnShowRow = areEpisodesOnShowRow;
        vm.getSeries = getSeries;
        vm.changeOrder = changeOrder;

        function activate() {
            getSeries();
        }

        function changeOrder() {
            vm.order === 'desc' ? setOrder('asc') : setOrder('desc');

            function setOrder(direction) {
                vm.order = direction;
                getSeries();
            }
        }

        function getSeries(page) {
            var options = {
                'page': page || 1,
                'per_page': 10,
                'in_config': 'all',
                'sort_by': vm.sortOption,
                'order': vm.order
            }
            seriesService.getShows(options)
                .then(setSeries)
                .cached(setSeries)
                .finally(function () {
                    vm.currentPage = options.page;
                });
        }

        function search() {
            vm.searchTerm ? searchShows() : emptySearch();

            function searchShows() {
                seriesService.searchShows(vm.searchTerm)
                    .then(setSeries)
                    .cached(setSeries)
                    .finally(function () {
                        vm.currentPage = 1;
                    });
            }

            function emptySearch() {
                getSeries();
            }
        }

        function setSeries(response) {
            vm.series = response.data;
            vm.linkHeader = response.headers().link;
        }

        function forgetShow(show) {
            var confirm = $mdDialog.confirm()
                .title('Confirm forgetting show.')
                .htmlContent($sce.trustAsHtml('Are you sure you want to completely forget <b>' + show.name + '</b>?<br /> This will also forget all downloaded releases.'))
                .ok('Forget')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                seriesService.deleteShow(show, params).then(function () {
                    vm.searchTerm ? search() : getSeries(vm.currentPage);
                });
            });
        }

        

        function toggleEpisodes(show) {
            show === vm.selectedShow ? clearShow() : setSelectedShow();

            function clearShow() {
                vm.selectedShow = null;
            }

            function setSelectedShow() {
                vm.selectedShow = null;
                $timeout(function () {
                    vm.selectedShow = show;
                });
            }
        }

        function getNumberOfColumns() {
            if ($mdMedia('gt-lg')) {
                return 3;
            } else if ($mdMedia('gt-md')) {
                return 2;
            }
            return 1;
        }

        function areEpisodesOnShowRow(index) {
            var show = vm.selectedShow;

            if (!show) {
                return false;
            }
            
            var numberOfColumns = getNumberOfColumns();

            var column = index % numberOfColumns;
            var row = (index - column) / numberOfColumns;

            var showIndex = vm.series.indexOf(show);
            var showColumn = showIndex % numberOfColumns;
            var showRow = (showIndex - showColumn) / numberOfColumns;

            if (row !== showRow) {
                return false;
            }

            //Check if not last series, since it doesn't work correctly with the matrix here
            if (index !== vm.series.length - 1 && column !== numberOfColumns - 1) {
                return false;
            }

            return true;
        }
    }
}());

/* global angular */
(function () {
    'use strict';

    seriesConfig.$inject = ["routerHelperProvider"];
    angular
        .module('plugins.series')
        .config(seriesConfig);

    function seriesConfig(routerHelperProvider) {
        routerHelperProvider.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'series',
                config: {
                    url: '/series',
                    component: 'series-view',
                    settings: {
                        weight: 4,
                        icon: 'tv',
                        caption: 'Series'
                    }
                }
            }
        ];
    }
}());
/* global angular */
(function () {
    'use strict';

    seriesService.$inject = ["$http", "exception"];
    angular
        .module('plugins.series')
        .factory('seriesService', seriesService);

    function seriesService($http, exception) {
        return {
            getShows: getShows,
            getShowMetadata: getShowMetadata,
            deleteShow: deleteShow,
            searchShows: searchShows,
            getEpisodes: getEpisodes,
            deleteEpisode: deleteEpisode,
            resetReleases: resetReleases,
            forgetRelease: forgetRelease,
            resetRelease: resetRelease,
            deleteReleases: deleteReleases,
            loadReleases: loadReleases,
            updateShow: updateShow
        };

        function getShows(options) {
            return $http.get('/api/series/',
                {
                    etagCache: true,
                    params: options
                })
                .catch(callFailed);
        }


        function getShowMetadata(show) {
            return $http.get('/api/tvdb/series/' + show.name + '/', {
                etagCache: true
            })
                .catch(metadataCallFailed);
            
            function metadataCallFailed(response) {
                return response.status === 404 ? {} : callFailed(response); 
            }
        }

        function deleteShow(show, params) {
            return $http.delete('/api/series/' + show.id + '/',
                {
                    params: params
                })
                .catch(callFailed);
        }

        //TODO: Test
        function updateShow(show, params) {
            return $http.put('/api/series/' + show.id + '/', params)
                .then(callComplete)
                .catch(callFailed);
        }

        function searchShows(searchTerm) {
            return $http.get('/api/series/search/' + searchTerm + '/', {
                etagCache: true
            })
                .catch(callFailed);
        }

        function getEpisodes(show, params) {
            return $http.get('/api/series/' + show.id + '/episodes/', {
                params: params,
                etagCache: true
            })
                .catch(callFailed);
        }

        function deleteEpisode(show, episode, params) {
            return $http.delete('/api/series/' + show.id + '/episodes/' + episode.id + '/', { params: params })
                .then(callComplete)
                .catch(callFailed);
        }

        function resetReleases(show, episode) {
            return $http.put('/api/series/' + show.id + '/episodes/' + episode.id + '/releases/')
                .then(callComplete)
                .catch(callFailed);
        }

        function forgetRelease(show, episode, release, params) {
            return $http.delete('/api/series/' + show.id + '/episodes/' + episode.id + '/releases/' + release.id + '/', { params: params })
                .then(callComplete)
                .catch(callFailed);
        }

        function resetRelease(show, episode, release) {
            return $http.put('/api/series/' + show.id + '/episodes/' + episode.id + '/releases/' + release.id + '/')
                .then(resetReleaseComplete)
                .catch(callFailed);

            function resetReleaseComplete(data) {
                return data;
            }
        }

        function deleteReleases(show, episode, params) {
            return $http.delete('/api/series/' + show.id + '/episodes/' + episode.id + '/releases/', { params: params })
                .then(deleteReleasesComplete)
                .catch(callFailed);

            function deleteReleasesComplete() {
                return;
            }
        }

        function loadReleases(show, episode) {
            return $http.get('/api/series/' + show.id + '/episodes/' + episode.id + '/releases/', {
                etagCache: true
            })
                .catch(callFailed);
        }

        function callComplete(response) {
            return response.data;
        }

        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());
/* global angular, registerPlugin */
(function () {
    'use strict';

    angular
        .module('plugins.server', [
            'components.toolbar'
        ]);

    registerPlugin('plugins.server');
}());
/* global angular */
(function () {
    'use strict';

    loadingDialogController.$inject = ["$mdDialog"];
    angular
        .module('plugins.server')
        .component('loadingDialog', {
            templateUrl: 'plugins/server/loading-dialog.tmpl.html',
            controller: loadingDialogController,
            controllerAs: 'vm',
            bindings: {
                title: '<',
                action: '<'
            }
        });

    function loadingDialogController($mdDialog) {
        var vm = this;

        vm.$onInit = activate;
        vm.close = close;

        function activate() {
            vm.loading = true;

            vm.action().then(function (data) {
                setValues(data);
            }, function (error) {
                setValues(error);
            }).finally(function () {
                vm.loading = false;
            });
        }

        function setValues(obj) {
            vm.title = obj.title;
            vm.content = obj.message;
        }

        function close() {
            $mdDialog.hide();
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    serverConfig.$inject = ["serverServiceProvider", "toolbarHelperProvider"];
    angular
        .module('plugins.server')
        .config(serverConfig);

    function serverConfig(serverServiceProvider, toolbarHelperProvider) {
        var serverService = serverServiceProvider.$get();
        var reloadButton = {
            menu: 'Manage',
            type: 'menuItem',
            label: 'Reload',
            icon: 'refresh',
            action: serverService.reload,
            order: 127
        };

        var shutdownButton = {
            menu: 'Manage',
            type: 'menuItem',
            label: 'Shutdown',
            icon: 'power-off',
            action: serverService.shutdown,
            order: 128
        };

        toolbarHelperProvider.registerItem(reloadButton);
        toolbarHelperProvider.registerItem(shutdownButton);
    }
}());
/* global angular */
(function () {
    'use strict';

    serverService.$inject = ["$http", "$mdDialog", "$window"];
    angular
        .module('plugins.server')
        .factory('serverService', serverService);

    function serverService($http, $mdDialog, $window) {
        var dialog = {
            template: '<loading-dialog title=\'vm.title\' action=\'vm.action\'></loading-dialog>',
            bindToController: true,
            controllerAs: 'vm',
            controller: function () { },
            locals: {
                title: 'No title',
                action: null
            }
        };

        return {
            reload: reload,
            shutdown: shutdown
        };

        function reload() {
            dialog.locals.title = 'Config Reloading';
            dialog.locals.action = doReload;
            $mdDialog.show(dialog);
        }

        function shutdown() {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title('Shutdown')
                    .textContent('Are you sure you want to shutdown Flexget?')
                    .ok('Shutdown')
                    .cancel('Cancel')
            ).then(function () {
                dialog.locals.title = 'Shutting Down';
                dialog.locals.action = doShutdown;
                $mdDialog.show(dialog);
            });
        }

        function doReload() {
            return $http.post('/api/server/manage/', {
                operation: 'reload'
            })
                .then(reloadSuccess)
                .catch(reloadFailed);

            function reloadSuccess() {
                var response = {
                    title: 'Reload Success',
                    message: 'Config has been successfully reloaded'
                };
                return response;
            }

            function reloadFailed(error) {
                var response = {
                    title: 'Reload Failed',
                    message: error.data.message
                };
                return response;
            }
        }

        function doShutdown() {
            $window.stop(); //Stop any http connections

            return $http.post('/api/server/manage/', {
                operation: 'shutdown'
            })
                .then(shutdownSuccess)
                .catch(shutdownFailed);

            function shutdownSuccess() {
                var response = {
                    title: 'Shutdown Success',
                    message: 'Flexget has been shutdown'
                };
                return response;
            }

            function shutdownFailed(error) {
                var response = {
                    title: 'Shutdown Failed',
                    message: error.data.message
                };
                return response;
            }
        }
    }
}());

/* global angular, registerPlugin */
(function () {
    'use strict';

    angular
        .module('plugins.status', [
            'blocks.exception',
            'blocks.router',
            'mdDataTable'
        ]);

    registerPlugin('plugins.status');
}());
/* global angular */
(function () {
    'use strict';

    statusController.$inject = ["$scope", "$filter", "statusService"];
    angular
        .module('plugins.status')
        .component('statusView', {
            templateUrl: 'plugins/status/status.tmpl.html',
            controllerAs: 'vm',
            controller: statusController
        });

    function statusController($scope, $filter, statusService) {
        var vm = this;
        
        vm.$onInit = activate;
        vm.timeSorter = timeSorter;
        vm.getStatus = getStatus;

        vm.tableData = {
            data: [],
            'table-row-id-key': 'id',
            'column-keys': [
                'name',
                'last_execution.start',
                'last_execution.produced',
                'last_execution.accepted',
                'last_execution.rejected',
                'last_execution.failed'
            ]
        }

        // Needs to use $scope, mdDataTable takes private scopes, so using vm doesn't work        
        $scope.getSuccess = getSuccessValue;
        
        function getSuccessValue(rowId) {
            var value = $filter('filter')(vm.tableData.data, { id: rowId })[0];
            return value.last_execution.succeeded;
        }

        function timeSorter(a, b) {
            return new Date(b) - new Date(a);
        }

        function activate() {
            getStatus();
        }

        function getStatus(page) {
            var options = {
                'page': page || 1,
                'per_page': 10,
                'sort_by': 'name',
                'order': 'asc'
            }
            statusService.getStatus(options)
                .then(setStatuses)
                .cached(setStatuses)
                .finally(function () {
                    vm.currentPage = options.page;
                });
        }
        
        function setStatuses(response) {
            vm.tableData.data = response.data;
            vm.linkHeader = response.headers().link;
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    statusConfig.$inject = ["routerHelperProvider"];
    angular
        .module('plugins.status')
        .config(statusConfig);

    function statusConfig(routerHelperProvider) {
        routerHelperProvider.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'status',
                config: {
                    url: '/status',
                    component: 'status-view',
                    settings: {
                        weight: 7,
                        icon: 'heartbeat',
                        caption: 'Status'
                    }
                }
            }
        ];
    }
}());
/* global angular */
(function () {
    'use strict';

    statusService.$inject = ["$http", "exception"];
    angular
        .module('plugins.status')
        .factory('statusService', statusService);

    function statusService($http, exception) {
        return {
            getStatus: getStatus
        };

        function getStatus(options) {
            return $http.get('/api/status/', {
                etagCache: true,
                params: options
            })
                .catch(callFailed);
        }

        function callFailed(error) {
            return exception.catcher(error);
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    executeInputController.$inject = ["executeService"];
    angular
        .module('plugins.execute')
        .component('executeInput', {
            templateUrl: 'plugins/execute/components/execute-input/execute-input.tmpl.html',
            controllerAs: 'vm',
            controller: executeInputController,
            bindings: {
                running: '<',
                execute: '<',
                tasks: '<'
            }
        });

    function executeInputController(executeService) {
        var vm = this;

        vm.searchTask = searchTask;
        vm.startExecute = startExecute;

        vm.searchTerm = '';
        vm.selectedTasks = [];

        var options = [
            {
                name: 'learn',
                value: false,
                help: 'matches are not downloaded but will be skipped in the future',
                display: 'Learn'
            },
            {
                name: 'no_cache',
                value: false,
                help: 'disable caches. works only in plugins that have explicit support',
                display: 'Caching'
            },
            {
                name: 'disable_tracking',
                value: false,
                help: 'disable episode advancement for this run',
                display: 'Tracking'
            },
            {
                name: 'discover_now',
                value: false,
                help: 'immediately try to discover everything',
                display: 'Discover'
            },
            {
                name: 'now',
                value: false,
                help: 'run task(s) even if the interval plugin would normally prevent it',
                display: 'Now'
            }
        ];
        vm.options = options;

        function searchTask() {
            var filter = function () {
                var lowercaseQuery = angular.lowercase(vm.searchTerm);
                return function filterFn(task) {
                    return (angular.lowercase(task).indexOf(lowercaseQuery) > -1);
                };
            };

            var results = vm.searchTerm ? vm.tasks.filter(filter()) : [];
            return results;
        }

        function startExecute() {
            var opts = {};
            vm.options.map(function (option) {
                opts[option.name] = option.value;
            });
            vm.execute(opts, vm.selectedTasks);
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    executeStreamController.$inject = ["$filter", "$log", "executeService"];
    angular
        .module('plugins.execute')
        .component('executeStream', {
            templateUrl: 'plugins/execute/components/execute-stream/execute-stream.tmpl.html',
            controllerAs: 'vm',
            controller: executeStreamController,
            bindings: {
                stopStream: '<',
                options: '<'
            }
        });

    function executeStreamController($filter, $log, executeService) {
        var vm = this;

        vm.$onInit = activate;
        vm.clear = clear;
        vm.streamTasks = [];
        vm.streamProgress = 0;

        var stream;

        function activate() {
            setupTaskProperties();
            startStream();
        }

        function setupTaskProperties() {
            for (var i = 0; i < vm.options.tasks.length; i++) {
                var task = {
                    name: vm.options.tasks[i],
                    percent: 0,
                    entries: [],
                    status: 'pending'
                };

                vm.streamTasks.push(task);
            }
        }

        function sortStreamTasks(taskData) {
            var notOrdered = angular.copy(vm.streamTasks);
            vm.streamTasks = [];

            for (var i = 0; i < taskData.length; i++) {
                var emptyTask = $filter('filter')(notOrdered, { name: taskData[i].name });
                vm.streamTasks.push(emptyTask[0]);
            }
        }

        function startStream() {
            vm.options.progress = true;
            vm.options.summary = true;
            //vm.options['loglevel'] = 'info';
            vm.options['entry_dump'] = true;

            stream = executeService.executeTasks(vm.options);

            stream.log(logNode)
                .progress(progressNode)
                .summary(summaryNode)
                .entryDump(entryDumpNode)
                .tasks(setTasks);
            
            function setTasks(taskData) {
                sortStreamTasks(taskData);
            }

            function progressNode(progress) {
                var filtered = $filter('filter')(vm.streamTasks, { status: '!complete' });
                angular.extend(filtered[0], progress);
                updateProgress();
            }

            function summaryNode(summary) {
                var filtered = $filter('filter')(vm.streamTasks, { status: 'complete' });
                angular.extend(filtered[filtered.length - 1], summary);
                updateProgress();
            }

            function entryDumpNode(entries) {
                var filtered = $filter('filter')(vm.streamTasks, { status: 'complete' });
                angular.extend(filtered[filtered.length - 1], { entries: entries });
            }

            function logNode(log) {
                $log.log(log);
            }
        }

        function clear() {
            if (stream) {
                stream.abort();
            }
            vm.stopStream();
        }

        function updateProgress() {
            var totalPercent = 0;
            for (var i = 0; i < vm.streamTasks.length; i++) {
                totalPercent = totalPercent + vm.streamTasks[i].percent;
            }
            vm.streamProgress = totalPercent / vm.streamTasks.length;
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('plugins.movies')
        .directive('inputClear', inputClear);

    function inputClear() {
        return {
            restrict: 'A',
            compile: function (element, attrs) {
                var color = attrs.inputClear;
                var style = color ? "color:" + color + ";" : "";
                var action = attrs.ngModel + " = ''";
                element.after(
                    '<md-button class="animate-show md-icon-button md-accent"' +
                    'ng-show="' + attrs.ngModel + '" ng-click="' + action + '"' +
                    'style="position: absolute; top: 0px; right: -6px;">' +
                    '<div style="' + style + '">x</div>' +
                    '</md-button>');
            }
        };
    }
} ());
/* global angular */
(function () {
    'use strict';

    angular
        .module('plugins.movies')
        .component('addMovieItem', {
            templateUrl: 'plugins/movies/components/add-movie/add-movie-item.tmpl.html',
            controllerAs: 'vm',
            controller: addMovieController,
            bindings: {
                movie: '<',
                lists: '<',
                selectedList: '<',
                addMovieToList: '&'
            },
            transclude: true
        });

    function addMovieController() {
        var vm = this;

        vm.addMovie = addMovie;

        function addMovie() {
            vm.addMovieToList({
                movie: vm.movie,
                list: vm.selectedList
            });
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    addMovieController.$inject = ["$mdPanel", "$scope", "$timeout", "addMovieService", "mdPanelRef", "moviesService"];
    angular
        .module('plugins.movies')
        .controller('addMovieController', addMovieController);

    function addMovieController($mdPanel, $scope, $timeout, addMovieService, mdPanelRef, moviesService) {
        var vm = this;

        vm.panelRef = mdPanelRef.config.locals;
        delete vm.panelRef.mdPanelRef; //Remove circular reference to self

        vm.loading = true;

        var searchWatch = $scope.$watch(function () {
            return mdPanelRef.config.locals.searchtext;
        }, function (newValue) {
            vm.searchtext = mdPanelRef.config.locals.searchtext;
            checkSearch(newValue);
        });
        
        addMovieService.setWatcher(searchWatch);
        
        function checkSearch(val) {
            $timeout(function () {
                if (val === vm.searchtext) {
                    vm.loading = true;
                    
                    updatePosition();

                    var lowercaseSearchText = angular.lowercase(val);
                    moviesService.searchMovies(lowercaseSearchText)
                        .then(setFoundMovies)
                        .cached(setFoundMovies);
                }
            }, 1000);
        }

        function setFoundMovies(response) {
            vm.foundMovies = response.data;
            vm.loading = false;
            updatePosition();
        }

        function updatePosition() {
            $timeout(function () {
                mdPanelRef.updatePosition($mdPanel.newPanelPosition().relativeTo('.search-menu').addPanelPosition($mdPanel.xPosition.ALIGN_END, $mdPanel.yPosition.BELOW));
            }, 0);
        }

        function searchMovies(searchText) {
            var lowercaseSearchText = angular.lowercase(searchText);
            return moviesService.searchMovies(lowercaseSearchText);
        }

        vm.currentList = vm.panelRef.lists[vm.panelRef.selectedlist].id;
        
        vm.addMovietoList = function (movie, list) {
            var movieObject = {
                movie_name: movie.name,
                movie_year: parseInt(movie.year) || undefined,
                movie_identifiers: [
                    { imdb_id: movie.imdb_id }
                ]
            }
            moviesService.addMovieToList(list, movieObject).then(function () {
                $scope.$emit('movie-added-list:' + list);
            });
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('plugins.movies')
        .factory('addMovieService', addMovieService);

    function addMovieService() {
        var searchWatch;

        return {
            setWatcher: setWatcher,
            clearWatcher: clearWatcher
        };

        function setWatcher(watch) {
            searchWatch = watch;
        }

        function clearWatcher() {
            if (searchWatch) {
                searchWatch();
            }    
        }
    }
})();
/* global angular */
(function () {
    'use strict';

    movieEntryController.$inject = ["moviesService"];
    angular
        .module('plugins.movies')
        .component('movieEntry', {
            templateUrl: 'plugins/movies/components/movie-entry/movie-entry.tmpl.html',
            controller: movieEntryController,
            controllerAs: 'vm',
            bindings: {
                movie: '<',
                deleteMovie: '&'
            }
        });

    function movieEntryController(moviesService) {
        var vm = this;

        vm.$onInit = activate;

        function activate() {
            getMetadata();
        }

        function getMetadata() {
            var params = {
                year: vm.movie.year,
                title: vm.movie.title,
                include_posters: true
            };

            vm.movie.movies_list_ids.forEach(function (id) {
                var newid = {};
                newid[id.id_name] = id.id_value;
                params = angular.extend(params, newid);
            });

            moviesService.getMovieMetadata(params)
                .then(setMetadata)
                .cached(setMetadata);
        }
          
        function setMetadata(response) {
            vm.metadata = response.data;
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    movieListController.$inject = ["$mdDialog", "$sce", "moviesService", "$rootScope"];
    angular
        .module('plugins.movies')
        .component('movieList', {
            templateUrl: 'plugins/movies/components/movie-list/movie-list.tmpl.html',
            controller: movieListController,
            controllerAs: 'vm',
            bindings: {
                list: '<',
                deleteMovieList: '&',
                tabIndex: '<',
                linkHeader: '=',
                currentPage: '='
            }
        });


    function movieListController($mdDialog, $sce, moviesService, $rootScope) {
        var vm = this;

        vm.$onInit = activate;
        vm.$onDestroy = destroy;
        vm.tabSelected = tabSelected;
        vm.tabDeselected = tabDeselected;
        vm.deleteMovie = deleteMovie;

        var loadMoviesListener, addMovieToListListener;
        var options = {
            'per_page': 10,
            order: 'asc'
        };

        function tabSelected() {
            loadMovies(1);
            loadMoviesListener = $rootScope.$on('load-movies', function (event, args) {
                loadMovies(args.page);
            });
            addMovieToListListener = $rootScope.$on('movie-added-list:' + vm.list.id, function () {
                loadMovies(vm.currentPage);
            })
        }

        function tabDeselected() {
            loadMoviesListener();
            addMovieToListListener();
        }
        
        function activate() {
            //Hack to make the movies from the first tab load (md-on-select not firing for initial tab)
            if (vm.tabIndex === 0) {
                tabSelected();
            }
        }

        function destroy() {
            loadMoviesListener ? loadMoviesListener() : null;
            addMovieToListListener ? addMovieToListListener() : null;
        }

        function loadMovies(page) {
            options.page = page;
            moviesService.getListMovies(vm.list.id, options)
                .then(setMovies)
                .cached(setMovies)
                .finally(function () {
                    vm.currentPage = options.page;
                });
        }

        function setMovies(response) {
            vm.movies = response.data;
            vm.linkHeader = response.headers().link;
        }

        function deleteMovie(list, movie) {
            var confirm = $mdDialog.confirm()
                .title('Confirm deleting movie from list.')
                .htmlContent($sce.trustAsHtml('Are you sure you want to delete the movie <b>' + movie.title + '</b> from list <b>' + list.name + '</b>?'))
                .ok('Forget')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                moviesService.deleteMovie(list.id, movie.id)
                    .then(function () {
                        loadMovies(vm.currentPage);
                    });
            });
        }
    }
}());

/* global angular */
(function () {
    'use strict';

    newListController.$inject = ["$mdDialog", "moviesService"];
    angular
        .module('plugins.movies')
        .component('newList', {
            templateUrl: 'plugins/movies/components/new-list/new-list.tmpl.html',
            controller: newListController,
            controllerAs: 'vm',
            bindings: {
                lists: '<'
            }
        });

    function newListController($mdDialog, moviesService) {
        var vm = this;

        vm.cancel = cancel;
        vm.saveList = saveList;

        function cancel() {
            $mdDialog.cancel();
        }

        function saveList() {
            moviesService.createList(vm.listName).then(function (newList) {
                $mdDialog.hide(newList);
            });
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('plugins.seen')
        .component('seenEntry', {
            templateUrl: 'plugins/seen/components/seen-entry/seen-entry.tmpl.html',
            controllerAs: 'vm',
            bindings: {
                entry: '<',
                deleteEntry: '&'
            }
        });
}());
/* global angular */
(function () {
    'use strict';

    angular
        .module('flexget.plugins.seen')
        .component('seenFields', {
            templateUrl: 'plugins/seen/compnents/seen-fields/seen-fields.tmpl.html',
            controllerAs: 'vm',
            controller: seenFieldsController,
            bindings: {
                fields: '<'
            }
        });

    function seenFieldsController() {
    }
});
/* global angular */
(function () {
    'use strict';

    episodesReleaseController.$inject = ["$mdDialog", "$sce", "seriesService"];
    angular
        .module('plugins.series')
        .component('episodeRelease', {
            templateUrl: 'plugins/series/components/episode-release/episode-release.tmpl.html',
            controllerAs: 'vm',
            controller: episodesReleaseController,
            bindings: {
                show: '<',
                episode: '<',
                release: '<'
            }
        });

    function episodesReleaseController($mdDialog, $sce, seriesService) {
        var vm = this;

        vm.cancel = cancel;
        vm.resetRelease = resetRelease;
        vm.forgetRelease = forgetRelease;

        var params = {
            forget: true
        };

        //Call from a release item, to reset the release
        function resetRelease() {
            var confirm = $mdDialog.confirm()
                .title('Confirm resetting a release')
                .htmlContent($sce.trustAsHtml('Are you sure you want to reset the release <b>' + vm.release.title + '</b>?'))
                .ok('reset')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                seriesService.resetRelease(vm.show, vm.episode, vm.release);
            });
        }

        //Call from a release item, to forget the release
        function forgetRelease() {
            var confirm = $mdDialog.confirm()
                .title('Confirm forgetting a release')
                .htmlContent($sce.trustAsHtml('Are you sure you want to delete the release <b>' + vm.release.title + '</b>?'))
                .ok('Forget')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                seriesService.forgetRelease(vm.show, vm.episode, vm.release, params);
            });
        }

        function cancel() {
            $mdDialog.cancel();
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    episodesReleasesController.$inject = ["$http", "$filter", "$mdDialog", "seriesService"];
    angular
        .module('plugins.series')
        .component('episodeReleases', {
            templateUrl: 'plugins/series/components/episode-releases/episode-releases.tmpl.html',
            controllerAs: 'vm',
            controller: episodesReleasesController,
            bindings: {
                show: '<',
                episode: '<'
            }
        });

    function episodesReleasesController($http, $filter, $mdDialog, seriesService) {
        var vm = this;

        vm.$onInit = activate;
        vm.cancel = cancel;

        function activate() {
            loadReleases();
        }

        function loadReleases() {
            seriesService.loadReleases(vm.show, vm.episode)
                .then(setReleases)
                .cached(setReleases);
        }
        
        function setReleases(response) {
            vm.releases = response.data;
        }

        function cancel() {
            $mdDialog.cancel();
        }
    }
}());
/* global angular */
(function () {

    seriesBeginDialogController.$inject = ["$mdDialog", "seriesService"];
    angular
        .module('plugins.series')
        .component('seriesBeginDialog', {
            templateUrl: 'plugins/series/components/series-begin-dialog/series-begin-dialog.tmpl.html',
            controller: seriesBeginDialogController,
            controllerAs: 'vm',
            bindings: {
                show: '<'
            }
        });

    function seriesBeginDialogController($mdDialog, seriesService) {
        var vm = this;

        vm.cancel = cancel;
        vm.$onInit = activate;
        vm.saveBegin = saveBegin;

        function activate() {
            vm.begin = vm.show['begin_episode'] ? vm.show['begin_episode'].identifier : undefined;
            vm.originalBegin = angular.copy(vm.begin);
        }

        function cancel() {
            $mdDialog.cancel();
        }

        function saveBegin() {
            var params = {
                'begin_episode': vm.begin
            };

            seriesService.updateShow(vm.show, params).then(function () {
                $mdDialog.hide(vm.begin);
            });
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    seriesEntryController.$inject = ["$mdDialog", "seriesService"];
    angular
        .module('plugins.series')
        .component('seriesEntry', {
            templateUrl: 'plugins/series/components/series-entry/series-entry.tmpl.html',
            controllerAs: 'vm',
            controller: seriesEntryController,
            bindings: {
                show: '<',
                forgetShow: '&',
                toggleEpisodes: '&'
            },
            transclude: true
        });

    function seriesEntryController($mdDialog, seriesService) {
        var vm = this;

        vm.$onInit = activate;
        vm.setBegin = setBegin;

        var dialog = {
            template: '<series-begin-dialog begin=\'vm.begin\' show=\'vm.show\'></series-begin>',
            bindToController: true,
            controllerAs: 'vm',
            controller: function () { }
        };

        function activate() {
            loadMetadata();
        }

        function loadMetadata() {
            seriesService.getShowMetadata(vm.show)
                .then(setMetadata)
                .cached(setMetadata);
        }

        function setMetadata(response) {
            vm.show.metadata = response.data;
        }

        function setBegin() {
            dialog.locals = {
                show: vm.show
            };

            $mdDialog.show(dialog).then(function (begin) {
                if (begin) {
                    vm.show['begin_episode']['identifier'] = begin;
                }
            });
        }


        //Dialog for the update possibilities, such as begin and alternate names
       /* function showDialog(params) {
            return $mdDialog.show({
                controller: 'seriesUpdateController',
                controllerAs: 'vm',
                templateUrl: 'plugins/series/components/series-update/series-update.tmpl.html',
                locals: {
                    showId: vm.show.show_id,
                    params: params
                }
            });
        }*/



        /*//Call from the page, to open a dialog with alternate names
        vm.alternateName = function (ev) {
            var params = {
                alternate_names: vm.show.alternate_names
            }

            showDialog(params).then(function (data) {
                if (data) vm.show.alternate_names = data.alternate_names;
            }, function (err) {
                console.log(err);
            });
        }*/
    }
}());
/* global angular */
(function () {
    'use strict';

    seriesEpisodeController.$inject = ["$mdDialog", "$sce", "seriesService"];
    angular
        .module('plugins.series')
        .component('seriesEpisode', {
            templateUrl: 'plugins/series/components/series-episode/series-episode.tmpl.html',
            controllerAs: 'vm',
            controller: seriesEpisodeController,
            bindings: {
                episode: '<',
                show: '<',
                deleteEpisode: '&'
            }
        });

    function seriesEpisodeController($mdDialog, $sce, seriesService) {
        var vm = this;

        vm.showReleases = showReleases;
        vm.resetReleases = resetReleases;
        vm.deleteReleases = deleteReleases;

        var params = {
            forget: true
        };

        var dialog = {
            template: '<episode-releases show="vm.show" episode="vm.episode"></episode-releases>',
            bindToController: true,
            locals: {
                show: vm.show,
                episode: vm.episode
            },
            controllerAs: 'vm',
            controller: function () { }
        };

        function showReleases() {
            $mdDialog.show(dialog);
        }

        //action called from the series-episode components
        function resetReleases() {
            var confirm = $mdDialog.confirm()
                .title('Confirm resetting releases.')
                .htmlContent($sce.trustAsHtml('Are you sure you want to reset downloaded releases for <b>' + vm.episode.identifier + '</b> from show <b>' + vm.show.name + '</b>?<br /> This does not remove seen entries but will clear the quality to be downloaded again.'))
                .ok('Forget')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                seriesService.resetReleases(vm.show, vm.episode);
            });
        }

        //Call from the page, to delete all releases
        function deleteReleases() {
            var confirm = $mdDialog.confirm()
                .title('Confirm deleting releases.')
                .htmlContent($sce.trustAsHtml('Are you sure you want to delete all releases for <b>' + vm.episode.identifier + '</b> from show <b>' + vm.show.name + '</b>?<br /> This also removes all seen releases for this episode!'))
                .ok('Forget')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                seriesService.deleteReleases(vm.show, vm.episode, params)
                    .then(function () {
                        vm.episode['number_of_releases'] = 0;
                    });
            });
        }
    }
}());
/* global angular */
(function () {
    'use strict';

    episodesController.$inject = ["$mdDialog", "$sce", "seriesService"];
    angular
        .module('plugins.series')
        .component('seriesEpisodesView', {
            templateUrl: 'plugins/series/components/series-episodes/series-episodes.tmpl.html',
            controllerAs: 'vm',
            controller: episodesController,
            bindings: {
                show: '<',
                hideEpisodes: '&'
            },
            transclude: true
        });

    function episodesController($mdDialog, $sce, seriesService) {
        var vm = this;

        vm.$onInit = activate;
        vm.deleteEpisode = deleteEpisode;
        vm.getEpisodes = getEpisodesList;
        
        var options = {
            'per_page': 10
        };

        var params = {
            forget: true
        };

        function activate() {
            getEpisodesList(1);
        }

        //Cal the episodes based on the options
        function getEpisodesList(page) {
            options.page = page;
            seriesService.getEpisodes(vm.show, options)
                .then(setEpisodes)
                .cached(setEpisodes)
                .finally(function () {
                    vm.currentPage = options.page;
                });
        }
        
        function setEpisodes(response) {
            //Set the episodes in the vm scope to the loaded episodes
            vm.episodes = response.data;
            vm.linkHeader = response.headers().link;
        }

        //action called from the series-episode component
        function deleteEpisode(episode) {
            var confirm = $mdDialog.confirm()
                .title('Confirm forgetting episode.')
                .htmlContent($sce.trustAsHtml('Are you sure you want to forget episode <b>' + episode.identifier + '</b> from show <b>' + vm.show.name + '</b>?<br /> This also removes all downloaded releases for this episode!'))
                .ok('Forget')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                seriesService.deleteEpisode(vm.show, episode, params)
                    .then(function () {
                        getEpisodesList(options.page);
                    });
            });
        }
    }
}());
angular.module("flexget").run(["$templateCache", function($templateCache) {$templateCache.put("construction.tmpl.html","<div layout=\"column\" flex=\"\" layout-align=\"center center\" layout-fill=\"\"><div layout=\"row\" flex=\"\" layout-padding=\"\" layout-align=\"center center\"><md-icon md-font-icon=\"fa-code\" class=\"fa construction-icon md-icon\" layout-fill=\"\"></md-icon></div><div layout=\"row\" flex=\"\"><div layout=\"column\" flex=\"\" layout-align=\"center center\"><div layout=\"row\" flex=\"\" layout-align=\"center center\"><span class=\"md-headline\">Even though some parts of this page may seem to work, it\'s not completely done yet.</span></div><div layout=\"row\" flex=\"\"><span class=\"md-subhead\">We are working hard to make this page usable soon.</span></div><div layout=\"row\" flex=\"\"><span class=\"md-subhead\">Check back in a few versions to see if this page already works.</span></div></div></div></div>");
$templateCache.put("layout.tmpl.html","<div class=\"header md-whiteframe-4dp\" ng-class=\"menuMini ? \'header-mini\': \'header-full\'\"><div class=\"logo\"><a href=\"#/\"></a></div><tool-bar></tool-bar></div><div layout=\"row\" flex=\"\" ng-class=\"menuMini ? \'nav-menu-mini\': \'nav-menu-full\'\"><side-nav layout=\"column\"></side-nav><ui-view id=\"content\"></ui-view></div><database-sidebar></database-sidebar>");
$templateCache.put("blocks/error/error-dialog.tmpl.html","<md-toolbar><div class=\"md-toolbar-tools\"><h2>Request failed</h2><span flex=\"\"></span><md-button class=\"md-icon-button\" ng-click=\"vm.close()\"><md-icon md-font-icon=\"fa-times\" class=\"fa fa-lg\" aria-label=\"close dialog\"></md-icon></md-button></div></md-toolbar><md-dialog-content><div class=\"md-dialog-content\" layout=\"row\"><div layout=\"column\"><pre class=\"custom-error-pre\">{{ vm.error | json }}</pre></div><div layout=\"column\"><md-button class=\"md-icon-button\" ngclipboard=\"\" data-clipboard-text=\"{{ vm.error }}\"><md-icon md-font-icon=\"fa-clipboard\" class=\"fa fa-lg\" aria-label=\"copy to clipboard\"></md-icon></md-button></div></div></md-dialog-content>");
$templateCache.put("blocks/pagination/pagination.tmpl.html","<section layout=\"row\" layout-align=\"center-center\" class=\"pagination-group\"><md-button class=\"left\" ng-disabled=\"vm.currentPage == 1\" ng-click=\"vm.setPage(1)\">&lt;&lt;</md-button><md-button ng-disabled=\"!vm.prev\" ng-click=\"vm.setPage(vm.prev.page)\">&lt;</md-button><md-button ng-repeat=\"p in [vm.linkGroupFirst(), vm.linkGroupLast()] | makeRange\" ng-class=\"{ \'active\': p == vm.currentPage }\" ng-click=\"vm.setPage(p)\">{{ p }}</md-button><md-button ng-disabled=\"!vm.next\" ng-click=\"vm.setPage(vm.next.page)\">&gt;</md-button><md-button class=\"right\" ng-disabled=\"!vm.last || vm.currentPage == vm.last.page\" ng-click=\"vm.setPage(vm.last.page)\">&gt;&gt;</md-button></section>");
$templateCache.put("components/404/404.tmpl.html","<div class=\"login\" layout=\"column\" layout-align=\"center\"><div class=\"header\"></div><div layout=\"row\" layout-align=\"center stretch\"><md-card flex-xs=\"100\" flex-sm=\"70\" flex-md=\"50\" flex-gt-md=\"30\" layout-padding=\"\"><md-card-content class=\"text-center\"><h1 class=\"md-display-1\">Uh oh! 404 Error</h1><p>Look like the page you requested was not found</p><md-button class=\"md-primary md-raised\" ng-click=\"vm.goHome()\">Go Home</md-button></md-card-content></md-card></div></div>");
$templateCache.put("components/auth/login.tmpl.html","<div class=\"login\" layout=\"column\" flex=\"\" layout-align=\"start stretch\"><div class=\"header\"></div><form name=\"loginForm\"><div layout=\"row\" layout-align=\"center stretch\"><md-card flex-xs=\"100\" flex-sm=\"70\" flex-md=\"50\" flex-gt-md=\"30\" layout-padding=\"\"><p style=\"color: orange\" class=\"text-success text-center\" ng-if=\"vm.timeout\">Your session timed out</p><p style=\"color: red\" class=\"text-center\">{{ vm.error }}</p><md-input-container class=\"md-block\" ng-init=\"vm.credentials.username = \'flexget\'\"><label>Username</label> <input id=\"username\" ng-model=\"vm.credentials.username\" required=\"\"></md-input-container><md-input-container class=\"md-block\"><label>Password</label> <input id=\"password\" ng-model=\"vm.credentials.password\" type=\"password\" required=\"\"></md-input-container><div layout=\"column\" layout-align=\"center center\"><md-checkbox md-no-ink=\"\" aria-label=\"Remember Me\" ng-model=\"vm.remember\" class=\"md-primary\">Remember Me</md-checkbox></div><md-button type=\"submit\" class=\"md-raised md-primary\" data-ng-click=\"vm.login()\" ng-disabled=\"loginForm.$invalid\">Login</md-button></md-card></div></form></div>");
$templateCache.put("components/database/database.tmpl.html","<md-sidenav class=\"md-sidenav-right md-whiteframe-z2\" md-component-id=\"database\"><md-toolbar class=\"md-theme-light\"><h1 class=\"md-toolbar-tools\">Database Management</h1></md-toolbar><section layout=\"column\" layout-padding=\"\"><section layout=\"column\"><span>Cleaning up removes all old/un-needed data from the database.</span><md-button class=\"md-primary md-raised\" flex=\"\" ng-click=\"vm.cleanup()\">Cleanup</md-button></section><md-divider></md-divider><section layout=\"column\"><span>Vacuuming potentially increases performance and decreases database size.</span><md-button class=\"md-primary md-raised\" flex=\"\" ng-click=\"vm.vacuum()\">Vacuum</md-button></section><md-divider></md-divider><section layout=\"column\"><span>Reset the database of a specific plugin.</span><md-autocomplete md-items=\"plugin in vm.searchPlugin(searchText)\" md-search-text=\"searchText\" md-selected-item=\"vm.selectedPlugin\" md-floating-label=\"Select plugin\" md-min-length=\"0\"><md-item-template><span md-highlight-text=\"searchText\">{{ plugin }}</span></md-item-template></md-autocomplete><md-button class=\"md-primary md-raised\" flex=\"\" ng-disabled=\"!vm.selectedPlugin\" ng-click=\"vm.resetPlugin()\">Reset plugin</md-button></section></section></md-sidenav>");
$templateCache.put("components/home/home.tmpl.html","<md-content layout-xs=\"column\" layout=\"row\" flex=\"\"><div layout=\"column\" flex=\"\" flex-gt-sm=\"50\" flex-offset-gt-sm=\"25\"><md-card><md-card-header palette-background=\"orange:600\"><md-card-header-text><span class=\"md-title\">Flexget Web Interface</span> <span class=\"md-subhead\">Under Development</span></md-card-header-text></md-card-header><md-card-content><p><b>We need your help! If you are an AngularJS developer or can help with the layout/design/css then please join in the effort!</b></p><p>The interface is not yet ready for end users. Consider this preview only state.</p><p>If you still use it anyways, please do report back to us how well it works, issues, ideas etc..</p><p>There is a functional API with documentation available at <a href=\"api\">/api</a></p><p>More information: <a href=\"http://flexget.com/wiki/Web-UI\" target=\"_blank\">http://flexget.com/wiki/Web-UI</a></p><p>Gitter Chat: <a href=\"https://gitter.im/Flexget/Flexget\" target=\"_blank\">https://gitter.im/Flexget/Flexget</a></p><div layout=\"row\" layout-align=\"center center\"><md-button class=\"md-icon-button\" aria-label=\"GitHub\" href=\"http://github.com/Flexget/Flexget\" target=\"_blank\"><md-icon class=\"md-icon fa fa-github md-headline\"></md-icon><md-tooltip>GitHub</md-tooltip></md-button><md-button class=\"md-icon-button\" aria-label=\"Flexget.com\" href=\"http://flexget.com\" target=\"_blank\"><md-icon class=\"md-icon fa fa-home md-headline\"></md-icon><md-tooltip>Wiki</md-tooltip></md-button><md-button class=\"md-icon-button\" aria-label=\"Flexget.com\" href=\"https://gitter.im/Flexget/Flexget\" target=\"_blank\"><md-icon class=\"md-icon fa fa-comment md-headline\"></md-icon><md-tooltip>Chat</md-tooltip></md-button><md-button class=\"md-icon-button\" aria-label=\"Forum\" href=\"http://discuss.flexget.com/\" target=\"_blank\"><md-icon class=\"md-icon fa fa-forumbee md-headline\"></md-icon><md-tooltip>Forum</md-tooltip></md-button></div></md-card-content></md-card></div></md-content>");
$templateCache.put("components/sidenav/sidenav.tmpl.html","<md-sidenav layout=\"column\" class=\"nav-menu md-sidenav-left md-sidenav-left md-whiteframe-z2\" md-component-id=\"left\" md-is-locked-open=\"$mdMedia(\'gt-sm\')\" flex=\"\"><md-content layout=\"column\" flex=\"\"><md-list><md-list-item ng-repeat=\"item in ::vm.navItems\"><md-button ui-sref=\"{{ ::item.name }}\" ng-click=\"vm.close()\" flex=\"\"><md-icon class=\"fa fa-{{ ::item.settings.icon }}\"></md-icon>{{ ::item.settings.caption }}</md-button></md-list-item></md-list><span flex=\"\"></span><div class=\"version-info\" ng-if=\"!vm.isSmallMenu() && vm.versions\"><h3>Version info</h3><span>Flexget: {{ vm.versions.flexget_version }}&nbsp; <a ng-if=\"::vm.hasUpdate()\" href=\"http://flexget.com/ChangeLog\" target=\"_blank\"><md-tooltip md-direction=\"top\">New version available ({{ vm.versions.latest_version }})</md-tooltip><md-icon class=\"fa fa-lg fa-question-circle-o\"></md-icon></a></span><br><span>API: {{ vm.versions.api_version }}</span></div></md-content></md-sidenav>");
$templateCache.put("components/toolbar/toolbar.tmpl.html","<div class=\"admin-toolbar\"><md-toolbar class=\"admin-toolbar\"><div class=\"md-toolbar-tools\"><md-button class=\"md-icon-button\" ng-click=\"vm.toggle()\" style=\"width: 40px\"><md-icon class=\"fa fa-bars\" aria-label=\"Menu\"></md-icon></md-button><span flex=\"\"></span><div ng-repeat=\"item in ::vm.toolBarItems | orderBy:\'order\'\"><md-button aria-label=\"{{ item.label }}\" class=\"md-icon-button\" ng-click=\"item.action()\" ng-if=\"::item.type == \'button\'\"><md-tooltip>{{ ::item.label }}</md-tooltip><md-icon md-menu-origin=\"\" class=\"fa fa-{{ ::item.icon }}\"></md-icon></md-button><md-menu ng-if=\"::(item.type == \'menu\' && item.items.length > 0)\"><md-button aria-label=\"{{ ::item.label }}\" class=\"md-icon-button\" ng-click=\"$mdOpenMenu($event)\"><md-tooltip>{{ ::item.label }}</md-tooltip><md-icon md-menu-origin=\"\" class=\"fa fa-{{ ::item.icon }}\"></md-icon></md-button><md-menu-content><md-menu-item ng-repeat=\"menuItem in ::item.items | orderBy:\'order\'\"><md-button ng-click=\"menuItem.action()\"><md-icon md-menu-origin=\"\" class=\"fa fa-{{ ::menuItem.icon }}\"></md-icon>{{ ::menuItem.label }}</md-button></md-menu-item></md-menu-content></md-menu></div></div></md-toolbar></div>");
$templateCache.put("plugins/config/config.tmpl.html","<div layout=\"column\" layout-fill=\"\"><md-toolbar class=\"md-warn\" layout=\"row\"><p class=\"md-toolbar-tools\"><span ng-if=\"!vm.variables\">This page is still pretty much in beta. Please take a backup before trying to save a new config.</span> <span ng-if=\"vm.variables\">Variables get overwritten from file unless you use `variables: yes` in your config file.</span></p></md-toolbar><div layout=\"column\"><div layout=\"row\"><div flex=\"25\" layout-align=\"center start\"><md-button class=\"md-raised md-primary\" ng-click=\"vm.saveConfiguration()\" ng-disabled=\"vm.configuration == vm.originalValues\">Save and apply</md-button></div><div flex=\"25\" layout-align=\"center start\"><md-button class=\"md-raised md-primary\" ng-click=\"vm.changeContent()\">{{ vm.variables ? \'Load config\' : \'Load variables\' }}</md-button></div><div flex=\"30\" flex-offset=\"45\"><md-input-container class=\"md-block\"><label>Theme</label><md-select ng-model=\"vm.aceOptions.theme\" ng-change=\"vm.updateTheme()\"><md-option ng-repeat=\"theme in ::vm.themes | orderBy: \'caption\'\" value=\"{{ theme.name }}\">{{ theme.caption }}</md-option></md-select></md-input-container></div></div></div><div layout=\"row\" ng-if=\"vm.errors\"><md-list flex=\"\"><md-list-item class=\"md-2-line\" ng-repeat=\"error in vm.errors\"><div class=\"md-list-item-text\"><h3><b>Path:</b> {{ error.config_path }}</h3><h4><b>Message:</b> {{ error.error }}</h4></div><md-divider ng-if=\"!$last\"></md-divider></md-list-item></md-list></div><div layout=\"row\" ng-if=\"vm.yamlError\"><md-list flex=\"\"><md-list-item class=\"md-3-line\"><div class=\"md-list-item-text\"><h3><b>YAML Error</b></h3><p><b>Line:</b> {{ vm.yamlError.line }}</p><p><b>Column:</b> {{ vm.yamlError.column }}</p></div></md-list-item></md-list></div><div layout=\"row\" flex=\"\"><div flex=\"\" ui-ace=\"vm.aceOptions\" ng-model=\"vm.configuration\"></div></div></div>");
$templateCache.put("plugins/execute/execute.tmpl.html","<md-content layout=\"column\" layout-padding=\"\" flex=\"\" class=\"execute\" ng-if=\"!vm.streaming\"><execute-input running=\"vm.running\" execute=\"vm.execute\" tasks=\"vm.tasks\"></execute-input></md-content><md-content layout=\"column\" layout-fill=\"\" ng-if=\"vm.streaming\" flex=\"\"><execute-stream options=\"vm.options\" stream=\"vm.stream\" running=\"vm.running\" stop-stream=\"vm.stopStream\"></execute-stream></md-content>");
$templateCache.put("plugins/history/history.tmpl.html","<div layout=\"column\" flex=\"\"><md-toolbar class=\"md-warn md-hue-3\"><div class=\"md-toolbar-tools operation-toolbar\"><md-input-container md-no-float=\"\"><input ng-model=\"vm.searchTerm\" ng-change=\"vm.getHistory()\" ng-model-options=\"{ debounce: 1000 }\" placeholder=\"Search for task\"><md-icon class=\"fa fa-lg fa-question-circle\"><md-tooltip md-direction=\"top\">Filtering happens on exact task name!</md-tooltip></md-icon></md-input-container><span flex=\"\"></span><md-input-container><md-select ng-model=\"vm.sortOption\" ng-change=\"vm.getHistory()\"><md-option ng-value=\"option\" ng-repeat=\"option in vm.sortOptions | orderBy: \'toString()\'\">{{ option }}</md-option></md-select></md-input-container><md-button class=\"md-icon-button\" aria-label=\"Order\" ng-click=\"vm.changeOrder()\"><md-icon md-font-icon=\"fa-chevron-down\" class=\"fa fa-lg\" ng-if=\"vm.order === \'desc\'\"></md-icon><md-icon md-font-icon=\"fa-chevron-up\" class=\"fa fa-lg\" ng-if=\"vm.order === \'asc\'\"></md-icon></md-button></div></md-toolbar><md-content flex=\"\"><section ng-repeat=\"(key, value) in vm.entries | groupBy: \'time | limitTo : 10\'\"><md-subheader class=\"md-primary\">{{ key }}</md-subheader><md-list layout-padding=\"\"><md-list-item class=\"md-2-line\" ng-repeat=\"entry in value\"><div class=\"md-list-item-text\"><h3>{{ entry.title }}</h3><p>{{ entry.task }}</p></div></md-list-item></md-list></section></md-content><fg-pagination load-data=\"vm.getHistory(page)\" link-header=\"vm.linkHeader\" current-page=\"vm.currentPage\"></fg-pagination></div>");
$templateCache.put("plugins/log/log.tmpl.html","<div layout-padding=\"\" layout-fill=\"\" layout=\"column\"><md-card class=\"log\" layout-fill=\"\"><md-card-header><md-card-header-text><span class=\"md-title\">Server log</span> <span class=\"md-subhead\">{{ vm.status }}</span></md-card-header-text><md-icon class=\"fa fa-filter\"></md-icon><md-input-container class=\"md-block\" style=\"margin: 0px\" flex=\"60\" flex-gt-md=\"70\"><label>Filter</label> <input type=\"text\" aria-label=\"message\" ng-model=\"vm.filter.search\" ng-change=\"vm.refresh()\" ng-model-options=\"vm.refreshOpts\"><div class=\"hint\">Supports operators and, or, (), and \"str\"</div></md-input-container><md-menu><md-button class=\"widget-button md-icon-button\" ng-click=\"$mdOpenMenu()\" aria-label=\"open menu\"><md-icon md-font-icon=\"fa fa-ellipsis-v\"></md-icon></md-button><md-menu-content><md-menu-item layout-margin=\"\"><md-input-container><label>Max Lines</label> <input type=\"number\" aria-label=\"lines\" ng-model=\"vm.filter.lines\" ng-change=\"vm.refresh()\" ng-model-options=\"vm.refreshOpts\"></md-input-container></md-menu-item><md-menu-item><md-button ng-click=\"vm.clear()\"><md-icon class=\"fa fa-eraser\" ng-class=\"\"></md-icon>Clear</md-button></md-menu-item><md-menu-item><md-button ng-click=\"vm.toggle()\"><md-icon class=\"fa\" ng-class=\"vm.stream ? \'fa fa-stop\' : \'fa fa-play\'\"></md-icon>{{ vm.stream ? \'Stop\' : \'Start\' }}</md-button></md-menu-item></md-menu-content></md-menu></md-card-header><md-card-content flex=\"\" layout=\"row\"><div flex=\"\" id=\"log-grid\" ui-grid=\"vm.gridOptions\" ui-grid-auto-resize=\"\" ui-grid-auto-scroll=\"\"></div></md-card-content></md-card></div><script type=\"text/ng-template\" id=\"row-template.html\"><div class=\"{{ row.entity.log_level | lowercase }}\" ng-class=\"{summary: row.entity.message.startsWith(\'Summary\'), accepted: row.entity.message.startsWith(\'ACCEPTED\')}\"> <div ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.uid\" class=\"ui-grid-cell\" ng-class=\"{ \'ui-grid-row-header-cell\': col.isRowHeader }\" ui-grid-cell> </div> </div></script>");
$templateCache.put("plugins/movies/movies.tmpl.html","<div layout=\"column\" layout-fill=\"\"><md-toolbar layout=\"row\" class=\"movie-tabsbar\"><div class=\"md-toolbar-items\" flex=\"\" layout-fill=\"\"><md-tabs flex=\"\" md-selected=\"vm.selectedlist\"><md-tab ng-repeat=\"list in vm.lists\" flex=\"\"><md-tab-label layout-fill=\"\"><section layout=\"row\" layout-align=\"center center\" layout-fill=\"\">{{ ::list.name }}<md-icon md-font-icon=\"fa-trash-o\" class=\"fa tab-icon fa-lg\" ng-click=\"vm.deleteList($event, list)\"></md-icon></section></md-tab-label></md-tab><md-tab flex=\"\"><md-tab-label layout-fill=\"\"><section ng-click=\"vm.newList($event)\"><md-icon md-font-icon=\"fa-plus-circle\" class=\"fa tab-icon-plus fa-lg\"></md-icon></section></md-tab-label></md-tab></md-tabs></div><div><md-input-container class=\"add-movie-input\"><label>Add a movie</label> <input type=\"text\" class=\"search-menu\" ng-model=\"vm.searchtext\" ng-change=\"vm.searchMovies()\" input-clear=\"\"></md-input-container></div></md-toolbar><md-content flex=\"\" ng-if=\"vm.lists\"><md-tabs md-dynamic-height=\"\" md-border-bottom=\"\" class=\"movie-tabs\" md-selected=\"vm.selectedlist\"><movie-list ng-repeat=\"list in vm.lists\" list=\"::list\" tab-index=\"$index\" link-header=\"vm.linkHeader\" current-page=\"vm.currentPage\"></movie-list></md-tabs></md-content><fg-pagination load-data=\"vm.loadMovies(page)\" link-header=\"vm.linkHeader\" current-page=\"vm.currentPage\"></fg-pagination></div>");
$templateCache.put("plugins/pending/pending.tmpl.html","<md-content layout=\"column\" flex=\"\"><h3 ng-if=\"vm.entries.length == 0\">No pending items</h3><md-list><md-list-item class=\"md-2-line\" ng-repeat=\"pending in vm.entries track by $index\"><div class=\"pending-actions\"><md-button class=\"md-raised\" ng-class=\"pending.approved ? \'md-accent\': \'md-primary\'\" ng-click=\"vm.updateEntry(pending)\">{{ pending.approved ? \"Reject\" : \"Approve\" }}</md-button><md-button class=\"md-raised md-warn\" ng-click=\"vm.deleteEntry(pending.id)\">Delete</md-button></div><div class=\"md-list-item-text\" layout=\"column\"><p>{{ pending.title }}</p><p>{{ pending.task_name }}</p><p>{{ pending.added }}</p></div><md-divider ng-if=\"!$last\"></md-divider></md-list-item></md-list></md-content>");
$templateCache.put("plugins/schedule/schedule.tmpl.html","<div layout=\"column\" flex=\"\"><div layout=\"row\" ng-if=\"vm.models\"><pre>{{ vm.models | json }}</pre><div ng-repeat=\"model in vm.models\"><div class=\"col-xs-3\"><form name=\"myForm\" sf-schema=\"vm.schema\" sf-form=\"vm.form\" sf-model=\"vm.model\" ng-submit=\"onSubmit(myForm)\"></form></div></div></div><div layout=\"row\" ng-if=\"!vm.models\">Scheduler is disabled.</div></div>");
$templateCache.put("plugins/seen/seen.tmpl.html","<div layout=\"column\" flex=\"\"><md-content><seen-entry ng-repeat=\"entry in vm.entries\" entry=\"entry\" delete-entry=\"vm.deleteEntry(entry)\"></seen-entry></md-content><fg-pagination load-data=\"vm.getSeen(page)\" link-header=\"vm.linkHeader\" current-page=\"vm.currentPage\"></fg-pagination></div>");
$templateCache.put("plugins/series/series.tmpl.html","<div layout=\"column\"><md-toolbar class=\"md-warn\"><span class=\"md-toolbar-tools\" flex=\"\">Please note that performed operations on this page might not be persistent. Depending on your config, settings might get overriden and data might be recreated.</span></md-toolbar><md-toolbar class=\"md-warn md-hue-3\"><div class=\"md-toolbar-tools operation-toolbar\"><md-input-container md-no-float=\"\"><input ng-model=\"vm.searchTerm\" ng-change=\"vm.search()\" ng-model-options=\"{ debounce: 1000 }\" placeholder=\"Search for a show\"></md-input-container><span flex=\"\"></span><md-input-container><md-select ng-model=\"vm.sortOption\" ng-change=\"vm.getSeries()\"><md-option ng-value=\"option.small\" ng-repeat=\"option in vm.sortOptions | orderBy: \'nice\'\">{{ option.nice }}</md-option></md-select></md-input-container><md-button class=\"md-icon-button\" aria-label=\"Order\" ng-click=\"vm.changeOrder()\"><md-icon md-font-icon=\"fa-chevron-down\" class=\"fa fa-lg\" ng-if=\"vm.order === \'desc\'\"></md-icon><md-icon md-font-icon=\"fa-chevron-up\" class=\"fa fa-lg\" ng-if=\"vm.order === \'asc\'\"></md-icon></md-button></div></md-toolbar><md-content layout=\"column\" flex=\"\" layout-padding=\"\"><div layout=\"row\" layout-wrap=\"\" layout-padding=\"\"><series-entry show=\"show\" forget-show=\"vm.forgetShow(show)\" toggle-episodes=\"vm.toggleEpisodes(show)\" layout=\"row\" flex=\"100\" flex-gt-md=\"50\" flex-gt-lg=\"33\" ng-repeat-start=\"show in vm.series\"><span class=\"show-indicator\" ng-if=\"show == vm.selectedShow\"></span></series-entry><series-episodes-view ng-repeat-end=\"\" ng-if=\"vm.areEpisodesOnShowRow($index)\" show=\"vm.selectedShow\" class=\"series-episodes\" hide-episodes=\"vm.toggleEpisodes(show)\"></series-episodes-view></div></md-content><fg-pagination load-data=\"vm.getSeries(page)\" link-header=\"vm.linkHeader\" current-page=\"vm.currentPage\"></fg-pagination></div>");
$templateCache.put("plugins/server/loading-dialog.tmpl.html","<md-toolbar><div class=\"md-toolbar-tools\"><h2>{{ vm.title }}</h2><span flex=\"\"></span><md-button class=\"md-icon-button\" ng-click=\"vm.close()\"><md-icon md-font-icon=\"fa-times\" class=\"fa fa-lg\" aria-label=\"close dialog\"></md-icon></md-button></div></md-toolbar><md-dialog-content><div class=\"md-dialog-content\"><div layout=\"row\" layout-align=\"space-around\"><md-progress-circular ng-if=\"vm.loading\" md-diameter=\"80\" class=\"md-primary\" md-mode=\"indeterminate\"></md-progress-circular></div><p ng-if=\"vm.content\">{{ vm.content }}</p></div></md-dialog-content><md-dialog-actions ng-if=\"!vm.loading\"><md-button ng-click=\"vm.close()\" class=\"md-primary md-raised\">Close</md-button></md-dialog-actions>");
$templateCache.put("plugins/status/status.tmpl.html","<div layout=\"column\" flex=\"\" layout-margin=\"\"><mdt-table class=\"data-table\" flex=\"\" table-card=\"{ title: \'Latest task executions\', actionIcons: true }\" animate-sort-icon=\"true\" mdt-row=\"vm.tableData\"><mdt-header-row><mdt-column align-rule=\"left\" column-sort=\"true\" sortable-rows-default=\"\">Task name</mdt-column><mdt-column align-rule=\"left\" column-sort=\"{ comparator: vm.timeSorter }\">Start time</mdt-column><mdt-column align-rule=\"left\" column-sort=\"true\">Produced</mdt-column><mdt-column align-rule=\"left\" column-sort=\"true\">Accepted</mdt-column><mdt-column align-rule=\"left\" column-sort=\"true\">Rejected</mdt-column><mdt-column align-rule=\"left\" column-sort=\"true\">Failed</mdt-column></mdt-header-row><mdt-custom-cell html-content=\"true\" column-key=\"name\"><md-icon class=\"fa fa-lg\" ng-class=\"::clientScope.getSuccess(rowId) ? \'fa-check-circle success\' : \'fa-times-circle failure\'\"></md-icon><span id=\"taskName\">{{ ::value }}</span></mdt-custom-cell></mdt-table><fg-pagination load-data=\"vm.getStatus(page)\" link-header=\"vm.linkHeader\" current-page=\"vm.currentPage\"></fg-pagination></div>");
$templateCache.put("plugins/execute/components/execute-input/execute-input.tmpl.html","<div layout=\"row\" layout-align=\"center center\"><md-card flex=\"\" flex-gt-sm=\"50\" flex-gt-md=\"40\" class=\"task-search\"><md-card-header><md-card-header-text flex=\"\"><span class=\"md-title\">{{ vm.running.length }} Tasks in Queue</span> <span class=\"md-subhead\" ng-if=\"vm.running[0]\">{{ vm.running[0].name }} ({{ vm.running[0].current_phase }})</span></md-card-header-text><md-menu><md-button class=\"md-icon-button\" ng-click=\"$mdOpenMenu()\" aria-label=\"open menu\"><md-icon md-font-icon=\"fa fa-ellipsis-v\"></md-icon></md-button><md-menu-content width=\"3\"><md-menu-item ng-repeat=\"option in vm.options\"><md-button class=\"tooltip-fix\" ng-click=\"option.value = !option.value\" md-prevent-menu-close=\"true\"><md-tooltip>{{ option.help }}</md-tooltip><md-icon ng-class=\"option.value ? \'fa fa-check\' : \'fa fa-ban\'\"></md-icon>{{ option.display }}</md-button></md-menu-item></md-menu-content></md-menu></md-card-header><md-card-content><md-chips ng-model=\"vm.selectedTasks\" md-autocomplete-snap=\"\" md-require-match=\"true\"><md-autocomplete md-selected-item=\"vm.selectedTask\" md-search-text=\"vm.searchTerm\" md-items=\"task in vm.searchTask()\" placeholder=\"Enter task(s) to execute\" md-item-text=\"task\"><span ng-hightlight-text=\"vm.searchTerm\">{{ task }}</span></md-autocomplete></md-chips><div flex=\"\"></div><div layout=\"row\" layout-align=\"center center\"><div flex=\"100\" flex-gt-md=\"50\" layout=\"column\"><md-button class=\"md-raised md-primary\" ng-click=\"vm.startExecute()\" ng-disabled=\"vm.selectedTasks.length == 0\">Execute</md-button></div></div></md-card-content></md-card></div>");
$templateCache.put("plugins/execute/components/execute-stream/execute-stream.tmpl.html","<div><div><md-progress-linear md-mode=\"determinate\" value=\"{{ vm.streamProgress }}\"></md-progress-linear></div><span class=\"md-subhead\" ng-if=\"vm.running[0]\">{{ vm.running[0].name }} ({{ vm.running[0].current_phase }})</span><md-tabs md-selected=\"selectedIndex\" md-border-bottom=\"\" md-dynamic-height=\"\" flex=\"\"><md-tab ng-repeat=\"task in vm.streamTasks\" flex=\"\"><md-tab-label><span>{{ task.name }}</span></md-tab-label><md-tab-body><div layout=\"row\" layout-align=\"space-around center\"><div ng-hide=\"task.status == \'complete\'\" class=\"text-center\"><div ng-if=\"task.status == \'pending\'\" class=\"md-display-2\">Pending</div><div ng-if=\"task.status == \'running\'\"><div class=\"md-display-2\">{{ task.phase | executePhaseFilter }}</div><div><small>({{ task.plugin }})</small></div></div></div><div ng-if=\"task.status == \'complete\'\"><md-subheader class=\"md-no-sticky text-center\"><span>Accepted: {{ task.accepted }}</span> <span>Rejected: {{ task.rejected }}</span> <span>Failed: {{ task.failed }}</span> <span>Undecided: {{ task.undecided }}</span></md-subheader><md-list><md-list-item class=\"md-2-line\" ng-repeat=\"entry in task.entries\"><md-icon class=\"fa fa-lg\" ng-class=\"{ \'fa-check-circle\': entry.accepted_by, \'fa-question-circle\': !entry.accepted_by }\"></md-icon><div class=\"md-list-item-text\"><h3>{{ entry.title }}</h3><p>{{ entry.accepted_by }}</p></div></md-list-item></md-list></div></div></md-tab-body></md-tab></md-tabs><div layout=\"row\" layout-align=\"space-around center\"><div></div><md-button class=\"md-raised md-primary\" ng-click=\"vm.clear()\">Clear</md-button><div></div></div></div>");
$templateCache.put("plugins/movies/components/add-movie/add-movie-item.tmpl.html","<md-list-item flex=\"\" class=\"list\"><img ng-src=\"{{ vm.movie.thumbnail }}\"> <a flex=\"\" ng-href=\"{{ vm.movie.url }}\" target=\"_blank\" class=\"title md-subhead\">{{ vm.movie.name }} ({{ vm.movie.year }})</a><md-input-container><md-select ng-model=\"vm.selectedList\" placeholder=\"Movie list\"><md-option ng-repeat=\"list in ::vm.lists\" value=\"{{ list.id }}\">{{ list.name }}</md-option></md-select></md-input-container><md-button class=\"md-raised md-secondary\" ng-disabled=\"!vm.selectedList\" ng-click=\"vm.addMovie()\">Add</md-button><ng-transclude></ng-transclude></md-list-item>");
$templateCache.put("plugins/movies/components/add-movie/add-movie.tmpl.html","<md-content flex=\"\" ng-cloak=\"\"><md-list flex=\"\" ng-if=\"!vm.loading\" layout-fill=\"\"><add-movie-item ng-repeat=\"movie in vm.foundMovies | orderBy : \'match\' : true\" selected-list=\"vm.currentList\" movie=\"movie\" lists=\"vm.panelRef.lists\" add-movie-to-list=\"vm.addMovietoList(movie, list)\" flex=\"\"><md-divider ng-if=\"!$last\"></md-divider></add-movie-item><md-list-item ng-if=\"vm.foundMovies.length === 0\">No movies found</md-list-item></md-list><div layout-padding=\"\" ng-if=\"vm.loading\"><div layout=\"row\" layout-align=\"space-around\"><md-progress-circular></md-progress-circular></div></div></md-content>");
$templateCache.put("plugins/movies/components/movie-entry/movie-entry.tmpl.html","<md-card class=\"movie-entry\"><div class=\"movie-poster\"><img ng-src=\"{{ vm.metadata.posters[0] ? \'api/cached/?url=\' + (vm.metadata.posters[0].urls.w185 ? vm.metadata.posters[0].urls.w185 : vm.metadata.posters[0].urls.original) : null }}\"></div><div class=\"movie-info\"><h3>{{ ::vm.movie.title }} ({{ ::vm.movie.year }}) <span class=\"rating\"><md-icon md-font-set=\"fa\" md-font-icon=\"fa-star\"></md-icon><span class=\"md-suhead\">{{ ::vm.metadata.rating | number:2 }}</span></span></h3><md-chips ng-model=\"::vm.metadata.genres\" readonly=\"true\"><md-chip-template>{{ $chip }}</md-chip-template></md-chips><p class=\"movie-plot\">{{ ::vm.metadata.overview }}</p></div><md-fab-speed-dial md-direction=\"left\" class=\"md-scale more-btn\"><md-fab-trigger><md-button aria-label=\"More\" class=\"md-fab md-mini\"><i class=\"fa fa-bars\" aria-hidden=\"true\"></i></md-button></md-fab-trigger><md-fab-actions><md-button aria-label=\"delete movie\" ng-click=\"vm.deleteMovie()\" class=\"md-fab md-raised md-mini\"><i class=\"fa fa-trash\" aria-hidden=\"true\"></i></md-button><md-button aria-label=\"More info\" class=\"md-fab md-raised md-mini\"><a target=\"_blank\" ng-href=\"http://www.imdb.com/title/{{ ::vm.metadata.imdb_id }}\"><i class=\"fa fa-film\" aria-hidden=\"true\"></i></a></md-button></md-fab-actions></md-fab-speed-dial></md-card>");
$templateCache.put("plugins/movies/components/movie-list/movie-list.tmpl.html","<md-tab md-on-select=\"vm.tabSelected()\" md-on-deselect=\"vm.tabDeselected()\" label=\"{{ ::vm.list.name }}\"><md-tab-body><div layout=\"row\" layout-wrap=\"\" layout-padding=\"\"><movie-entry flex=\"100\" flex-gt-md=\"50\" flex-gt-lg=\"33\" movie=\"::movie\" delete-movie=\"vm.deleteMovie(vm.list, movie)\" ng-repeat=\"movie in vm.movies\" class=\"animate-remove\"></movie-entry></div></md-tab-body></md-tab>");
$templateCache.put("plugins/movies/components/new-list/new-list.tmpl.html","<md-toolbar><div class=\"md-toolbar-tools\"><h2>New Movie List</h2><span flex=\"\"></span><md-button class=\"md-icon-button\" ng-click=\"vm.cancel()\"><md-icon md-font-icon=\"fa-times\" class=\"fa fa-lg\"></md-icon></md-button></div></md-toolbar><form name=\"newListForm\" ng-submit=\"vm.saveList()\"><md-dialog-content><div class=\"md-dialog-content\"><md-input-container><label>Name</label> <input type=\"text\" ng-model=\"vm.listName\" required=\"\"></md-input-container></div></md-dialog-content><md-dialog-actions><md-button ng-click=\"vm.cancel()\" class=\"md-default md-raised\">Cancel</md-button><md-button type=\"submit\" ng-disabled=\"newListForm.$invalid || vm.lists.indexOf(vm.listName) != -1\" class=\"md-primary md-raised\">Save</md-button></md-dialog-actions></form>");
$templateCache.put("plugins/seen/components/seen-entry/seen-entry.tmpl.html","<md-card><md-card-header><md-card-header-text><span class=\"md-title\">{{vm.entry.title}}</span> <span class=\"md-subhead\" ng-if=\"vm.entry.local\">Local to <b>{{vm.entry.task}}</b></span> <span class=\"md-subhead\" ng-if=\"!vm.entry.local\">Global</span></md-card-header-text></md-card-header><md-card-content><md-list><md-list-item ng-repeat=\"field in ::vm.entry.fields\"><div class=\"md-list-item-text\" layout=\"row\"><p><b>{{field.field_name}}:</b> {{field.value}}</p></div></md-list-item></md-list></md-card-content><md-card-actions><md-button class=\"md-raised md-warn\" ng-click=\"vm.deleteEntry()\">Delete</md-button></md-card-actions></md-card>");
$templateCache.put("plugins/seen/components/seen-field/seen-field.tmpl.html","");
$templateCache.put("plugins/series/components/episode-release/episode-release.tmpl.html","<md-list-item class=\"md-2-line episode-release\"><div class=\"md-list-item-text\"><h6 class=\"release-title md-subhead\"><i ng-if=\"vm.release.downloaded\" class=\"fa fa-download\"></i> {{ ::vm.release.title }}</h6><p>{{ ::vm.release.quality }}</p></div><md-button ng-click=\"vm.resetRelease()\" ng-if=\"vm.release.downloaded\" class=\"md-icon-button\" aria-label=\"reset the release\"><i class=\"fa fa-refresh\" aria-hidden=\"true\"></i></md-button><md-button ng-click=\"vm.forgetRelease()\" class=\"md-icon-button\" aria-label=\"forget the release\"><i class=\"fa fa-trash\" aria-hidden=\"true\"></i></md-button></md-list-item>");
$templateCache.put("plugins/series/components/episode-releases/episode-releases.tmpl.html","<md-toolbar><div class=\"md-toolbar-tools\"><h2>Releases for {{ ::vm.show.name }} - {{ ::vm.episode.identifier }}</h2><span flex=\"\"></span><md-button class=\"md-icon-button\" ng-click=\"vm.cancel()\"><md-icon md-font-icon=\"fa-times\" class=\"fa fa-lg\" aria-label=\"close dialog\"></md-icon></md-button></div></md-toolbar><md-dialog-content><div class=\"md-dialog-content\"><md-list flex=\"\"><episode-release ng-repeat=\"release in vm.releases | orderBy : \'downloaded\' : true\" show=\"vm.show\" episode=\"vm.episode\" release=\"release\"></episode-release></md-list></div></md-dialog-content>");
$templateCache.put("plugins/series/components/series-begin-dialog/series-begin-dialog.tmpl.html","<md-toolbar><div class=\"md-toolbar-tools\"><h2>Series Begin</h2><span flex=\"\"></span><md-button class=\"md-icon-button\" ng-click=\"vm.cancel()\"><md-icon md-font-icon=\"fa-times\" class=\"fa fa-lg\" aria-label=\"close dialog\"></md-icon></md-button></div></md-toolbar><form name=\"seriesBeginForm\" ng-submit=\"vm.saveBegin()\"><md-dialog-content><div class=\"md-dialog-content\"><md-input-container><label>Begin</label> <input type=\"text\" ng-model=\"vm.begin\"></md-input-container></div></md-dialog-content><md-dialog-actions><md-button ng-click=\"vm.cancel()\" class=\"md-default md-raised\">Cancel</md-button><md-button type=\"submit\" ng-disabled=\"!vm.begin || vm.begin == vm.originalBegin\" class=\"md-primary md-raised\">Save</md-button></md-dialog-actions></form>");
$templateCache.put("plugins/series/components/series-entry/series-entry.tmpl.html","<md-card flex=\"\" class=\"series-entry\"><img ng-src=\"api/cached/?url={{ ::vm.show.metadata.banner }}\" class=\"md-card-image\"><md-card-title flex=\"initial\"><md-card-title-text><span class=\"md-headline\">{{ ::vm.show.name }} <span class=\"rating\" ng-if=\"::vm.show.metadata\"><md-icon md-font-set=\"fa\" md-font-icon=\"fa-star\"></md-icon><span class=\"md-suhead\">{{ ::vm.show.metadata.rating }}</span></span></span><md-divider></md-divider><span class=\"md-subhead\">Latest: {{ ::vm.show.latest_episode.identifier || \'No episode downloaded\' }}</span> <span class=\"md-subhead second-subhead\">Begin Episode: {{ vm.show.begin_episode.identifier || \'No begin set\' }}</span><md-divider></md-divider><md-chips ng-model=\"vm.show.metadata.genres\" readonly=\"true\" ng-if=\"::vm.show.metadata\"><md-chip-template>{{ $chip }}</md-chip-template></md-chips></md-card-title-text></md-card-title><md-card-content flex=\"\" layout-gt-xs=\"row\" layout-xs=\"column\" class=\"custom-card\"><p ng-if=\"::vm.show.metadata\">{{ ::vm.show.metadata.overview }}</p><p ng-hide=\"::vm.show.metadata\">No metadata found</p></md-card-content><md-card-actions layout=\"row\" layout-align=\"start center\"><md-button class=\"md-primary md-raised\" ng-click=\"vm.toggleEpisodes(show)\">Episodes</md-button></md-card-actions><md-fab-speed-dial md-direction=\"left\" class=\"md-scale more-btn\"><md-fab-trigger><md-button aria-label=\"More\" class=\"md-fab md-mini\"><i class=\"fa fa-bars\" aria-hidden=\"true\"></i></md-button></md-fab-trigger><md-fab-actions><md-button ng-click=\"vm.setBegin()\" aria-label=\"Set Series begin\" class=\"md-fab md-raised md-mini\"><i class=\"fa fa-play\" aria-hidden=\"true\"></i></md-button><md-button ng-click=\"vm.forgetShow()\" aria-label=\"forget show\" class=\"md-fab md-raised md-mini\"><i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></md-button><md-button ng-click=\"vm.alternateName()\" aria-label=\"alternate names\" class=\"md-fab md-raised md-mini\"><i class=\"fa fa-share-alt\" aria-hidden=\"true\"></i></md-button></md-fab-actions></md-fab-speed-dial><ng-transclude></ng-transclude></md-card>");
$templateCache.put("plugins/series/components/series-episode/series-episode.tmpl.html","<md-list-item layout=\"row\" layout-align=\"space-between\" class=\"series-episode\"><h3 flex=\"\">{{ ::vm.episode.identifier }}</h3><md-button ng-disabled=\"vm.episode.number_of_releases == 0\" ng-click=\"vm.showReleases()\">Releases</md-button><md-button ng-click=\"vm.deleteEpisode()\">Delete Episode</md-button><md-button ng-disabled=\"vm.episode.number_of_releases == 0\" ng-click=\"vm.deleteReleases()\">Delete Releases</md-button><md-button ng-disabled=\"vm.episode.number_of_releases == 0\" ng-click=\"vm.resetReleases()\">Reset Releases</md-button></md-list-item>");
$templateCache.put("plugins/series/components/series-episodes/series-episodes.tmpl.html","<md-card layout=\"column\" layout-wrap=\"\" layout-fill=\"\" class=\"episodes-list-card\"><md-card-content ng-style=\"{\'background-image\':\'url({{vm.show.metadata.banner}})\'}\"><md-button class=\"md-fab md-mini hide-episodes-button\" ng-click=\"vm.hideEpisodes({ show: vm.show })\" aria-label=\"hide the episodes\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i></md-button><div class=\"episodes-backdrop-image-shadow\"></div><ng-transclude></ng-transclude><div class=\"episodes-list\"><series-episode episode=\"episode\" delete-episode=\"vm.deleteEpisode(episode)\" show=\"vm.show\" ng-repeat=\"episode in vm.episodes\"></series-episode></div><fg-pagination load-data=\"vm.getEpisodes(page)\" link-header=\"vm.linkHeader\" current-page=\"vm.currentPage\" class=\"episodes-pager\"></fg-pagination></md-card-content></md-card>");}]);