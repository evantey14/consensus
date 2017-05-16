var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var logger = require('morgan');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');

var Confusion = require('./models/confusion');
var Question = require('./models/question');
var Room = require('./models/room.js');

var app = express();
var io = socketio();
app.io = io;

var fs = require("fs");

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
  socket.on('initialize', function(room_identifier){
    room = Room.upToSpeed("room", room_identifier, function(err, room){
      if (err) console.log(err);
      else {
        room_id = room._id;
	console.log(room);
	socket.emit('initialize', {
	  questions: room.questions, 
	  num_confused: room.confusion[room.confusion.length-1].conf_number
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
        var standardize = data.replace(/\r\n/gi, "\n");
        var filterWords = standardize.split(/\n/);
        // "i" is to ignore case and "g" for global
        var rgx = new RegExp(filterWords.join("|"), "gi");
        function WordFilter(str) {
          return str.replace(rgx, "****");
        }
        if (!WordFilter(question).includes("****")) {
          // TODO: update with new schema
	  Room.findById(room_id, function(err, room){
            if (err) console.log(err);  
	    room.questions.push(question);
            room.save(function(err){
	      if (err) console.log(err);
	      io.emit('new question', question);
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

});

module.exports = app;
