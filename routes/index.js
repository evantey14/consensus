var express = require('express')
var router = express.Router();
var Room = require('../models/room.js');

router.get('/', function(req, res, next){
    res.render('index');
});

router.post('/create', function(req, res, next){
  var name = req.body.name;

  var safeURL = new RegExp("^[-A-Za-z0-9\.\!\(\)]+$");
  if(!name || !safeURL.test(name)) return res.sendStatus(403); //don't let them enter a bad url

  Room.createRoom(name, function(err, room){
    if (err) console.log(err);
    else if (!room) return res.sendStatus(403); // if room already exists, send null
    else {
      return res.json({
        student_url: room.name,
	      admin_url: room.admin_url
      });
    }
  });
});

router.get('/room/:roomName', function(req, res, next){
  // TODO: Should this be integrated with the "initialize" socket handler?
  Room.upToSpeed("room", req.params.roomName, function(err, room){
    if(!room){
      res.render("no-room");
    } else if(!(room.active)){
      res.render("ended-room", {name: room.name});
    } else {
      data = {
        name      : room.name,
        questions : room.questions,
        confusion : room.confusion
      }
      res.render("student", data);
    }
  });
});

router.get('/admin/:admin_url', function(req, res, next){
  Room.upToSpeed("admin", req.params.admin_url, function(err, room){
    if(!room){
      res.render("no-room");
    } else if(!(room.active)){
      res.render("ended-room", {name: room.name});
    } else {
      data = {
        name      : room.name,
        questions : room.questions,
        confusion : room.confusion
      }
      res.render("admin", data);
    }
  });
});

module.exports = router;
