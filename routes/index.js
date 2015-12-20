var Article = require('../models/article'),
    User = require('../models/user'),
    multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();

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

    app.post('/imgUpload', multipartyMiddleware, User.authorize, User.upload);
    app.post('/user/register', User.register);
    app.post('/user/login', User.login);
    app.get('/post/getArticle/:name/:id', Article.getArticle);
    app.get('/post/getArticleForEdit/:id', User.authorize, Article.getArticleForEdit);
    app.get('/post/getAllArticles/:index', Article.getAllArticles);
    app.get('/post/getAllArticles/:index/:name', Article.getAllArticles);
    app.post('/post/postArticle', User.authorize, Article.postArticle);
    app.delete('/post/deleteArticle/:id', User.authorize, Article.deleteArticle);
};
