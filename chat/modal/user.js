var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  color: {
    type: String,
    required: true
  },
  friends: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('User', UserSchema);