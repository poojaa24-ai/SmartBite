import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const socketInstance = io('/', {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to server:', socketInstance.id);
      if (user?._id) {
        socketInstance.emit('join:user', user._id);
        if (user.role === 'seller' && user.sellerProfile) {
          socketInstance.emit('join:seller', user.sellerProfile._id || user.sellerProfile);
        }
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const joinOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('join:order', orderId);
    }
  };

  const joinGroupRoom = (groupCode) => {
    if (socket && groupCode) {
      socket.emit('join:group', groupCode);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinOrderRoom, joinGroupRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
