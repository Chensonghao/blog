angular.module('Blog')
    .factory('pubSubService', pubSubService)
    .factory('BlogService', BlogService)
    .factory('FileService', FileService);


BlogService.$inject = ['$http'];
/*@ngInject*/
function BlogService($http) {
    return {
        getArticle: function(name, id) {
            return $http.get('/post/getArticle/' + name + '/' + id);
        },
        getArticleForEdit: function(id) {
            return $http.get('/post/getArticleForEdit/' + id);
        },
        getAllArticles: function(index, name, keyword) {
            return $http.post('/post/getAllArticles/', {
                index: index,
                name: (name || ''),
                keyword: (keyword || '')
            });
        },
        register: function(user) {
            return $http.post('/user/register/', user);
        },
        login: function(user) {
            return $http.post('/user/login/', user);
        },
        postArticle: function(article) {
            return $http.post('/post/postArticle/', article);
        },
        deleteArticle: function(id) {
            return $http.delete('/post/deleteArticle/' + id);
        }
    }
}

pubSubService.$inject = ['$rootScope'];
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

FileService.$inject = ['$q'];
/*@ngInject*/
function FileService($q) {
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
    var onProgress = function(reader, scope) {
        return function(event) {
            scope.$broadcast('fileProgress', {
                total: event.total,
                loaded: event.loaded
            });
        }
    };
    var readAsDataURL = function(file, scope) {
        var deferred = $q.defer();

        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        reader.onprogress = onProgress(reader, scope);
        reader.readAsDataURL(file);
        return deferred.promise;
    };
    return {
        readAsDataUrl: readAsDataURL
    };
}
