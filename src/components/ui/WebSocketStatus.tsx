import React from "react";
import { useWebSocketContext } from "../../contexts/WebSocketContext";

export const WebSocketStatus: React.FC = () => {
  const { connectionStatus, connectedClients, lastError } =
    useWebSocketContext();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "disconnected":
        return "bg-gray-500";
      case "connecting":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Error";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span>{getStatusText()}</span>
      {connectionStatus === "connected" && (
        <span className="text-gray-500">({connectedClients} clients)</span>
      )}
      {connectionStatus === "error" && lastError && (
        <span className="text-red-500 text-xs">: {lastError}</span>
      )}
    </div>
  );
};
