const socket = io();
const params = new URLSearchParams(window.location.search);
const room = params.get('room');
const username = params.get('username') || 'Anonymous';

const form = document.getElementById('messageForm');
const input = document.getElementById('messageInput');
const messages = document.getElementById('messages');

// Join the selected room with username
socket.emit('joinRoom', { room, username });

// Load chat history on join
socket.on('chatHistory', (history) => {
  history.forEach(({ user, text }) => {
    const item = document.createElement('li');
    item.innerHTML = `<span class="username">${user}</span>: <span class="text">${text}</span>`;
    messages.appendChild(item);
  });
  messages.scrollTop = messages.scrollHeight;
});

// Display incoming messages
socket.on('message', ({ user, text }) => {
  const item = document.createElement('li');
  item.innerHTML = `<span class="username">${user}</span>: <span class="text">${text}</span>`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

// Send message
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const msg = input.value.trim();
  if (msg.length > 0) {
    socket.emit('chatMessage', { room, text: msg });
    input.value = '';
  }
});
