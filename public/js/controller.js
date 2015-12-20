angular.module('Blog')
    .controller('LoginCtrl', LoginCtrl)
    .controller('RegisterCtrl', RegisterCtrl)
    .controller('SettingCtrl', SettingCtrl)
    .controller('ArticleCtrl', ArticleCtrl)
    .controller('ListCtrl', ListCtrl)
    .controller('HeaderCtrl', HeaderCtrl)
    .controller('SideCtrl', SideCtrl)
    .controller('PostCtrl', PostCtrl)
    .controller('ArticleDeleteCtrl', ArticleDeleteCtrl)
    .controller('CommentCtrl', ['BlogService', function(BlogService) {

    }]);

LoginCtrl.$inject = ['BlogService', '$localStorage', '$rootScope', '$state'];
/*@ngInject*/
function LoginCtrl(BlogService, $localStorage, $rootScope, $state) {
    var vm = this;
    vm.errorMsg = '';
    vm.login = function() {
        BlogService.login({
            name: vm.name,
            password: vm.password
        }).then(function(res) {
            var user = res.data.user;
            if (user) {
                $localStorage.user = {
                    name: user.name,
                    token: user.token
                };
                console.log($rootScope.previousState);
                if ($rootScope.previousState) {
                    $state.go($rootScope.previousState, $rootScope.previousParams)
                } else {
                    $state.go('index')
                }
            } else {
                console.log(res.data.err || res.data.message);
                vm.errorMsg = res.data.message || '登陆发成错误。';
            }
        }, function(err) {
            console.log(err);
            vm.errorMsg = '登陆发成错误。'
        });
    }
}

RegisterCtrl.$inject = ['BlogService', '$localStorage', '$location'];
/*@ngInject*/
function RegisterCtrl(BlogService, $localStorage, $location) {
    var vm = this;
    vm.errorMsg = '';
    vm.register = function() {
        if (vm.password !== vm.repassword) {
            vm.errorMsg = '两次密码不一致。';
            return;
        }
        BlogService.register({
            name: vm.name,
            password: vm.password,
            email: vm.email
        }).then(function(res) {
            var user = res.data.user;
            if (user) {
                $localStorage.user = {
                    name: user.name,
                    token: user.token
                };
                $location.path('/');
            } else {
                console.log(res.data.err || res.data.message);
                vm.errorMsg = res.data.message || '注册失败！';
            }
        }, function(err) {
            console.log(err);
            vm.errorMsg = '注册失败！';
        });
    }
}

SettingCtrl.$inject = ['BlogService', 'FileService', '$scope', '$http'];
/*@ngInject*/
function SettingCtrl(BlogService, FileService, $scope, $http) {
    $scope.x1 = 0;
    $scope.y1 = 0;
    $scope.x2 = 0;
    $scope.y2 = 0;

    $scope.getFile = function() {
        $scope.progress = 0;
        FileService.readAsDataUrl($scope.file, $scope)
            .then(function(result) {
                $scope.imageSrc = result;
                $('#imgPreview').imgAreaSelect({
                    aspectRatio: "1:1",
                    handles: true,
                    // x1: 0,
                    // y1: 0,
                    // x2: 48,
                    // y2: 48,
                    minWidth: 48,
                    minHeight: 48,
                    onSelectEnd: function(img, selection) {
                        $scope.x1 = selection.x1;
                        $scope.y1 = selection.y1;
                        $scope.x2 = selection.x2;
                        $scope.y2 = selection.y2;
                    }
                });
            });

        $scope.$on('fileProgress', function(e, progress) {
            $scope.progress = progress.loaded / progress.total;
        });
    };

    $scope.upload = function() {
        var fd = new FormData();
        fd.append("file", $scope.headImg);
        fd.append('x1', $scope.x1);
        fd.append('y1', $scope.y1);
        fd.append('x2', $scope.x2);
        fd.append('y2', $scope.y2);
        $http({
            method: 'POST',
            url: '/imgUpload',
            data: fd,
            headers: {
                'Content-Type': undefined
            },
            transformRequest: angular.identity
        }).success(function() {
            window.location.reload();
        }).error(function(err) {
            console.log(err);
        });
    }
}

ArticleCtrl.$inject = ['BlogService', 'pubSubService', '$location', '$localStorage', '$state', '$uibModal'];
/*@ngInject*/
function ArticleCtrl(BlogService, pubSubService, $location, $localStorage, $state, $uibModal) {
    var vm = this;
    var params = $location.path().split('/');
    if (params.length == 4 && params[1] == 'user') {
        var name = params[2];
        var id = params[3];
        BlogService.getArticle(name, id).then(function(data) {
            var article = data.data;
            var user = $localStorage.user;
            if (article && user && user.name) {
                vm.enableEdit = user.name === name;
                vm.time = article.time;
                vm.name = article.name;
                vm.title = article.title;
                vm.content = article.content;
                vm.deleteArticle = function() {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'deleteArticleModal',
                        controller: 'ArticleDeleteCtrl',
                        controllerAs: 'adc',
                        resolve: {
                            articleId: function() {
                                return article._id;
                            }
                        }
                    });
                }

                vm.editArticle = function() {
                    $state.go('index.post', {
                        id: article._id
                    });
                }
                pubSubService.publish('notFind', false);
            } else {
                vm.errorMsg = '未找到相关话题。';
                pubSubService.publish('notFind', true);
            }
        }, function(err) {
            console.log(err);
            vm.articles = [];
        });
    }
}

