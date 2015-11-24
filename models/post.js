var mongodb = require('./db');

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
        date: year + '-' + month + '-' + day,
        minute: year + '-' + month + '-' + day + ' ' + date.getHours() + ':' + (minute < 10 ? '0' + minute : minute)
    }
    var post = {
        name: this.name,
        title: this.title,
        post: this.post,
        time: time
    }
    mongodb.open(function(err, db) {
    	if(err){
    		return callback(err);
    	}
    	db.collection('posts',function(err,collection){
    		if(err){
    			mongodb.close();
    			return callback(err);
    		}
    		collection.insert(post,{safe:true},function(err){
    			mongodb.close();
    			if(err){
					return callback(err);	
    			}
    			return callback(null);
    		})
    	});
    });
};

Post.get=function(name,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query={};
			if(name){
				query.name=name;
			}
			collection.find(query).sort({time:-1}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,docs);
			});
		});
	});
}

module.exports=Post;