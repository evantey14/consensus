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

  console.log("NEW ROOM CREATION: " + name);
  console.log("ADMIN URL FOR " + name + ": " + room.admin_url);
  this.create(room, cb);
}

roomSchema.methods.upToSpeed = function(name, cb){
  this.findOne({name: name},{questions: true, confusion: true, active: true}, function(room, err){
    if(err){
      return cb(err)
    };
    if(!room){
      console.log("INVALID ROOM");
      return;
    }
  });
}



module.exports = mongoose.model('Room', roomSchema);
