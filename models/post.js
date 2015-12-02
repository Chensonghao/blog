var mongodb = require('./db'),
    markdown = require('markdown').markdown;


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
        minute = date.getMinutes();
    var time = {
        date: date,
        year: year,
        month: year + '-' + month,
        day: year + '-' + month + '-' + day,
        minute: year + '-' + month + '-' + day + ' ' + date.getHours() + ':' + (minute < 10 ? '0' + minute : minute)
    }
    var post = {
        name: this.name,
        title: this.title,
        post: this.post,
        time: time
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

Post.getOne = function(name, day, title, callback) {
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
                "time.day": day,
                "title": title
            }, function(err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                doc.post = markdown.toHTML(doc.post);
                return callback(null, doc);
            });
        });
    });
}

Post.edit = function(name, day, title, callback) {
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
                "title": title,
                "name": name,
                "time.day": day
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
Post.update = function(name, day, title, post, callback) {
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
                "title": title,
                "name": name,
                "time.day": day
            }, {
                $set: {
                    post: post
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
Post.remove = function(name, day, title, callback) {
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
                "title": title,
                "name": name,
                "time.day": day
            }, {
                w: 1
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