ArticleDeleteCtrl.$inject = ['$modalInstance', 'articleId', 'BlogService'];
/*@ngInject*/
function ArticleDeleteCtrl($modalInstance, articleId, BlogService) {
    this.confirmDelete = function() {
        BlogService.deleteArticle(articleId).then(function() {
            window.location.href = '/';
        }, function(err) {
            console.log(err);
        });
    }
    this.cancelDelete = function() {
        $modalInstance.close();
    }
}

ListCtrl.$inject = ['BlogService', '$location', '$state'];
/*@ngInject*/
function ListCtrl(BlogService, $location, $state) {
    var vm = this;
    var params = $location.path().split('/');
    var name = '';
    vm.isUserPage = false;
    vm.name = '';
    vm.stateToUser = function(name) {
        $state.go('index.user', {
            name: name
        });
    }
    vm.viewArticle = function(name, id) {
        $location.path('/user/' + name + '/' + id);
    }
    if (params.length == 3 && params[1] == 'user') {
        name = params[2];
        vm.isUserPage = true;
        vm.name = name;
    }
    vm.currentPage = 1;
    vm.pageChanged = function() {
        initArticles();
    }
    initArticles();

    function initArticles() {
        BlogService.getAllArticles(vm.currentPage - 1, name).then(function(res) {
            var data = res.data;
            if (data === false) {
                vm.errorMsg = '发生错误。';
            }
            if (data.user === false) {
                vm.errorMsg = '该用户不存在。';
            } else {
                vm.articles = data.articles;
                vm.articleCount = data.count;
            }
        }, function(err) {
            console.log(err);
            vm.articles = [];
        });
    }
}

HeaderCtrl.$inject = ['$localStorage', '$location'];
/*@ngInject*/
function HeaderCtrl($localStorage, $location) {
    var vm = this;
    vm.nologin = $localStorage.user == null;
    vm.logout = function() {
        if ($localStorage.user) {
            delete $localStorage.user;
        }
        vm.nologin = true;
        $location.path('/login');
    }
}

SideCtrl.$inject = ['$localStorage', 'pubSubService', '$location', '$state'];
/*@ngInject*/
function SideCtrl($localStorage, pubSubService, $location, $state) {
    var vm = this;
    var params = $location.path().split('/'),
        user = $localStorage.user;

    vm.title = '';
    vm.name = '';
    vm.showUser = false;
    vm.showLoginBtn = false;
    vm.showPostBtn = user;
    vm.stateToUser = function() {
        $state.go('index.user', {
            name: vm.name
        });
    }

    /*如果是文章页面－－显示作者信息*/
    if (params.length == 4 && params[1] == 'user' && params[3].length > 0) {
        showAuthor();
    } else {
        showUser();
    }

    function showAuthor() {
        pubSubService.subscribe('notFind', function(event, data) {
            if (data === true) {
                showUser();
            } else {
                vm.showLoginBtn = false;
                vm.showUser = true;
                vm.title = '作者';
                vm.name = params[2];
                vm.userImg = 'images/headers/' + params[2] + '.png';
            }
        });
    }

    function showUser() {
        vm.showUser = true;
        vm.title = '用户信息';
        if (user) {
            vm.name = user.name;
            vm.userImg = 'images/headers/' + user.name + '.png';
            vm.showLoginBtn = false;
        } else {
            vm.showLoginBtn = true;
        }
    }
}

PostCtrl.$inject = ['BlogService', '$localStorage', '$location'];
/*@ngInject*/
function PostCtrl(BlogService, $localStorage, $location) {
    var vm = this;
    vm.errorMsg = '';
    var editor = new Editor();
    //初始化编辑器
    editor.render(document.getElementById('editor'));

    var params = $location.path().split('/'),
        articleId = '';
    if (params.length === 3 && params[2]) {
        //文章id
        articleId = params[2];
        BlogService.getArticleForEdit(articleId).then(function(data) {
            var article = data.data;
            if (article) {
                vm.title = article.title;
                editor.codemirror.setValue(article.content);

            } else {
                vm.errorMsg = '未找到相关话题。';
            }
        }, function(err) {
            console.log(err);
            vm.errorMsg = '未找到相关话题。';
        });
    }
    this.postSubmit = function() {
        if (!vm.title || !vm.title.trim()) {
            vm.errorMsg = '请填写标题！';
            return;
        }
        var user = $localStorage.user;
        if (!user) {
            return $location.path('/login');
        }
        var value = editor.codemirror.getValue();
        if (value) {
            BlogService.postArticle({
                name: user.name,
                title: vm.title,
                content: value,
                id: articleId
            }).then(function(res) {
                if (res.data === false) {
                    vm.errorMsg = '发表失败！';
                } else {
                    $location.path('/user/' + user.name + '/' + res.data);
                }
            }, function(err) {
                console.log(err);
                vm.errorMsg = '发表失败！';
            });
        } else {
            vm.errorMsg = '请填写内容！';
        }
    }
}
