var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-hbs');
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var expressValidator = require('express-validator');
require('./bin/mongoose');

var app = express();

var home = require('./routes/index.route');
var users = require('./routes/users.route')(passport);
var projects = require('./routes/projects.route');


// view engine setup
app.engine('view.html', hbs.express4({
  extname: '.view.html'
}));
app.set('views', path.join(__dirname, '/public/views'));
app.set('view engine', 'view.html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'keyboard cat'}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', home);
app.use('/user', users);
app.use('/project', projects);

var initPassport = require('./bin/strategies/passport');
initPassport(passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

 //development error handler
 //will print stacktrace
//if (app.get('env') === 'development') {
//  app.use(function(err, req, res, next) {
//    //res.status(err.status || 500);
//    //res.render('error', {
//    //  message: err.message,
//    //  error: err
//    //});
//    console.log('development error');
//  });
//}
//
//// production error handler
//// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//  //res.status(err.status || 500);
//  //res.render('error', {
//  //  message: err.message,
//  //  error: {}
//  //});
//  console.log('production error');
//});

if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
}
else if (process.env.NODE_ENV === 'production') {
  app.use(compress());
}


module.exports = app;
