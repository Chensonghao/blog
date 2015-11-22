var settings = require('../settings'),
    mongodb = require('mongodb'),
    db = mongodb.Db,
    connection = mongodb.Connection,
    server = mongodb.Server;

module.exports = new db(settings.db, new server(settings.host, settings.port), {
    safe: true
});
