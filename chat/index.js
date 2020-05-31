const events = require('./event')
const db = require('./db')
const userController = require('./user');
const Message = require('./modal/message');
const Unread = require('./modal/unread');
const log = require('./log');
const handlers = {};
const projectName = 'cr';
const emit = require('../utils/socket').emit;
const error = require('../utils/socket').error;
// function getHandler(name) {
//   return handlers[projectName + ':' + name];
// }


function registerHandler(name, handler) {
  handlers[name] = handler;
}

function handleTyping(data, client, eventname) {
  let toClient = userController.getClient(data);
  if (toClient)
    emit(toClient, eventname, client.username);
}

registerHandler(events.TYPING, handleTyping)
registerHandler(events.STOP_TYPING, handleTyping)
registerHandler(events.READ, async (data, client) => {
  console.log(events.READ, client.username, data);
  let del = await Unread.deleteOne({ user: client.username, from: data });
  console.log(del);
})
registerHandler(events.UNDREAD, async (data, client) => {
  await userController.createUnread(client.username, data);
})


registerHandler(events.LOG_IN, async (data, client) => {
  console.log('handle', events.LOG_IN, data);
  if (!data) return;
  if (userController.getUserFromRoom(data)) {
    error(client, events.LOG_IN, "You have already logined!");
    return;
  }
  client.username = data;
  log(client, 'login');
  let user = await userController.get(data)
  userController.add(user, client);
  let friends = await userController.getFriends(user);
  let messages = await Message.find({ $or: [{ 'to': data }, { 'from': data }] }, "-_id -__v").sort({ datetime: 1 }).lean();
  let unreads = await Unread.find({ 'user': data }, { user: 0, _id: 0 }).lean();
  let room = userController.getRoomInfo();
  // user.messages = messages;
  // console.log("----messages----");
  // console.log(messages);
  // console.log("----messages end----");
  emit(client, events.LOG_IN, { ...user, room: room, messages: messages, friends, unreads });
})

registerHandler(events.SEND_CHAT, async (data, client) => {
  console.log(events.SEND_CHAT, client.username, data.to, data.text);
  let msgInfo = await userController.sendMessage({
    to: data.to,
    from: client.username,
    text: data.text
  });
  let toClient = userController.getClient(data.to);
  if (toClient) {
    emit(toClient, events.SEND_CHAT, { ...msgInfo.data, friends: msgInfo.toFirends });
  } else {
    userController.createUnread(data.to, client.username);
  }
  emit(client, events.SEND_CHAT, { ...msgInfo.data, friends: msgInfo.fromFirends });
  // console.log(toUser);
})

const chat = function (io) {
  const nsp = io.of('/' + projectName);
  nsp.on('connection', client => {
    console.log('a user connected');
    var address = client.handshake.address;
    console.log('New connection from ' + address);
    client.on('event', data => {
      let eventName = data.name;
      let handler = handlers[eventName];
      if (eventName !== events.LOG_IN && !client.username)
        return;
      if (handler) {
        handler(JSON.parse(data.data), client, data.name);
      }
    });
    client.on('disconnect', function () {
      if (client.username) {
        console.log(client.username, 'disconnected');
        log(client, 'logout');
        userController.remove(client.username);
      }
    });
  });
}

module.exports = chat;
