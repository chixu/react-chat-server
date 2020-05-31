var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
  to: String,
  from: String,
  datetime: String,
  text: String,
});

module.exports = mongoose.model('Message', MessageSchema);