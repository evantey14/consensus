var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
  name           : { type : String},
  admin_url      : { type : String, unique: true},
  questions      : [{
      q        : {type : String},
      vote     : {type : Number},
      resolved : {type: Boolean}
  }],
  confusion      : [{
      conf_number : { type: Number, required: true},
      timestamp  : { type: Date, default: Date.now }
  }],
  active         : { type : Boolean}
});

roomSchema.statics.createRoom = function(name, cb){
  var room = new this({
    name      : name,
    admin_url : Math.random().toString(36).slice(12), //12 so easier to use for testing. decrease for production
    questions : [],
    confusion : [{conf_number: 0, timestamp: Date.now()}],
    active    : true
  });
  
  this.findOne({name: name}, function(existing_room){
    if(existing_room){
      //Same room found with same name, don't make the room
      cb(null, null);
    } else {
      room.save(function(err){
        if(err){
          console.log("failed to save room: " + room.name);
          cb(err, null);
        } else {
          console.log("new room: " + name);
          console.log(name + ": admin url -- /admin/" + room.admin_url);
          console.log(name + ": student url -- /room/" + room.name);
          cb(null, room);
	    }
      });
    }
  });
}

roomSchema.statics.upToSpeed = function(user_type, room_identifier, cb){
  var query = {};
  if (user_type == "admin"){
    query = {admin_url: room_identifier, active: true};
  } else {
    query = {name: room_identifier, active: true};
  }
  this.findOne(query, function(err, room){
    if(err){
      cb(err, null);
    } else if(!room){
      console.log("INVALID ROOM");
      cb(null, null);
    } else {
      cb(null, room);
    }
  });
}

roomSchema.methods.updateConfusion = function(change, cb){
  last_conf = this.confusion[this.confusion.length - 1];
  new_conf = {
    conf_number : last_conf.conf_number + change,
    timestamp   : Date.now()
  }
  this.confusion.push(new_conf);
  this.save(cb);
};

roomSchema.methods.updateQuestion = function(question, cb) {
  allQuestions = this.questions;
  for (var i = 0; i < allQuestions.length; i++) {
    if (allQuestions[i].q == question) {
      allQuestions[i].vote = allQuestions[i].vote + 1;
    }
  }
  this.save(cb);
}

roomSchema.methods.resolveQuestion = function(question, cb){
  console.log("RESOLVING QUESTION");
  for( var i = 0; i < this.questions.length; i++){
    if(!this.questions[i].resolved && this.questions[i].q == question){
      console.log(this.questions[i]);
      console.log("SUCCESSFUL")
      this.questions[i].resolved = true;
    }
  }
  this.save(cb);
}

module.exports = mongoose.model('Room', roomSchema);
