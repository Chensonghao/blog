angular.module('Blog', ['ui.router', 'ui.bootstrap', 'ngStorage', 'angularFileUpload'])
    .run(['$rootScope', '$state', '$stateParams', '$templateCache', function($rootScope, $state, $stateParams, $templateCache) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        var stateChangeSuccess = $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);

        function stateChangeSuccess(event, toState, toParams, fromState, fromParams) {
            $rootScope.previousState = fromState.name;
            $rootScope.previousParams = fromParams;
            /*ui-router会自动缓存模板，
          以下两个模板需要登录后才能访问，所以不予缓存*/
            $templateCache.remove('/settingView');
            $templateCache.remove('/postView');
        }
    }])
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {
        $urlRouterProvider
            .when('/qwe', '/login')
            .when('/register', '/register')
            .otherwise('/');
        $stateProvider
            .state('index', {
                url: '/',
                views: {
                    '': {
                        templateUrl: '/bodyView'
                    },
                    'header@index': {
                        templateUrl: '/headerView',
                        controller: 'HeaderCtrl',
                        controllerAs: 'header'
                    },
                    'side@index': {
                        templateUrl: '/sideView',
                        controller: 'SideCtrl',
                        controllerAs: 'side'
                    },
                    'main@index': {
                        templateUrl: '/listView',
                        controller: 'ListCtrl',
                        controllerAs: 'list'
                    }
                }
            })
            .state('index.login', {
                url: '^/login',
                views: {
                    'side@index': {
                        template: '',
                    },
                    'header@index': {
                        templateUrl: '/headerView',
                        controller: 'HeaderCtrl',
                        controllerAs: 'header'
                    },
                    'main@index': {
                        templateUrl: '/loginView',
                        controller: 'LoginCtrl',
                        controllerAs: 'login'
                    }
                }
            })
            .state('index.register', {
                url: '^/reg',
                views: {
                    'side@index': {
                        template: '',
                    },
                    'header@index': {
                        templateUrl: '/headerView',
                        controller: 'HeaderCtrl',
                        controllerAs: 'header'
                    },
                    'main@index': {
                        templateUrl: '/registerView',
                        controller: 'RegisterCtrl',
                        controllerAs: 'register'
                    }
                }
            })
            .state('index.setting', {
                url: '^/setting',
                views: {
                    'side@index': {
                        templateUrl: '/sideView',
                        controller: 'SideCtrl',
                        controllerAs: 'side'
                    },
                    'main@index': {
                        templateUrl: '/settingView',
                        controller: 'SettingCtrl',
                        controllerAs: 'setting'
                    }
                }
            })
            .state('index.post', {
                url: '^/post',
                views: {
                    'side@index': {
                        templateUrl: '/markdownView'
                    },
                    'main@index': {
                        templateUrl: '/postView',
                        controller: 'PostCtrl',
                        controllerAs: 'post'
                    }
                }
            })
            .state('index.user', {
                url: '^/user/{name}',
                views: {
                    'side@index': {
                        templateUrl: '/sideView',
                        controller: 'SideCtrl',
                        controllerAs: 'side'
                    },
                }
            })
            .state('index.article', {
                url: '^/user/{name}/{id}',
                views: {
                    'main@index': {
                        templateUrl: '/articleView',
                        controller: 'ArticleCtrl',
                        controllerAs: 'article'
                    },
                    'side@index': {
                        templateUrl: '/sideView',
                        controller: 'SideCtrl',
                        controllerAs: 'side'
                    }
                }
            })
        $httpProvider.interceptors.push(interceptors);
    }]);

interceptors.$inject = ['$q', '$localStorage', '$rootScope'];
/*@ngInject*/
function interceptors($q, $localStorage, $rootScope) {
    return {
        'request': function(config) {
            config.headers = config.headers || {};
            var user = $localStorage.user;
            if (user) {
                config.headers.username = user.name;
                config.headers.authorization = 'Bearer ' + user.token;
            }
            return config;
        },
        'response': function(response) {
            var token = response.headers('authorization'),
                localUser = $localStorage.user;
            if (token && localUser) {
                var brearerToken = token.split(' ');
                $localStorage.user = {
                    name: localUser.name,
                    token: brearerToken[1]
                }
            }
            return $q.resolve(response);
        },
        'responseError': function(response) {
            if (response.status === 401) {
                if ($localStorage.user) {
                    delete $localStorage.user;
                }
                $rootScope.$state.go('index.login');
            }
            if (response.status === 403) {
                $rootScope.$state.go('index');
            }
            return $q.reject(response);
        }
    }
}
