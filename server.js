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

io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
