var mongodb = require('./db');


/*-------------------mongoose--------------*/
// var mongoose = require('mongoose'),
//     schema = mongoose.Schema;

// var userSchema = new schema({
//     name: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: false
//     }
// });
// var userModel=mongoose.model('users',userSchema);
// mongoose.connect('mongodb://127.0.0.1:27017/blog');
/*------------------------------------------*/

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}
module.exports = User;

User.prototype.save = function(callback) {
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    };
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('users', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.insert(user, {
                safe: true
            }, function(err) {
                mongodb.close();
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                return callback(null, user);
            });
        });
    });
};

User.get = function(name, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('users', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                name: name
            }, function(err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, user);
            });
        });
    });
}
