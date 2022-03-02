const express = require('express');

const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});

app.use(express.static(path.join(__dirname, 'public', 'dist')));

const connections = [undefined, undefined];

io.on('connection', (socket) => {
  let playerIndex = -1;

  for (const connectionNumber in connections) {
    if (connections[connectionNumber] === undefined) {
      playerIndex = connectionNumber;
      break;
    }
    console.log('Second', connections);
  }

  //* Mark player as connected

  console.log(playerIndex);
  connections[playerIndex] = false;
  console.log(connections);
  console.log(`Player ${playerIndex} ${socket.id} connected`);

  if (playerIndex === -1) {
    return;
  }

  socket.emit('player number', playerIndex);

  socket.broadcast.emit('player connected', playerIndex);

  socket.on('player ready', () => {
    console.log(`Player ${playerIndex} is ready!`);
    socket.broadcast.emit('enemy ready', playerIndex);
    connections[playerIndex] = true;
  });

  socket.on('check players', () => {
    const playersStatus = [];
    for (const i in connections) {
      connections[i] === undefined
        ? playersStatus.push({ connected: false, ready: false })
        : playersStatus.push({ connected: true, ready: false });
    }
    socket.emit('check players', playersStatus);
  });

  socket.on('disconnect', () => {
    console.log('Disconected...');
    connections[playerIndex] = undefined;
    socket.emit('check players');
    socket.broadcast.emit('player disconnected');
  });
});
