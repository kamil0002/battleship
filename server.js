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
  }

  if (playerIndex === -1) {
    return;
  }

  //* Mark player as connected

  connections[playerIndex] = false;

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
      connections[i] === undefined
        ? playersStatus.push({ connected: false, ready: false })
        : playersStatus.push({ connected: true, ready: connections[i] });
    }

    socket.emit('check players', playersStatus);
  });


  //* Player fired

  socket.on('fire', (cellId) => socket.broadcast.emit('fire received', cellId));

  //* Inform player if he hit enemy ship

  socket.on('fire replay', (cellId) => socket.broadcast.emit('fire replay', cellId));

  //* Disconnect

  socket.on('disconnect', () => {
    console.log(`Player. ${playerIndex} disconnected...`);
    connections[playerIndex] = undefined;
    socket.emit('check players');
    socket.broadcast.emit('player disconnected');
  });
});
