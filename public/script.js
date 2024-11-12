const socket = io();
let currentUsername = null;

// Elements
const loginDiv = document.getElementById('login');
const chatDiv = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');
const sendPublicBtn = document.getElementById('sendPublicBtn');
const publicMessagesDiv = document.getElementById('publicMessages');
const privateMessageInput = document.getElementById('privateMessageInput');
const sendPrivateBtn = document.getElementById('sendPrivateBtn');
const privateMessagesDiv = document.getElementById('privateMessages');
const userList = document.getElementById('userList');
const privateChatDiv = document.getElementById('privateChat');
const privateUserSpan = document.getElementById('privateUser');

// Event listeners
document.getElementById('loginBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  if (username) {
    socket.emit('join', username);
    currentUsername = username;
    loginDiv.style.display = 'none';
    chatDiv.style.display = 'flex'; // Show chat area
    document.getElementById('publicChatOption').click(); // Automatically select Public Chat on login
  }
});

sendPublicBtn.addEventListener('click', () => {
  const message = messageInput.value;
  if (message) {
    socket.emit('sendMessage', { username: currentUsername, message: message });
    messageInput.value = ''; // Clear input
  }
});

sendPrivateBtn.addEventListener('click', () => {
  const message = privateMessageInput.value;
  if (message) {
    socket.emit('sendPrivateMessage', { username: currentUsername, to: privateUserSpan.innerText, message: message });
    privateMessageInput.value = ''; // Clear input
  }
});

// Listen for public chat messages
socket.on('chatMessages', (messages) => {
  publicMessagesDiv.innerHTML = '';
  messages.forEach(message => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${message.username}: ${message.message}`;
    publicMessagesDiv.appendChild(messageDiv);
  });
});

// Listen for new public chat message
socket.on('chatMessage', (message) => {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = `${message.username}: ${message.message}`;
  publicMessagesDiv.appendChild(messageDiv);
});

// Listen for connected users
socket.on('connectedUsers', (users) => {
  userList.innerHTML = '';
  users.forEach(user => {
    const userLi = document.createElement('li');
    userLi.textContent = user;
    userLi.addEventListener('click', () => selectUserForPrivateChat(user));
    userList.appendChild(userLi);
  });
});

// Set up private chat with selected user
function selectUserForPrivateChat(username) {
  privateUserSpan.innerText = username;
  privateChatDiv.style.display = 'block';
  publicMessagesDiv.style.display = 'none'; // Hide public chat when private chat is active
  document.getElementById('privateChatOption').style.display = 'block';
}

// Listen for private messages
socket.on('privateMessage', (data) => {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = `${data.username}: ${data.message}`;
  privateMessagesDiv.appendChild(messageDiv);
});

// Switch between Public and Private Chat
document.getElementById('publicChatOption').addEventListener('click', () => {
  publicMessagesDiv.style.display = 'block';
  privateChatDiv.style.display = 'none';
  document.getElementById('privateChatOption').style.display = 'none';
});

document.getElementById('privateChatOption').addEventListener('click', () => {
  privateChatDiv.style.display = 'block';
  publicMessagesDiv.style.display = 'none';
});
