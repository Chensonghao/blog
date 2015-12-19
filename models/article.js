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

function queryArticles(query, callback) {

}
exports.getAllArticles = function(req, res) {
    var user = require('./user');
    var query = {},
        username = req.params.name,
        index = req.params.index;
    if (username) {
        query.name = username;
    }
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
exports.postArticle = function(req, res) {
    var post = new collection({
        name: req.body.name,
        title: req.body.title,
        content: req.body.content,
        time: new Date()
    });
    post.save(function(err, article) {
        if (err) {
            console.log(err);
            return res.json(false);
        }
        return res.json(article._id);
    });
}
