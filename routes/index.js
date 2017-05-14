var express = require('express')
var router = express.Router();
var Room = require('../models/room.js');


/* GET home page. */
router.get('/', function(req, res, next){
    res.render('index');
});

router.post('/create', function(req, res, next){
  var name = req.body.name;
  Room.createRoom(name, function(made){
    if(made){
      res.send("DONE");
    }else{
      res.send("ERR");
    }
  });
});

router.get('/room/:roomName', function(req, res, next){
  var name = req.params.roomName;
  Room.upToSpeed("student", name, function(room){
    if(!room){
      res.render("no-room");
    }

    if(!room.active){
      res.render("ended-room", {name: room.name});
    }

    data = {
      name      : room.name,
      questions : room.questions,
      confusion : room.confusion
    }

    res.render("student", data);
  });
});

router.get('/admin/:admin_url', function(req, res, next){
  Room.upToSpeed("admin", req.params.admin_url, function(room){
    if(!room){
      res.render("no-room");
    }
  
    if(!room.active){
      res.render("ended-room", {name: room.name});
    }

    data = {
      name      : room.name,
      questions : room.questions,
      confusion : room.confusion
    }
    
    res.render("admin", data);
  });
});
module.exports = router;
