const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const taskRoutes = require('./routes/taskRoutes');
const connectDB = require('./config/db');

require('dotenv').config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

// Send notifications on task updates
app.post('/api/tasks', (req, res, next) => {
    io.emit('taskCreated', req.body);
    next();
});

app.put('/api/tasks/:id', (req, res, next) => {
    io.emit('taskUpdated', req.body);
    next();
});

app.delete('/api/tasks/:id', (req, res, next) => {
    io.emit('taskDeleted', req.params.id);
    next();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
