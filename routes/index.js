// var express = require('express');
// var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images')
    },
    filename: function(req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, file.originalname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});
var uploadFile = multer({
    storage: storage
        // limits: {
        //     fieldSize: 1024,
        //     fileSize: 1024 * 1024 * 10
        // },
        // fileFilter: function(req, file, cb) {
        //     // To reject this file pass `false`, like so:
        //     //cb(null, false);

    //     // To accept the file pass `true`, like so:
    //     cb(null, true)

    //     // You can always pass an error if something goes wrong:
    //     //cb(new Error('I don\'t have a clue!'))
    // }
}).array('file', 5);


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
        Post.get(null, function(err, posts) {
            if (err) {
                posts = []
            }
            res.render('index', {
                title: '主页',
                error: req.flash('error').toString(),
                success: req.flash('success').toString(),
                user: req.session.user,
                posts: posts
            });
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
    app.get('/post', function(req, res) {
        res.render('post', {
            title: '发表',
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });

    app.post('/post', checkLogin);
    app.post('/post', function(req, res) {
        var user = req.session.user;
        var post = new Post(user.name, req.body.title, req.body.post);
        post.save(function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('error', '发表成功');
            return res.redirect('/');
        });
    });

    app.get('/upload', checkLogin);
    app.get('/upload', function(req, res) {
        res.render('upload', {
            title: "上传",
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/upload', checkLogin);
    app.post('/upload', function(req, res) {
        uploadFile(req, res, function(err) {
            if (err) {
                req.flash('error', '上传失败!');
                console.log(err);
            } else {
                req.flash('success', '文件上传成功！');
            }
            res.redirect('/upload');
        });

        // var tmp_path = req.file.path;
        // var target_path = 'uploads/' + req.file.originalname;
        // var src = fs.createReadStream(tmp_path);
        // var dest = fs.createWriteStream(target_path);
        // src.pipe(dest);
        // src.on('end', function() {
        //     res.render('complete');
        // });
        // src.on('error', function(err) {
        //     res.render('error');
        // });
    });

    app.get('logout', checkLogin);
    app.get('/logout', function(req, res) {
        req.session.user = null;
        req.flash('success', '登出成功。');
        res.redirect('/');
    });
}
