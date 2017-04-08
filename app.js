var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var logger = require('morgan');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var mockup = require('./routes/mockup');

var Confusion = require('./models/confusion');
var Question = require('./models/question');

var app = express();
var io = socketio();
app.io = io;

//Mongoose setup
console.log("APP.JS");
var mongoose = require('mongoose');
var DB_URI = process.env.CONS_URI || 'mongodb://localhost:27017/consensus';

console.log(DB_URI);

db = mongoose.connect(DB_URI);
console.log("connected to DB");

var RedisStore = require('connect-redis')(session);
SESSION_SECRET = process.env.SESSION_SECRET || "secret";
REDIS_URL      = process.env.REDIS_URL      || "redis://localhost:6379";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
                secret: SESSION_SECRET,
                store: new RedisStore({
                  url: REDIS_URL
                }),
                resave: false,
                saveUninitialized: true
                }));

console.log("connected to redis");

app.use('/', routes);
app.use('/mockup', mockup);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


io.on('connection', function(socket) {
	console.log("New Connection: " + socket);
	var id = Math.floor(Math.random() * 1000000);
		
	socket.on('confused', function() {
		Confusion.create({'session_id' : id}, function(err, confusion) { // for now, init end_time to the same as start
			if (err) console.log(err);
  			else console.log("New confusion session: " + id);
		});
		// TODO: emit to admin	
	});
	
	socket.on('notconfused', function() {
		Confusion.findOne({'session_id' : id}, function(err, confusion) {
			if (err) console.log(err);
			else {
				confusion.end_time = new Date();
				confusion.save();
			}
		});	
		//emit to admin
	});
	
	socket.on('question', function(question) {
		// create db object
		console.log(question);
		io.emit('new question', question);	
	});

	socket.on('disconnect', function() {
		// TODO: close any open confusion session
	});
});

module.exports = app;
