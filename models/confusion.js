var mongoose = require('mongoose');

var confusionSchema = mongoose.Schema({
  user_id : Number,
  start_time : { type : Date, default : Date.now },
  end_time : { type : Date, default : new Date(0)}
});

module.exports = mongoose.model('Confusion', confusionSchema);
