const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();

// Express CORS Setup
app.use(cors({
    origin: '*',
    credentials: true
}));

const server = http.createServer(app);

// Socket.IO Server CORS Setup
const io = new Server(server, {
    cors: {
        origin: '*', // Production/Testing ke liye saare origins allow karta hai
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Extra: Express server handle
module.exports = { app, server, io };
