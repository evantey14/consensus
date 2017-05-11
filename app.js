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
console.log('APP.JS');
var mongoose = require('mongoose');
var DB_URI = process.env.CONS_URI || 'mongodb://localhost:27017/consensus';

console.log(DB_URI);

db = mongoose.connect(DB_URI);
console.log('connected to DB');

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
    // res.render('error', {
    //   message: err.message,
    //   error: err
    // });
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
	var id = Math.floor(Math.random() * 1000000);
	console.log('New Connected User: ' + id);

	// On connection, send users list of existing questions
	Question.find({}, function(err, questions) {
		for (var i = 0; i<questions.length; i++) {
			socket.emit('new question', questions[i].question);
		}
	});

	// When confused, create new confusion object in db
	socket.on('confused', function() {
		Confusion.create({'user_id' : id}, function(err, confusion) { // for now, init end_time to the same as start
			if (err) console.log(err);
  			else console.log('New confusion session: ' + id);
		});
		// TODO: emit to admin
    io.sockets.emit('update_confused', 1);
	});

	// When not confused anymore, update confusion object with end time
	socket.on('not_confused', function() {
		Confusion.findOne({'user_id' : id, 'end_time' : new Date(0)}, function(err, confusion) {

			if (err) console.log(err);
			if (confusion === null) return;
			else {
				confusion.end_time = new Date();
				confusion.save();
				console.log("End confusion session: " + id)
			}
		});
		// TODO: emit to admin
    io.sockets.emit('update_confused', -1);
	});

	// When asks a question, create new question object in db, and send to all users
	socket.on('question', function(question) {
		Confusion.findOne({'user_id' : id, 'end_time' : new Date(0)}, function(err, confusion) {
			if (err) console.log(err);
			else {
		// TODO: strip question of whitespace and filter
				function readTextFile(file)
				{
    				var rawFile = new XMLHttpRequest();
    				rawFile.open("GET", file, false);
    				rawFile.onreadystatechange = function ()
    				{
        				if(rawFile.readyState === 4)
        				{
            				if(rawFile.status === 200 || rawFile.status == 0)
            				{
                				var allText = rawFile.responseText;
               					alert(allText);
            				}
        				}
    				}
   					rawFile.send(null);
				}
				Question.create({'question' : question, 'votes' : 0}, function(err, question) {
					if (err) console.log(err);
            		
            		var filterWords = readTextFile("badwords.txt").split("/n")
            		// "i" is to ignore case and "g" for global
            		var rgx = new RegExp(filterWords.join(""), "gi");
              		function WordFilter(str) {
            			return str.replace(rgx, "****");
            		}
					else console.log('New Question: ' + WordFilter(question.question));
				});
				io.sockets.emit('new question', question);
			}
		});
	});

	socket.on('disconnect', function() {
		Confusion.findOne({'user_id' : id, 'end_time' : new Date(0)}, function(err, confusion) {
			if (err) console.log(err);
			if (confusion === null) return;
			else {
				confusion.end_time = new Date();
				confusion.save();
				console.log("End confusion session: " + id)
			}
		});
	});
});

module.exports = app;
