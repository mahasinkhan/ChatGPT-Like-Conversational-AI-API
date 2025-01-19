import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

io.use(async (socket, next) => {
    try {
        console.log('Handshake details:', socket.handshake);

        // Extract token and projectId from the handshake
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        console.log('Token:', token);
        console.log('ProjectId:', projectId);

        // Check if the projectId is valid
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }

        // Retrieve the project from the database
        const project = await projectModel.findById(projectId);
        if (!project) {
            return next(new Error('Project not found'));
        }

        // If no token is provided, return authentication error
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return next(new Error('Authentication error: Invalid token'));
        }

        // Assign the decoded user and project to the socket
        socket.user = decoded;
        socket.project = project;
        next();

    } catch (error) {
        next(error);
    }
});

io.on('connection', (socket) => {
    console.log('A user connected to the room:', socket.project._id.toString());
    socket.roomId = socket.project._id.toString();
    socket.join(socket.roomId);

    socket.on('project-message', async (data) => {
        const message = data.message;
        const aiIsPresentInMessage = message.includes('@ai');

        // Broadcast message to the room
        socket.broadcast.to(socket.roomId).emit('project-message', data);

        if (aiIsPresentInMessage) {
            const prompt = message.replace('@ai', '');
            try {
                const result = await generateResult(prompt);

                // Send AI response to the room
                io.to(socket.roomId).emit('project-message', {
                    message: result,
                    sender: {
                        _id: 'ai',
                        email: 'AI'
                    }
                });
            } catch (err) {
                io.to(socket.roomId).emit('project-message', {
                    message: 'AI service failed, please try again.',
                    sender: {
                        _id: 'ai',
                        email: 'AI'
                    }
                });
            }

            return;
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        socket.leave(socket.roomId);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
