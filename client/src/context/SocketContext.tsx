"use client";

import {createContext, useContext, useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";
import {useRouter} from "next/navigation";

interface SocketContextType {
  socket: Socket | null;
  isSocketConnected: boolean;
  isOnline: boolean;
}

const SocketContext = createContext<SocketContextType>({socket: null, isSocketConnected: false, isOnline: false});

export const SocketProvider = ({children}: {children: React.ReactNode}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  // Online/offline status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      for (let i = 0; i < 19; i++) {
        router.push("/");
      }

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  // Socket status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) {
      console.error("Socket URL is not defined");
      setIsSocketConnected(false);
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
      setIsSocketConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server.");
      for (let i = 0; i < 19; i++) {
        router.push("/");
      }
      setIsSocketConnected(false);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      for (let i = 0; i < 19; i++) {
        router.push("/");
      }
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      newSocket.removeAllListeners();
    };
  }, [router]);

  return <SocketContext.Provider value={{socket, isSocketConnected, isOnline}}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
