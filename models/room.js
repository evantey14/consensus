var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
  name           : { type : String},
  admin_url      : { type : String, unique: true},
  questions      : [{type : String }],
  confusion_time : [{
      conf_number : { type: Number, required: true},
      timestamp  : { type: Date, default: Date.now }
  }],
  active         : { type : Boolean}
});

roomSchema.statics.createRoom = function(name, cb){
  var room = new this({
    name      : name,
    admin_url : Math.random().toString(36).slice(12), //12 so easier to use for testing. Increase for production
    questions : [],
    confusion : [],
    active    : true 
  });

  this.findOne({name: name}, function(existing_room){
    if(existing_room){
      //Same room found with same name, don't make the room
      cb(false);
    } else {
      console.log("NEW ROOM CREATION: " + name);
      console.log("ADMIN URL FOR " + name + ": " + room.admin_url);
      room.save(function(err){
        if(err){
          console.log(err);
          cb(false);
        } else {
	  cb(true);
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
    timestamp   : Date.now
  }
  this.confusion_time.push(new_conf);
  this.save(cb);
};

module.exports = mongoose.model('Room', roomSchema);
