const Log = require('./modal/log');

function log(client, action) {
  let l = new Log({
    name: client.username,
    ip: client.handshake.address,
    datetime: new Date(),
    action
  })
  l.save();
}

module.exports = log;