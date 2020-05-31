const User = require('./modal/user');
const randomColor = require('../utils/color').randomColor;
const Message = require('./modal/message');
const Unread = require('./modal/unread');
const dateUtils = require('../utils/date')
const broadcast = require('../utils/socket').broadcast;
const events = require('./event')
const users = [];

async function createMessage(data) {
  let d = {
    ...data, datetime: dateUtils.nowFullString(),
  }
  let message = new Message(d);
  await message.save();
  return d;
}

async function sendMessage(data) {
  console.log('sendMessage', data);
  let d = await createMessage(data);
  let fromFirends = await addFriend(data.from, data.to);
  let toFirends = await addFriend(data.to, data.from);
  return { data: d, toFirends, fromFirends };
}

async function addFriend(username, friendname) {
  let user = getUserFromRoom(username);
  console.log('addFriend', username, friendname);
  if (user) {
    if (user.friends.indexOf(friendname) === -1) {
      user.friends.push(friendname);
      await User.updateOne({ name: username }, { friends: user.friends });
      let friends = await getUserFriends(user);
      return friends;
    }
  } else {
    //add to db;
    user = await User.findOne({ name: username });
    if (user.friends.indexOf(friendname) === -1) {
      user.friends.push(friendname);
      await user.save();
      let friends = await getUserFriends(user);
      return friends;
    }
  }
}

// async function getFriends(data) {
//   await createMessage();
// }

function printUsers() {
  console.log(users.map(u => u.name).join(","));
}

function addUser(user, client) {
  let u = getUserFromRoom(user.name);
  if (!u) {
    broadcast(client, events.ENTER_ROOM, { name: user.name, color: user.color });
    users.push({ ...user, client: client });
    console.log(user.name, 'added...');
    printUsers();
  }
}

function getUserFromRoom(name) {
  return users.filter(u => u.name === name)[0];
}

function getClient(name) {
  let user = getUserFromRoom(name);
  return user ? user.client : undefined;
}

async function getUserFriends(user) {
  let friends = user.friends;
  if (friends.length === 0) return [];
  let frenInfos = await User.find({ name: { $in: friends } }, { name: 1, color: 1, _id: 0 });
  // console.log("getUserFriends", user.name, frenInfos);
  return frenInfos;
}

async function getUser(username) {
  let user = await User.findOne({ name: username }, "-_id -__v").lean();
  // let users = await User.aggregate([
  //   { $match: { name: username } },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "friends",
  //       foreignField: "name",
  //       as: "friends"
  //     }
  //   },
  //   { $project: { _id: 0, name: 1, color: 1, "friends.name": 1, "friends.color": 1 } }]);
  // let user = users[0]
  if (!user) {
    user = await createUser(username);
    // user = user.toJSON();
    user = await User.findOne({ name: username }, "-_id -__v").lean();
    console.log('new user');
  }
  console.log('user', user);
  return user;
}

function removeUser(name) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].name === name) {
      broadcast(users[i].client, events.LEAVE_ROOM, name);
      users.splice(i, 1);
      console.log(name, 'removed...');
      printUsers();
      return;
    }
  }
}

async function createUnread(user, from) {
  console.log("createUnread", user, from);
  let unread = await Unread.findOne({ user, from });
  if (unread) {
    unread.count++;
    await unread.save();
  } else {
    unread = new Unread({
      user, from, count: 1
    })
    await unread.save();
  }
}

async function createUser(name) {
  let user = new User({
    name: name,
    friends: [],
    color: randomColor()
  })
  await user.save();
  await sendMessage({
    from: "CX",
    to: name,
    text: "Welcome!"
  })
  return user;
}

function getRoomInfo() {
  return users.map(u => { return { name: u.name, color: u.color } });
}


module.exports = {
  add: addUser,
  getUserFromRoom: getUserFromRoom,
  get: getUser,
  getClient: getClient,
  getRoomInfo: getRoomInfo,
  sendMessage: sendMessage,
  getFriends: getUserFriends,
  createUnread: createUnread,
  remove: removeUser
}