const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

const CHAT_HISTORY_FILE = path.join(__dirname, 'chatHistory.json');

app.use(express.static('public'));

let chatHistory = {};

// Load chat history from file on startup
function loadChatHistory() {
  if (fs.existsSync(CHAT_HISTORY_FILE)) {
    try {
      const data = fs.readFileSync(CHAT_HISTORY_FILE, 'utf-8');
      chatHistory = JSON.parse(data);
    } catch (err) {
      console.error('Failed to load chat history:', err);
      chatHistory = {};
    }
  } else {
    chatHistory = {};
  }
}

// Save chat history to file
function saveChatHistory() {
  fs.writeFile(CHAT_HISTORY_FILE, JSON.stringify(chatHistory, null, 2), (err) => {
    if (err) console.error('Error saving chat history:', err);
  });
}

loadChatHistory();

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('joinRoom', ({ room, username }) => {
    socket.username = username || 'Anonymous';
    socket.join(room);
    console.log(`${socket.username} joined room: ${room}`);

    // Send chat history of this room to the newly joined client
    const history = chatHistory[room] || [];
    socket.emit('chatHistory', history);

    socket.on('chatMessage', ({ room, text }) => {
      const message = { user: socket.username, text };
      
      // Save the message to chatHistory and persist
      if (!chatHistory[room]) chatHistory[room] = [];
      chatHistory[room].push(message);
      saveChatHistory();

      io.to(room).emit('message', message);
    });

    socket.on('disconnect', () => {
      console.log(`${socket.username} disconnected`);
    });
  });
});

http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
