const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Structure: { roomName: [{ user, text, timestamp }, ...] }
const chatHistory = {};

// Clean up messages older than 24 hours (run every hour)
const CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour
const MESSAGE_TTL = 1000 * 60 * 60 * 24; // 24 hours

function cleanupOldMessages() {
  const now = Date.now();
  for (const room in chatHistory) {
    chatHistory[room] = chatHistory[room].filter(
      msg => now - msg.timestamp <= MESSAGE_TTL
    );
    // Optional: delete room if empty
    if (chatHistory[room].length === 0) {
      delete chatHistory[room];
    }
  }
}
setInterval(cleanupOldMessages, CLEANUP_INTERVAL);

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('joinRoom', ({ room, username }) => {
    socket.username = username || 'Anonymous';
    socket.join(room);
    console.log(`${socket.username} joined room: ${room}`);

    // Send chat history to this socket
    const history = chatHistory[room] || [];
    socket.emit('chatHistory', history);

    socket.on('chatMessage', ({ room, text }) => {
      const message = { user: socket.username, text, timestamp: Date.now() };
      
      // Store message in chatHistory
      if (!chatHistory[room]) chatHistory[room] = [];
      chatHistory[room].push(message);

      // Broadcast message to room
      io.to(room).emit('message', { user: message.user, text: message.text });
    });

    socket.on('disconnect', () => {
      console.log(`${socket.username} disconnected`);
    });
  });
});

http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
