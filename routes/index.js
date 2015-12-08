var Post = require('../models/post'),
    User = require('../models/user');

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index.html');
    });


    app.get('/registerView', User.unAuthorize, function(req, res) {
        res.render('register.html');
    });
    app.get('/loginView', User.unAuthorize, function(req, res) {
        res.render('login.html');
    });
    app.get('/settingView', User.authorize, function(req, res) {
        res.render('setting.html');
    });
    app.get('/headerView', function(req, res) {
        res.render('header.html');
    });
    app.get('/bodyView', function(req, res) {
        res.render('body.html');
    });
    app.get('/listView', function(req, res) {
        res.render('articleList.html');
    });
    app.get('/articleView', function(req, res) {
        res.render('article.html');
    });
    app.get('/postView', User.authorize, function(req, res) {
        res.render('post.html');
    });
    app.get('/sideView', function(req, res) {
        res.render('side.html');
    });
    app.get('/markdownView', function(req, res) {
        res.render('markdown.html');
    });


    app.post('/user/register', User.register);
    app.post('/user/login', User.login);
    app.get('/post/getArticle/:name/:id', Post.getArticle);
    app.get('/post/getAllArticles', Post.getAllArticles);
    app.get('/post/getAllArticles/:name', Post.getAllArticles);
    app.post('/post/postArticle', User.authorize, Post.postArticle);
};
