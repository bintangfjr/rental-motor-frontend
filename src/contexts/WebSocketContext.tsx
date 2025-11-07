import React, { createContext, useContext, useEffect, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

interface WebSocketContextType {
  isConnected: boolean;
  connectionStatus: "connected" | "disconnected" | "connecting" | "error";
  lastError?: string;
  connectedClients: number;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting" | "error"
  >("disconnected");
  const [lastError, setLastError] = useState<string>("");
  const [connectedClients, setConnectedClients] = useState(0);

  const { isConnected, on } = useWebSocket({
    autoConnect: true,
    onConnected: () => setConnectionStatus("connected"),
    onDisconnected: () => setConnectionStatus("disconnected"),
    onError: (error) => {
      setLastError(error);
      setConnectionStatus("error");
    },
  });

  // Listen for connection stats
  useEffect(() => {
    const unsubscribe = on("websocket:stats", (data) => {
      setConnectedClients(data.totalClients);
    });

    const unsubscribeHealth = on("health:response", (data) => {
      setConnectedClients(data.connectedClients);
    });

    return () => {
      unsubscribe();
      unsubscribeHealth();
    };
  }, [on]);

  // Update connection status based on isConnected
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("connected");
    } else {
      setConnectionStatus("disconnected");
    }
  }, [isConnected]);

  const value: WebSocketContextType = {
    isConnected,
    connectionStatus,
    lastError,
    connectedClients,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
}
