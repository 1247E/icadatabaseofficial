// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('joinRoom', ({ room, username }) => {
    socket.username = username || 'Anonymous';
    socket.join(room);
    console.log(`${socket.username} joined room: ${room}`);

    socket.on('chatMessage', ({ room, text }) => {
      io.to(room).emit('message', { user: socket.username, text });
    });

    socket.on('disconnect', () => {
      console.log(`${socket.username} disconnected`);
    });
  });
});

http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
