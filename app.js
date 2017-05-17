var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var logger = require('morgan');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs");

var routes = require('./routes/index');

var Room = require('./models/room.js');

var app = express();
var io = socketio();
app.io = io;

var mongoose = require('mongoose');
mongoose.set('debug', true);
var DB_URI = process.env.CONS_URI || 'mongodb://localhost:27017/consensus';

console.log(DB_URI);

db = mongoose.connect(DB_URI);
console.log('connected to DB');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// TODO: update this favicon
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

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
  var room_id; // database id of the connection's room
  var confused = false; // whether or not this connection is confused
  
  // when a socket connects, look for what room it's in
  socket.on('initialize', function(room){
    Room.upToSpeed(room.user_type, room.room_identifier, function(err, new_room){
      if (err) console.log(err);
      else {
        room_id = new_room._id;
	console.log("New connection to room: " + new_room.name);
	socket.emit('initialize', {
	  questions: new_room.questions, 
	  num_confused: new_room.confusion[new_room.confusion.length-1].conf_number
	});
      }
    });
  });
  
  socket.on('confused', function() {
    Room.findById(room_id, function(err, room){
      if (err) console.log(err)
      else {
        room.updateConfusion(1, function (err){
	  if (err) console.log(err);
	  else {
            io.emit('update_confused', 1);
	    confused = true;
	  }
	});
      }
    });
  });

  socket.on('not_confused', function() {
   Room.findById(room_id, function(err, room){
      if (err) console.log(err)
      else {
        room.updateConfusion(-1, function (err){
	  if (err) console.log(err);
	  else {
            io.emit('update_confused', -1);
	    confused = false;
	  }
	});
      }
    });
  });

  // When asks a question, create new question object in db, and send to all users
  socket.on('question', function(question) {
    fs.readFile("./badwords.txt", 'utf8', function read(err, data) {
      if (err) {
        console.log('error');
      }
      else {
	// TODO: we should trim whitespace off the ends of questions
        question = question.trim();
        var standardize = data.replace(/\r\n/gi, "\n");
        var filterWords = standardize.split(/\n/);
        // "i" is to ignore case and "g" for global
        var rgx = new RegExp(filterWords.join("|"), "gi");
        function WordFilter(str) {
          return str.replace(rgx, "****");
        }
        if (!WordFilter(question).includes("****")) {
	       Room.findById(room_id, function(err, room){
          if (err) console.log(err);  
	        room.questions.push({q : question, vote : 0});
          room.save(function(err){
    	      if (err) console.log(err);
    	      io.emit('new question', {q : question, vote : 0});
    	    });
    	  });
    	}
      }
    });
  });
 
  socket.on('disconnect', function() {
    if (confused){
      Room.findById(room_id, function(err, room){
        if (err) console.log(err)
        else {
          room.updateConfusion(-1, function (err){
	         if (err) console.log(err);
           else {
              io.emit('update_confused', -1);
              confused = false;
	         }
         });
	     }
      }); 
    }
  });

  socket.on('upvote', function(question) {
    if (question === null) {
      return;
    }
    Room.findById(room_id, function(err, room) {
      if (err) console.log(err);
      else {
        console.log(question);
        room.updateQuestion(question, function (err){
          if (err) console.log(err);
          else {
            if (question !== null) {
              io.emit('upvote_question', question);
              console.log(question);
            }
          }
        });
      }
    });
  });

});

module.exports = app;
