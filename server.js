require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let connectedUsers = {};

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use(express.static('public'));
app.use(express.json());

io.on('connection', (socket) => {
  console.log('New user connected');

  // Emit current connected users to the new user
  io.emit('connectedUsers', Object.keys(connectedUsers));

  // When a user joins, store their username and socket ID
  socket.on('join', (username) => {
    connectedUsers[username] = socket.id;
    io.emit('connectedUsers', Object.keys(connectedUsers)); // Broadcast updated user list
  });

  // Send all previous messages to the new user
  Message.find().then(messages => {
    socket.emit('chatMessages', messages);
  });

  // Listen for public messages
  socket.on('sendMessage', (data) => {
    const newMessage = new Message({ username: data.username, message: data.message });
    newMessage.save().then(() => {
      io.emit('chatMessage', newMessage); // Broadcast message to all users
    });
  });

  // Handle private messages
  socket.on('sendPrivateMessage', (data) => {
    const targetSocketId = connectedUsers[data.to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('privateMessage', { username: data.username, message: data.message });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    for (let username in connectedUsers) {
      if (connectedUsers[username] === socket.id) {
        delete connectedUsers[username];
        break;
      }
    }
    io.emit('connectedUsers', Object.keys(connectedUsers)); // Update the user list
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
