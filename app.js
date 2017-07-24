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
var DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consensus';

console.log(DB_URI);

db = mongoose.connect(DB_URI);
console.log('connected to DB');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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
  var isAdmin = false;

  // when a socket connects, get room_id and isAdmin status 
  socket.on('initialize', function(room){
    var query = {};
    if (room.user_type === "admin") {
      query = {admin_url: room.room_identifier, active: true};
    } else if (room.user_type === "student") {
      query = {name: room.room_identifier, active: true};
    }
    Room.findOne(query, function(err, room){
      if (err) {
        console.log(err);
      } else {
        if (room.user_type === "admin") {
          isAdmin = true;
        }
        room_id = room._id;
        console.log("new connection to room: " + room.name + "(" + room_id + ")");
        socket.emit('initialize', {questions: room.questions, 
          num_confused: room.confusion[room.confusion.length-1].conf_number});
      }
    });
  });

  socket.on('update_confused', function(delta) {
    Room.findById(room_id, function(err, room){
      if (err) {
        console.log(err);
      } else {
        room.updateConfusion(delta, function (err){
	      if (err) {
            console.log(err);
	      } else {
            io.emit('update_confused', delta);
            confused = (delta === 1) ? true : false; // delta takes value 1 or -1
	      }
	    });
      }
    });
  });

  // When asks a question, create new question object in db, and send to all users
  socket.on('new_question', function(question) {
    fs.readFile("./badwords.txt", 'utf8', function read(err, data) {
      if (err) {
        console.log(err);
      } else {
        question = question.trim();
        if (question == "") { 
          return; 
        }
        var standardize = data.replace(/\r\n/gi, "\n");
        var filterWords = standardize.split(/\n/);
        // "i" is to ignore case and "g" for global
        var rgx = new RegExp(filterWords.join("|"), "gi");
        function WordFilter(str) {
          return str.replace(rgx, "****");
        }
        if (!WordFilter(question).includes("****")) {
	      Room.findById(room_id, function(err, room){
            if (err) {
	          console.log(err);
		    } else {
		      room.questions.push({q : question, vote : 0});
              room.save(function(err){
    	        if (err) {
		          console.log(err);
		        } else {
		          io.emit('new_question', {q : question, vote : 0});
		        }
		      });
		    }
	      });
    	}
      }
    });
  });

  socket.on('upvote_question', function(question) {
    if (question === null) {
      return;
    }
    Room.findById(room_id, function(err, room) {
      if (err) {
        console.log(err);
      } else {
        console.log(question);
        room.updateQuestion(question, function (err){
          if (err) {
            console.log(err);
	  } else {
            if (question !== null) {
              io.emit('upvote_question', question);
              console.log(question);
            }
          }
        });
      }
    });
  });

  socket.on('resolve_question', function(question){
    if(!isAdmin){
      console.log("RESOLVE FAILED ON " + question + " - NO PERMISSION");
      return;
    }

    Room.findById(room_id, function(err, room){
      if (err) {
        console.log("RESOLVE FAILED ON " + question);
        console.log(err);
      } else {
        room.resolveQuestion(question, function(err){
          if (err) {
            console.log("RESOLVE FAILED ON " + question);
            console.log(err);
          } else {
            console.log("FINISH RESOLVE ON " + question);
            io.emit('resolve', question);
          }
        });
      }

    })
  });

  socket.on('disconnect', function() {
    if (confused){
      Room.findById(room_id, function(err, room){
        if (err) {
	        console.log(err);
      	} else {
          room.updateConfusion(-1, function (err){
  	        if (err) {
  	          console.log(err);
            } else {
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
