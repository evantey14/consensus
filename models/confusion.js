var mongoose = require('mongoose');

var confusionSchema = mongoose.Schema({
  session_id : Number,
  start_time : { type : Date, default : Date.now },
  end_time : { type : Date, default : Date.now }
});

module.exports = mongoose.model('Confusion', confusionSchema);
