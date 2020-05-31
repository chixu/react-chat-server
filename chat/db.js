
const mongoose = require('mongoose');
var Message = require('./modal/message');
var User = require('./modal/user');
var url = "mongodb://localhost:27017/chat";
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('close', console.error.bind(console, 'connection closed:'));
db.once('open', function () {
  // we're connected!
  console.log('connected');
  // Message.find(function (err, msgs) {
  //   if (err) return console.error(err);
  //   console.log(msgs);
  // })
  // let newMsg = new Message({
  //   to: 'Alice',
  //   from: 'Alice',
  //   text: 'gen from db',
  //   datetime: new Date().toString()
  // })
  // newMsg.save(function (err, msg) {
  //   if (err) return console.error(err);
  //   console.log('saved');
  // });
});
mongoose.connect(url, { useNewUrlParser: true });
// var database = require('mongodb').MongoClient;
// database.connect(url, function (err, db) {
//   if (err) throw err;
//   var dbo = db.db("chat");
//   dbo.collection("message").find({}).toArray(function (err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });

