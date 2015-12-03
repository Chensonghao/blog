var mongodb = require('./db'),
    markdown = require('markdown').markdown,
    ObjectID = require('mongodb').ObjectID;


function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
}

Post.prototype.save = function(callback) {
    var date = new Date,
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes();
    var time = {
        date: date,
        year: year,
        month: year + '-' + month,
        day: year + '-' + month + '-' + day,
        minute: year + '-' + month + '-' + day + ' ' + (hour < 10 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute)
    }
    var post = {
        name: this.name,
        title: this.title,
        post: this.post,
        time: time,
        comments: []
    }
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.insert(post, {
                safe: true
            }, function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                return callback(null);
            })
        });
    });
};

Post.getAll = function(name, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.find(query).sort({
                time: -1
            }).toArray(function(err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                docs.forEach(function(doc) {
                    doc.post = markdown.toHTML(doc.post);
                });
                return callback(null, docs);
            });
        });
    });
}

Post.getOne = function(name, id, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "name": name,
                "_id": ObjectID(id)
            }, function(err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                doc.post = markdown.toHTML(doc.post);
                doc.comments.forEach(function(comment) {
                    comment.content = markdown.toHTML(comment.content);
                });
                return callback(null, doc);
            });
        });
    });
}

Post.edit = function(name, id, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "_id": ObjectID(id),
                "name": name
            }, function(err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                return callback(null, doc);
            });
        });
    });
}
Post.update = function(name, id, post, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "_id": ObjectID(id),
                "name": name
            }, {
                $set: {
                    "post": post
                }
            }, function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                return callback(null, post);
            });
        });
    });
}
Post.remove = function(name, id, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                "_id": ObjectID(id),
                "name": name
            }, {
                w: 1,
                j: true,
                safe: true
            }, function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
}

module.exports = Post;
