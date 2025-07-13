// public/script.js
const socket = io();
const params = new URLSearchParams(window.location.search);
const room = params.get('room');
const username = params.get('username') || 'Anonymous';

socket.emit('joinRoom', { room, username });

const form = document.getElementById('messageForm');
const input = document.getElementById('messageInput');
const messages = document.getElementById('messages');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chatMessage', { room, text: input.value });
    input.value = '';
  }
});

socket.on('message', function({ user, text }) {
  const item = document.createElement('li');
  item.textContent = `${user}: ${text}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
