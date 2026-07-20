import { createContext, useEffect } from 'react';
import { io } from 'socket.io-client';

// Dynamic URL with fallback
const SOCKET_URL = import.meta.env.VITE_BASE_URL || 'http://13.235.94.86:30090';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['polling', 'websocket'],
});

export const SocketContext = createContext();

// import.meta.env.VITE_BASE_URL docker build arg se aayega
const socket = io(import.meta.env.VITE_BASE_URL || 'http://13.235.94.86:30090', {
    transports: ['websocket', 'polling'],
    withCredentials: true
});

const SocketProvider = ({ children }) => {
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Socket Connected!');
        });
        socket.on('connect_error', (err) => {
            console.error('Socket error:', err);
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
