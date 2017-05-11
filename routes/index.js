var express = require('express')
var router = express.Router();
var Room = require('../models/Room.js');


/* GET home page. */
router.get('/', function(req, res, next){
    res.render('index');
});

router.post('/create', function(req, res, next){
  var name = req.body.name;
  Room.createRoom(name, function(err){
    if(err){
      return next(err);
    }
    res.send("DONE");
  });
});

module.exports = router;
