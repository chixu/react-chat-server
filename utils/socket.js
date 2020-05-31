// function parseData(event, data){

// }
function error(client, event, data) {
  if (!client) return;
  client.emit('event',
    {
      name: event,
      error: JSON.stringify(data)
    }
  );
}

function emit(client, event, data) {
  if (!client) return;
  client.emit('event',
    {
      name: event,
      data: JSON.stringify(data)
    }
  );
}

function broadcast(client, event, data) {
  if (!client) return;
  client.broadcast.emit('event',
    {
      name: event,
      data: JSON.stringify(data)
    }
  );
}

module.exports = {
  emit: emit,
  error: error,
  broadcast: broadcast,
}