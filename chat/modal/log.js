var mongoose = require('mongoose');

var LogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  datetime: {
    type: Date,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  ip: {
    type: String
  }
});

module.exports = mongoose.model('Log', LogSchema);