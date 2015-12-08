var settings = require('../settings'),
    mongoose = require('mongoose'),
    schema = mongoose.Schema;

var uri = 'mongodb://' + settings.host + ':' + settings.port + '/' + settings.db;
mongoose.connect(uri, {
    //user: '',
    //pass: '',
    server: {
        auto_reconnect: true,
        poolSize: 10
    }
});

module.exports = function(collection, obj) {
    var newSchema = new schema(obj);
    return mongoose.model(collection, newSchema);
}
