var mongoose = require('mongoose');

var questionSchema = mongoose.Schema({
  question: { type : String },
  time : { type : Date, default : Date.now },
  votes : Number
});

module.exports = mongoose.model('Question', questionSchema);
