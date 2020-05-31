var mongoose = require('mongoose');

var UnreadSchema = new mongoose.Schema({
  user: String,
  from: String,
  count: Number
});

module.exports = mongoose.model('Unread', UnreadSchema);