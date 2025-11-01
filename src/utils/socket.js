import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/v1/api', '') || 'http://localhost:5000';

let socket = null;

export const initializeSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socket.on('connect', () => {
            console.log('✅ Connected to Socket.IO server');
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket.IO server');
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket.IO connection error:', error.message);
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initializeSocket();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('🔌 Socket.IO disconnected');
    }
};

