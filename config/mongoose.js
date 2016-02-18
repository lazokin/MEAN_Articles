var config = require('./config'),
    mongoose = require('mongoose');

module.exports = function() {

  // connect to database
  var  db = mongoose.connect(config.db);

  // initialise database models
  require('../app/models/user.server.model');
  require('../app/models/article.server.model');

  // return database
  return db;
};
