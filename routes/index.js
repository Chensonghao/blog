// var express = require('express');
// var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;

var crypto = require('crypto');
var User = require('../models/user');

function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录。');
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登陆。');
        res.redirect('back');
    }
    next();
}
module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index', {
            title: '主页',
            error: req.flash('error').toString(),
            success: req.flash('success').toString(),
            user: req.session.user
        });
    });

    app.get('/register', checkNotLogin);
    app.get('/register', function(req, res) {
        res.render('register', {
            title: '注册',
            error: req.flash('error').toString(),
            success: req.flash('success').toString(),
            user: req.session.user
        });
    });

    app.post('/register', checkNotLogin);
    app.post('/register', function(req, res) {
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];
        if (password !== password_re) {
            req.flash('两次输入不一致。');
            return res.redirect('/register');
        }

        //生成密码的md5值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            name: name,
            password: password,
            email: req.body.email
        });
        //检查用户名是否存在
        User.get(newUser.name, function(err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            if (user) {
                req.flash('error', '用户已存在。');
                return res.redirect('/register');
            }
            //如果不存在用户则新增
            newUser.save(function(err, user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/register');
                }
                req.session.user = user; //用户信息存入session
                req.flash('success', '注册成功');
                return res.redirect('/'); //注册成功，返回首页
            });
        });
    });

    app.get('/login', checkNotLogin);
    app.get('/login', function(req, res) {
        res.render('login', {
            title: '登陆',
            error: req.flash('error').toString(),
            success: req.flash('success').toString(),
            user: req.session.user
        });
    });
    app.post('/login', checkNotLogin);
    app.post('/login', function(req, res) {
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        User.get(req.body.name, function(err, user) {
            if (!user) {
                req.flash('error', '用户不存在。');
                return res.redirect('/login');
            }
            //检查密码是否一致
            if (user.password != password) {
                req.flash('error', '密码错误。');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success', '登陆成功。');
            res.redirect('/');
        });
    });
    app.get('/post', checkLogin);
    app.get('/post', function(res, req) {
        res.render('post',{
            title:'发表',
            user:req.session.user,
            error:req.flash('error').toString(),
            success:req.falsh('success').toString()
        });
    });
    app.post('/post', checkLogin);
    app.post('/post', function(res, req) {

    });

    app.get('logout', checkLogin);
    app.get('/logout', function(req, res) {
        req.session.user = null;
        req.flash('success', '登出成功。');
        res.redirect('/');
    });
}
