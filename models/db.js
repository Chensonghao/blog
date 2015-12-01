var settings = require('../settings'),
    mongodb = require('mongodb'),
    db = mongodb.Db,
    connection = mongodb.Connection,
    server = mongodb.Server;

module.exports = new db(settings.db, new server(settings.host, settings.port), {
    safe: true
});


/*-------------------mongoose--------------*/
// var mongoose = require('mongoose'),
//     schema = mongoose.Schema;

// var uri = 'mongodb://127.0.0.1:27017/blog',
//     options = {
//         server: {
//             auto_reconnect: true,
//             poolSize: 10
//         }
//     };
