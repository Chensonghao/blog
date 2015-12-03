var mongodb = require('./db'),
    ObjectID = require('mongodb').ObjectID;

function Comment(name, id, comment) {
    this.name = name;
    this.id = id;
    this.comment = comment;
}

module.exports = Comment;

Comment.prototype.save = function(callback) {
    var name = this.name,
        id = this.id,
        comment = this.comment;
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
                $push: {
                    "comments": comment
                }
            }, function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
}
