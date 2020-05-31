const chat = require('./chat/index')
const events = require('./chat/event')

const io = require('socket.io')();
io.listen(6600);
chat(io);