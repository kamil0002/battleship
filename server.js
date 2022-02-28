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

const connections = [false, false];


io.on('connection', (socket) => {
  let playerIndex = -1;

  for (const connectionNumber in connections) {
    if (!connections[connectionNumber]) {
      playerIndex = connectionNumber;
      break;
    }
    console.log('Second', connections);
  }

  //* Mark player as connected

  connections[playerIndex] = true;

  console.log(`Player ${playerIndex} ${socket.id} connected`);

  if (playerIndex === -1) {
    console.log('Server is full!');
    return;
  }

  socket.emit('player connected', playerIndex);

  socket.on('disconnect', () => {
    connections[playerIndex] = false;
    console.log(`Player ${playerIndex} disconnected`);
  });
});
