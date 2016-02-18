var config = require('./config'),
    http = require('http'),
    socketio = require('socket.io'),
    express = require('express'),
    morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    serveStatic = require('serve-static'),
    flash = require('connect-flash'),
    passport = require('passport');

module.exports = function(db) {

  var app = express();
  var server = http.createServer(app);
  var io = socketio.listen(server);

  // configure middleware for development environment
  if  (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // configure middleware for production environment
  if (process.env.NODE_ENV === 'production') {
    app.use('compress');
  }

  // configure middleware for any environment
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  var mongoStore = new MongoStore({
    db: db.connection.db
  });

  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    store: mongoStore
  }));

  // configure template engine
  app.set('views', './app/views');
  app.set('view engine', 'ejs');

  // configure authentication
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());

  // configure static
  app.use(serveStatic('./public'));

  // configure routes
  require('../app/routes/index.server.routes.js')(app);
  require('../app/routes/users.server.routes.js')(app);
  require('../app/routes/articles.server.routes.js')(app);

  require('./socketio')(server, io, mongoStore);

  return server;

};
