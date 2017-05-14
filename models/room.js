var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
  name      : { type : String},
  admin_url : { type : String, unique: true},
  questions : [{type : String }],
  confusion : { type : Number},
  active    : { type : Boolean}
});

roomSchema.methods.createRoom = function(name, cb){
  room = {
    name      : name,
    admin_url : Math.random().toString(36).slice(2),
    questions : [],
    confusion : 0,
    active    : false
  }

  this.findOne({name: name}, function(room){
    if(room){
      //Same room found with same name, don't make the room
      return false;
    } else {
      console.log("NEW ROOM CREATION: " + name);
      console.log("ADMIN URL FOR " + name + ": " + room.admin_url);
      this.create(room, function(err){
        if(err){
          console.log(err);
          return false;
        }
      });
      return true;
    }
  });

}

roomSchema.methods.upToSpeed = function(name, cb){
  this.findOne({name: name},{questions: true, confusion: true, active: true}, function(room, err){
    if(err){
      return cb(err)
    };
    if(!room){
      console.log("INVALID ROOM");
      return null;
    }
    return room;
  });
}



module.exports = mongoose.model('Room', roomSchema);
