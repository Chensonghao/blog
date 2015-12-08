angular.module('Blog')
    .factory('pubSubService', pubSubService)
    .factory('BlogService', BlogService)
    .factory('FileReader', ["$q", "$log", function($q, $log) {
        var onLoad = function(reader, deferred, scope) {
            return function() {
                scope.$apply(function() {
                    deferred.resolve(reader.result);
                });
            };
        };

        var onError = function(reader, deferred, scope) {
            return function() {
                scope.$apply(function() {
                    deferred.reject(reader.result);
                });
            };
        };

        var getReader = function(deferred, scope) {
            var reader = new FileReader();
            reader.onload = onLoad(reader, deferred, scope);
            reader.onerror = onError(reader, deferred, scope);
            return reader;
        };

        var readAsDataURL = function(file, scope) {
            var deferred = $q.defer();
            var reader = getReader(deferred, scope);
            reader.readAsDataURL(file);
            return deferred.promise;
        };

        return {
            readAsDataUrl: readAsDataURL
        };
    }]);


BlogService.$inject = ['$http']
    /*@ngInject*/
function BlogService($http) {
    return {
        getArticle: function(name, id) {
            return $http.get('/post/getArticle/' + name + '/' + id);
        },
        getAllArticles: function(name) {
            return $http.get('/post/getAllArticles/' + (name || ''));
        },
        register: function(user) {
            return $http.post('/user/register/', user);
        },
        login: function(user) {
            return $http.post('/user/login/', user);
        },
        postArticle: function(article) {
            return $http.post('/post/postArticle/', article);
        }
    }
}
pubSubService.$inject = ['$rootScope']
    /*@ngInject*/
function pubSubService($rootScope) {
    var _DATA_UPDATED_ = '_DATA_UPDATED_';
    var publish = function(msg, data) {
        msg = msg || _DATA_UPDATED_;
        data = data || {};
        $rootScope.$emit(msg, data);
    };
    var subscribe = function(msg, func, scope) {
        if (!angular.isFunction(func)) {
            console.log("pubSubService.subscribe need a callback function");
            return;
        }
        msg = msg || _DATA_UPDATED_;
        var unbind = $rootScope.$on(msg, func);
        //可控的事件反绑定机制
        if (scope) {
            scope.$on('$destroy', unbind);
        }
    };
    return {
        publish: publish,
        subscribe: subscribe
    };
}
