require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// DB Connect
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamesz')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ DB Error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'gamesz_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
});
app.use(sessionMiddleware);

// Share session with socket.io
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Routes
app.use('/', require('./routes/store'));
app.use('/auth', require('./routes/auth'));
app.use('/orders', require('./routes/orders'));
app.use('/admin', require('./routes/admin'));

// ── SOCKET.IO REAL-TIME CHAT ──────────────────────────────────────────────────
const chatRooms = {}; // roomId -> { messages: [], adminSocket: null, userSocket: null }

io.on('connection', (socket) => {
  const sess = socket.request.session;

  // Customer joins their chat room
  socket.on('customer:join', ({ roomId, username }) => {
    socket.join(roomId);
    if (!chatRooms[roomId]) chatRooms[roomId] = { messages: [], adminSocket: null, userSocket: null };
    chatRooms[roomId].userSocket = socket.id;
    // Send history
    socket.emit('chat:history', chatRooms[roomId].messages);
    // Notify admin
    io.to('admin-room').emit('admin:new_customer', { roomId, username });
    console.log(`Customer ${username} joined room ${roomId}`);
  });

  // Admin joins admin room
  socket.on('admin:join', () => {
    socket.join('admin-room');
    // Send all active rooms
    socket.emit('admin:rooms', Object.keys(chatRooms).map(id => ({
      roomId: id,
      messages: chatRooms[id].messages
    })));
  });

  // Admin opens a specific chat
  socket.on('admin:open_room', ({ roomId }) => {
    socket.join(roomId);
    if (chatRooms[roomId]) {
      socket.emit('chat:history', chatRooms[roomId].messages);
    }
  });

  // Customer sends message
  socket.on('customer:message', ({ roomId, message, username }) => {
    const msg = {
      from: 'customer',
      name: username,
      text: message,
      time: new Date().toISOString()
    };
    if (!chatRooms[roomId]) chatRooms[roomId] = { messages: [], adminSocket: null, userSocket: null };
    chatRooms[roomId].messages.push(msg);
    io.to(roomId).emit('chat:message', msg);
    io.to('admin-room').emit('admin:customer_message', { roomId, msg });
  });

  // Admin sends message (appears as "Support" to customer)
  socket.on('admin:message', ({ roomId, message }) => {
    const msg = {
      from: 'support',
      name: 'Gamesz Support',
      text: message,
      time: new Date().toISOString()
    };
    if (!chatRooms[roomId]) chatRooms[roomId] = { messages: [], adminSocket: null, userSocket: null };
    chatRooms[roomId].messages.push(msg);
    io.to(roomId).emit('chat:message', msg);
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Gamesz running at http://localhost:${PORT}`));
