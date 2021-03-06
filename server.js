const express = require('express');

const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;

app.use('/', express.static(path.join(__dirname, 'public', 'dist')));

const players = [
  { connected: undefined, name: 'Player 1' },
  { connected: undefined, name: 'Player 2' },
];

io.on('connection', (socket) => {
  let playerIndex = -1;

  //* Check if server is full

  socket.emit('server status', !players.some((player) => player.connected === undefined));

  for (const connectionNumber in players) {
    if (players[connectionNumber].connected === undefined) {
      playerIndex = connectionNumber;
      break;
    }
  }

  console.log(`Player ${playerIndex} connected`);

  if (playerIndex === -1) {
    return;
  }

  //* Mark player as connected

  players[playerIndex].connected = false;

  //* Tell player which number he is

  socket.emit('player number', playerIndex);

  //* Tell enemy which player join

  socket.broadcast.emit('player connected');

  //* Mark player status as ready and send his name

  socket.on('player ready', () => {
    console.log(`Player ${playerIndex} is ready!`);
    socket.broadcast.emit('enemy ready', players[playerIndex].name);
    socket.emit('player name', players[playerIndex].name);
    players[playerIndex].connected = true;

    if (players.every((connection) => connection.connected)) {
      socket.broadcast.emit('game started', players[playerIndex]);
    }
  });

  //* Check players players

  socket.on('check players', () => {
    const playersStatus = [];
    for (const i in players) {
      players[i].connected === undefined
        ? playersStatus.push({ connected: false, ready: false })
        : playersStatus.push({ connected: true, ready: players[i].connected });
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
    players[playerIndex].connected = undefined;
    socket.emit('check players');
    socket.broadcast.emit('player disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
