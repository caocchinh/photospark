"use client";

import {createContext, useContext, useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({socket: null, isConnected: false});

export const SocketProvider = ({children}: {children: React.ReactNode}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) {
      console.error("Socket URL is not defined");
      setIsConnected(false);
      return;
    }
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      timeout: 10000,
      autoConnect: false,
    });

    newSocket.connect();

    newSocket.on("connect", () => {
      console.log("Connected to server.");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server.");
      setIsConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      newSocket.removeAllListeners();
    };
  }, []);

  return <SocketContext.Provider value={{socket, isConnected}}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
