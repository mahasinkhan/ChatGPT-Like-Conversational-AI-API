import { io } from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = (projectId) => {
    // Ensure socketInstance is not initialized multiple times
    if (socketInstance) {
        return socketInstance;
    }

    // Initialize the socket connection
    socketInstance = io(import.meta.env.VITE_API_URL, {
        auth: {
            token: localStorage.getItem('token')
        },
        query: {
            projectId
        }
    });

    // Handle socket connection errors
    socketInstance.on('connect_error', (err) => {
        console.error('Connection error:', err);
        alert('Failed to connect to the server. Please check your network or token.');
    });

    socketInstance.on('connect', () => {
        console.log('Connected to the server');
    });

    socketInstance.on('disconnect', () => {
        console.log('Disconnected from the server');
    });

    return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
    if (!socketInstance) {
        console.warn('Socket is not initialized');
        return;
    }
    socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
    if (!socketInstance) {
        console.warn('Socket is not initialized');
        return;
    }
    socketInstance.emit(eventName, data);
};
