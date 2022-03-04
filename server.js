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

  if (playerIndex === -1) {
    return;
  }

  //* Mark player as connected

  console.log(playerIndex);
  connections[playerIndex] = false;
  console.log(connections);
  console.log(`Player ${playerIndex} ${socket.id} connected`);

  //* Tell player which number he is

  socket.emit('player number', playerIndex);

  //* Tell enemy which player join

  socket.broadcast.emit('player connected', playerIndex);

  //* Mark player status as ready

  socket.on('player ready', () => {
    console.log(`Player ${playerIndex} is ready!`);
    socket.broadcast.emit('enemy ready', playerIndex);
    connections[playerIndex] = true;

    if (connections.every((connection) => connection)) {
      socket.broadcast.emit('game started');
    }
  });

  //* Check players connections

  socket.on('check players', () => {
    const playersStatus = [];
    for (const i in connections) {
      console.log('con', connections[i]);
      connections[i] === undefined
        ? playersStatus.push({ connected: false, ready: false })
        : playersStatus.push({ connected: true, ready: connections[i] });
    }

    console.log('Hello');

    socket.emit('check players', playersStatus);
  });

  //* Player fired

  socket.on('fire', (cellId) => {
    console.log(cellId);
    socket.broadcast.emit('fire replay', cellId);
  });

  //* Disconnect

  socket.on('disconnect', () => {
    console.log('Disconected...');
    connections[playerIndex] = undefined;
    socket.emit('check players');
    socket.broadcast.emit('player disconnected');
  });
});
