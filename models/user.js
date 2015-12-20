var mongodb = require('./db'),
    crypto = require('crypto'),
    jwt = require("jsonwebtoken"),
    settings = require('../settings'),
    gm = require('gm'),
    fs = require('fs'),
    imageMagick = gm.subClass({
        imageMagick: true
    }),
    collection = mongodb('users', {
        name: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: false
        },
        token: {
            type: String,
            required: false
        }
    });

function getuser(name, callback) {
    collection.findOne({
        name: name
    }, function(err, user) {
        if (err) {
            return callback(err);
        }
        return callback(null, user);
    });
}

function updateUserToken(user, callback) {
    user.token = jwt.sign({
        name: user.name,
        password: user.password
    }, settings.tokenSecret, {
        expiresIn: 60 * 30
    });
    user.save(function(err, user1) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        return callback(null, user1);
    });
}

exports.register = function(req, res) {
    var name = req.body.name;
    getuser(name, function(err, user) {
        if (err) {
            console.log(err);
            return res.json({
                type: false,
                message: err.toString()
            });
        }
        if (user) {
            return res.json({
                message: "用户名已存在。"
            });
        }
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var user = new collection({
            name: name,
            password: password,
            email: req.body.email
        });
        user.save(function(err, user) {
            if (err) {
                console.log(err);
                return res.json({
                    type: false,
                    message: err.toString()
                });
            }
            updateUserToken(user, function(err, user1) {
                if (err) {
                    console.log(err);
                    return res.json({
                        err: err
                    });
                }
                fs.createReadStream('public/images/headers/default.png').pipe(fs.createWriteStream('public/images/headers/' + user1.name + '.png'));
                return res.json({
                    user: user1
                })
            });
        });
    });
}
exports.login = function(req, res) {
    var name = req.body.name,
        md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    getuser(name, function(err, user) {
        if (err) {
            console.log(err);
            return res.json({
                type: false,
                message: err.toString()
            });
        }
        if (user && password === user.password) {
            updateUserToken(user, function(err, user1) {
                if (err) {
                    console.log(err);
                    return res.json({
                        err: err
                    });
                }
                return res.json({
                    user: user1
                })
            });
        } else {
            return res.json({
                type: false,
                message: '用户名或密码错误！'
            });

        }
    });
}

exports.authorize = function(req, res, next) {
    var bearerHeader = req.headers['authorization'];
    var username = req.headers['username'];
    if (bearerHeader) {
        var bearer = bearerHeader.split(' ');
        var token = bearer[1];
        jwt.verify(token, settings.tokenSecret, function(err, decoded) {
            if (err) {
                console.log(err);
                res.send(401);
            } else {
                //req.token = token;
                getuser(username, function(err, user) {
                    if (err || user.token !== token) {
                        console.log(err || 'token不匹配！');
                        res.send(401);
                    } else {
                        updateUserToken(user, function(err, user1) {
                            if (err) {
                                console.log(err);
                                res.send(401);
                            } else {
                                res.setHeader('authorization', bearer[0] + ' ' + user1.token);
                                next();
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.send(401);
    }
}

exports.unAuthorize = function(req, res, next) {
    var bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        var bearer = bearerHeader.split(' ');
        var token = bearer[1];
        jwt.verify(token, settings.tokenSecret, function(err, decoded) {
            if (err) {
                console.log(err);
                res.setHeader('authorization', null);
                next();
            } else {
                res.send(403);
            }
        });
    } else {
        next();
    }
}
exports.upload = function(req, res) {
    var username = req.headers['username'];
    if (!username) {
        return res.json(false);
    }
    var file = req.files.file,
        path = file.path,
        x1 = req.body.x1,
        y1 = req.body.y1,
        x2 = req.body.x2,
        y2 = req.body.y2,
        width = x2 - x1;
    console.log(req.body);
    if (file.type.split('/')[0] != 'image') {
        return res.json(false);
    } else {
        imageMagick(path)
            .resize(200)
            .crop(width, width, x1, y1)
            .resize(48, 48, '!')
            .write('public/images/headers/' + username + '.png', function(err) {
                if (err) {
                    console.log(err);
                    return res.json(false);
                }
                return res.json(true);
            });
    }
}
exports.getUser = getuser;
