angular.module('Blog')
    .controller('LoginCtrl', LoginCtrl)
    .controller('RegisterCtrl', RegisterCtrl)
    .controller('SettingCtrl', SettingCtrl)
    .controller('ArticleCtrl', ArticleCtrl)
    .controller('ListCtrl', ListCtrl)
    .controller('HeaderCtrl', HeaderCtrl)
    .controller('SideCtrl', SideCtrl)
    .controller('PostCtrl', PostCtrl)
    .controller('UploadCtrl', ['BlogService', function(BlogService) {

    }])
    .controller('CommentCtrl', ['BlogService', function(BlogService) {

    }]);

LoginCtrl.$inject = ['BlogService', '$localStorage', '$location'];
/*@ngInject*/
function LoginCtrl(BlogService, $localStorage, $location) {
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
                $location.path('/');
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

SettingCtrl.$inject = ['BlogService', 'FileReader','$scope'];
/*@ngInject*/
function SettingCtrl(BlogService, FileReader,$scope) {
    $scope.getFile = function() {
        FileReader.readAsDataUrl($scope.file, $scope)
            .then(function(result) {
                $scope.imageSrc = result;
            });
    };
}

ArticleCtrl.$inject = ['BlogService', 'pubSubService', '$location'];
/*@ngInject*/
function ArticleCtrl(BlogService, pubSubService, $location) {
    var vm = this;
    var params = $location.path().split('/');
    if (params.length == 4 && params[1] == 'user') {
        var name = params[2];
        var id = params[3];
        BlogService.getArticle(name, id).then(function(data) {
            var article = data.data;
            if (article) {
                vm.time = article.time;
                vm.name = article.name;
                vm.title = article.title;
                vm.content = article.content;
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

ListCtrl.$inject = ['BlogService', '$location'];
/*@ngInject*/
function ListCtrl(BlogService, $location) {
    var vm = this;
    var params = $location.path().split('/');
    var name = '';
    vm.isUserPage = false;
    vm.name = '';
    vm.viewArticle = function(name, id) {
        $location.path('/user/' + name + '/' + id);
    }
    if (params.length == 3 && params[1] == 'user') {
        name = params[2];
        vm.isUserPage = true;
        vm.name = name;
    }
    BlogService.getAllArticles(name).then(function(data) {
        if (data.data === false) {
            vm.errorMsg = '发生错误。';
        }
        if (data.data.user === false) {
            vm.errorMsg = '该用户不存在。';
        } else {
            vm.articles = data.data;
        }
    }, function(err) {
        console.log(err);
        vm.articles = [];
    });
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

SideCtrl.$inject = ['$localStorage', 'pubSubService', '$location', '$scope'];
/*@ngInject*/
function SideCtrl($localStorage, pubSubService, $location, $scope) {
    var vm = this;
    var params = $location.path().split('/'),
        user = $localStorage.user,
        isLogin = user !== null;

    vm.title = '';
    vm.name = '';
    vm.showUser = false;
    vm.showLoginBtn = false;
    vm.showPostBtn = isLogin;

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
            }
        });
    }

    function showUser() {
        vm.showUser = true;
        vm.title = '用户信息';
        if (isLogin) {
            vm.name = user.name;
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
    editor.render(document.getElementById('editor'));

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
                content: value
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
