import React, { createContext, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

// Fallback to your EC2 backend NodePort if the build variable is missing
const SOCKET_URL = import.meta.env.VITE_BASE_URL || 'http://13.235.94.86:30090';

// Initialize socket with safety options
const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket', 'polling']
});

const SocketProvider = ({ children }) => {
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to server with ID:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        // Clean up listeners on unmount
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
