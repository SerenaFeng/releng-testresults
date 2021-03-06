/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function () {
    'use strict';

    /** Main app module where application dependencies are listed. */
    angular
        .module('testapiApp', [
            'ui.router','ui.bootstrap', 'cgBusy',
            'ngResource', 'angular-confirm', 'angular-json-tree'
        ]);

    angular
        .module('testapiApp')
        .config(configureRoutes);

    angular
        .module('testapiApp')
        .service("keepState", function(){
            this.filter = {};
        });

    angular
        .module('testapiApp')
        .service('sortService', function(){

            this.sortFunction = function(data, field, ascending){
                if(ascending){
                    data.sort(function(a,b) {
                        if (a[field].toLowerCase() > b[field].toLowerCase()) {
                            return -1;
                        }
                        if (a[field].toLowerCase() < b[field].toLowerCase()) {
                            return 1;
                        }
                        return 0;
                    });
                }else{
                    data.sort(function(a,b) {
                        if (a[field].toLowerCase() < b[field].toLowerCase()) {
                            return -1;
                        }
                        if (a[field].toLowerCase() > b[field].toLowerCase()) {
                            return 1;
                        }
                            return 0;
                    });
                }
                return data
            }
        });

    angular
        .module('testapiApp')
        .service('dataFieldService', function(){
            this.dataFunction = dataFunction
            function dataFunction(data, data_field){
                Object.keys(data).forEach(function (key) {
                    if (typeof data[key] === 'object' && data[key] != null) {
                        return dataFunction(data[key], data_field);
                    }
                    data_field[key] = key.replace(/_/g, " ").trim();
                });
                return data_field;
            }
        });

    angular
        .module('testapiApp')
        .directive('dynamicModel', ['$compile', '$parse', function ($compile, $parse) {
            return {
                restrict: 'A',
                terminal: true,
                priority: 100000,
                link: function (scope, elem) {
                    var name = $parse(elem.attr('dynamic-model'))(scope);
                    elem.removeAttr('dynamic-model');
                    elem.attr('ng-model', name);
                    $compile(elem)(scope);
                }
            };
        }]);

    angular
        .module('testapiApp')
        .directive('ngEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if(event.which === 13) {
                        scope.$apply(function (){
                            scope.$eval(attrs.ngEnter);
                        });
                        event.preventDefault();
                    }
                });
            };
        });

    configureRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

    /**
     * Handle application routing. Specific templates and controllers will be
     * used based on the URL route.
     */
    function configureRoutes($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider.
            state('home', {
                url: '/',
                templateUrl: 'testapi-ui/components/home/home.html'
            }).
            state('about', {
                url: '/about',
                templateUrl: 'testapi-ui/components/about/about.html'
            }).
            state('pods', {
                url: '/pods',
                templateUrl: 'testapi-ui/components/pods/pods.html',
                controller: 'PodsController as ctrl'
            }).
            state('pod', {
                url: '/pods/:name',
                templateUrl: 'testapi-ui/components/pods/pod/pod.html',
                controller: 'PodController as ctrl'
            }).
            state('projects', {
                url: '/projects',
                templateUrl: 'testapi-ui/components/projects/projects.html',
                controller: 'ProjectsController as ctrl'
            }).
            state('project', {
                url: '/projects/:name',
                templateUrl: 'testapi-ui/components/projects/project/project.html',
                controller: 'ProjectController as ctrl'
            }).
            state('scenarios', {
                url: '/scenarios',
                templateUrl: 'testapi-ui/components/scenarios/scenarios.html',
                controller: 'ScenariosController as ctrl'
            }).
            state('scenario', {
                url: '/scenarios/:name',
                templateUrl: 'testapi-ui/components/scenarios/scenario/scenario.html',
                controller: 'ScenarioController as ctrl'
            }).
            state('testCase', {
                url: '/projects/:project_name/:name',
                templateUrl: 'testapi-ui/components/projects/project/testCases/testCase/testCase.html',
                controller: 'TestCaseController as ctrl'
            }).
            state('results', {
                url: '/results',
                templateUrl: 'testapi-ui/components/results/results.html',
                controller: 'ResultsController as ctrl'
            }).
            state('result', {
                url: '/result/:_id',
                templateUrl: 'testapi-ui/components/results/result/result.html',
                controller: 'ResultController as ctrl'
            }).
            state('deployresults', {
                url: '/deployresults',
                templateUrl: 'testapi-ui/components/deploy-results/deployResults.html',
                controller: 'DeployResultsController as ctrl'
            }).
            state('deployresult', {
                url: '/deployresults/:_id',
                templateUrl: 'testapi-ui/components/deploy-results/deploy-result/deployResult.html',
                controller: 'DeployResultController as ctrl'
            }).
            state('profile', {
                url: '/profile',
                templateUrl: 'testapi-ui/components/profile/profile.html',
                controller: 'ProfileController as ctrl'
            }).
            state('authFailure', {
                url: '/auth_failure',
                templateUrl: 'testapi-ui/components/home/home.html',
                controller: 'AuthFailureController as ctrl'
            }).
            state('logout', {
                url: '/logout',
                templateUrl: 'testapi-ui/components/logout/logout.html',
                controller: 'LogoutController as ctrl'
            });
    }

    angular
        .module('testapiApp')
        .config(disableHttpCache);

    disableHttpCache.$inject = ['$httpProvider'];

    /**
     * Disable caching in $http requests. This is primarily for IE, as it
     * tends to cache Angular IE requests.
     */
    function disableHttpCache($httpProvider) {
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get.Pragma = 'no-cache';
    }

    angular
        .module('testapiApp')
        .run(setup);

    setup.$inject = [
        '$http', '$rootScope', '$window', '$state', 'testapiApiUrl', "authenticate"
    ];

    /**
     * Set up the app with injections into $rootscope. This is mainly for auth
     * functions.
     */
    function setup($http, $rootScope, $window, $state, testapiApiUrl, authenticate) {

        $rootScope.auth = {};
        $rootScope.authenticate = authenticate
        $rootScope.auth.doSignIn = doSignIn;
        $rootScope.auth.doSignOut = doSignOut;
        $rootScope.auth.doSignCheck = doSignCheck;
        $rootScope.auth.doSubmitterCheck = doSubmitterCheck;

        var sign_in_url = testapiApiUrl + '/auth/signin';
        var sign_out_url = testapiApiUrl + '/auth/signout';
        var profile_url = testapiApiUrl + '/profile';

        /** This function initiates a sign in. */
        function doSignIn() {
            $window.location.href = sign_in_url;
        }

        /** This function will initate a sign out. */
        function doSignOut() {
            if(authenticate){
                $rootScope.auth.currentUser = null;
                $rootScope.auth.isAuthenticated = false;
                $rootScope.auth.projectNames = [];
                $window.location.href = sign_out_url;
            }else{
                $state.go("home", {reload: true})
            }
        }

        /**
         * This function checks to see if a user is logged in and
         * authenticated.
         */
        function doSignCheck() {
            if(authenticate){
                return $http.get(profile_url, {withCredentials: true}).
                    success(function (data) {
                        $rootScope.auth.currentUser = data;
                        $rootScope.auth.isAuthenticated = true;
                        $rootScope.auth.projectNames = $rootScope.auth.doSubmitterCheck(data.groups);
                    }).
                    error(function () {
                        $rootScope.auth.currentUser = null;
                        $rootScope.auth.isAuthenticated = false;
                        $rootScope.auth.projectNames  = [];
                    });
            }else{
                $rootScope.auth.currentUser = null;
                $rootScope.auth.isAuthenticated = true;
                $rootScope.auth.projectNames = []
            }
        }

        function doSubmitterCheck(groups){
            var projectNames = []
            for(var index=0;index<groups.length; index++){
                if(groups[index].indexOf('-submitters')>=0){
                    projectNames.push(groups[index].split('-')[2])
                }
            }
            return projectNames;
        }

        $rootScope.auth.doSignCheck();
    }

    angular
        .element(document)
        .ready(loadConfig);

    /**
     * Load config and start up the angular application.
     */
    function loadConfig() {

        var $http = angular.injector(['ng']).get('$http');

        /**
         * Store config variables as constants, and start the app.
         */
        function startApp(config) {
            // Add config options as constants.
            angular.forEach(config, function(value, key) {
                angular.module('testapiApp').constant(key, value);
            });

            angular.bootstrap(document, ['testapiApp']);
        }

        $http.get('testapi-ui/config.json').success(function (data) {
            startApp(data);
        }).error(function () {
            startApp({});
        });
    }
})();
