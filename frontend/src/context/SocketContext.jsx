import { createContext, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

// VITE_BASE_URL (http://13.235.94.86:30090) se connect karega
const socket = io(import.meta.env.VITE_BASE_URL || 'http://localhost:3000', {
    transports: ['websocket', 'polling'],
    withCredentials: true
});

const SocketProvider = ({ children }) => {
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to socket server successfully!');
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        return () => {
            socket.off('connect');
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
