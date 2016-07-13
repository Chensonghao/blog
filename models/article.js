var mongodb = require('./db'),
    marked = require('marked'),
    collection = mongodb('posts', {
        name: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            required: true
        },
        comments: {
            type: Array,
            required: false,
            default: []
        }
    });

marked.setOptions({
    highlight: function(code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});

exports.getAllArticles = function(req, res) {
    var user = require('./user');
    var query = {},
        keyword = req.body.keyword,
        username = req.body.name,
        index = req.body.index;
    if (username!=='') {
        query.name = username;
    }
    if (keyword!=='') {
        var pattern = new RegExp(keyword,'i');
        query.title = pattern;
    }
    console.log(query);
    collection.count(function(err, count) {
        if (err) {
            console.log(err);
            return res.json(false);
        }
        collection.find(query, function(err, docs) {
            if (err) {
                console.log(err);
                return res.json(false);
            }
            if (docs.length > 0) {
                return res.json({
                    count: count,
                    articles: docs
                });
            } else if (username) {
                user.getUser(username, function(err, user) {
                    if (err) {
                        console.log(err);
                        return res.json(false);
                    }
                    if (!user) {
                        return res.json({
                            user: false
                        });
                    } else {
                        return res.json({
                            count: 0,
                            articles: []
                        });
                    }
                });
            }
        }).sort({
            time: -1
        }).skip(index * 20).limit(20);
    });
}
exports.getArticle = function(req, res) {
    collection.findOne({
        "name": req.params.name,
        "_id": req.params.id
    }, function(err, doc) {
        if (err) {
            console.log(err);
            return res.json(false);
        }
        if (doc) {
            doc.content = marked(doc.content);
        }
        return res.json(doc);
    });
}
exports.getArticleForEdit = function(req, res) {
    collection.findOne({
        "_id": req.params.id
    }, function(err, doc) {
        if (err) {
            console.log(err);
            return res.json(false);
        }
        return res.json(doc);
    });
}
exports.postArticle = function(req, res) {
    var articleId = req.body['id'],
        title = req.body.title,
        content = req.body.content;
    //修改
    if (articleId) {
        collection.findOne({
            "_id": articleId
        }, function(err, article) {
            if (err) {
                console.log(err);
                return res.json(false);
            }
            article.title = title;
            article.content = content;
            article.save(function(err, article) {
                if (err) {
                    console.log(err);
                    return res.json(false);
                }
                return res.json(article._id);
            });
        });
    }
    //新增
    else {
        var article = new collection({
            name: req.body.name,
            title: title,
            content: content,
            time: new Date()
        });
        article.save(function(err, article) {
            if (err) {
                console.log(err);
                return res.json(false);
            }
            return res.json(article._id);
        });
    }
}
exports.deleteArticle = function(req, res) {
    var id = req.params.id;
    if (id) {
        collection.findById(id, function(err, article) {
            if (err) {
                console.log(err);
                res.json(false);
            } else {
                article.remove(function(err) {
                    if (err) {
                        console.log(err);
                        res.json(false);
                    } else {
                        res.json(true);
                    }
                });
            }
        });
    }
}
