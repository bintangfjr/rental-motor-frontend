import { useState, useEffect, useRef, useCallback } from "react";
import websocketService, {
  WebSocketEvent,
  WebSocketEventMap,
} from "../services/websocketService";

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true, onConnected, onDisconnected, onError } = options;

  const [isConnected, setIsConnected] = useState(
    websocketService.getConnectionStatus()
  );
  const eventCallbacks = useRef<Map<WebSocketEvent, Function>>(new Map());

  // Connection management
  useEffect(() => {
    if (autoConnect) {
      websocketService.connect();
    }

    const unsubscribeConnection = websocketService.onConnectionChange(
      (connected) => {
        setIsConnected(connected);

        if (connected && onConnected) {
          onConnected();
        } else if (!connected && onDisconnected) {
          onDisconnected();
        }
      }
    );

    const unsubscribeError = websocketService.on("error", (data) => {
      if (onError) {
        onError(data.error);
      }
    });

    return () => {
      unsubscribeConnection();
      unsubscribeError();

      // Clean up all event listeners
      eventCallbacks.current.forEach((_, event) => {
        websocketService.off?.(event);
      });
      eventCallbacks.current.clear();
    };
  }, [autoConnect, onConnected, onDisconnected, onError]);

  /**
   * Subscribe to WebSocket event
   */
  const on = useCallback(
    <T extends WebSocketEvent>(
      event: T,
      callback: (data: WebSocketEventMap[T]) => void
    ) => {
      const unsubscribe = websocketService.on(event, callback);
      eventCallbacks.current.set(event, unsubscribe);

      return unsubscribe;
    },
    []
  );

  /**
   * Emit event to server
   */
  const emit = useCallback(<T extends WebSocketEvent>(event: T, data?: any) => {
    websocketService.emit(event, data);
  }, []);

  /**
   * Subscribe to motor events
   */
  const subscribeToMotor = useCallback((motorId: number) => {
    websocketService.subscribeToMotor(motorId);
  }, []);

  /**
   * Unsubscribe from motor events
   */
  const unsubscribeFromMotor = useCallback((motorId: number) => {
    websocketService.unsubscribeFromMotor(motorId);
  }, []);

  /**
   * Subscribe to motor tracking
   */
  const subscribeToMotorTracking = useCallback(() => {
    websocketService.subscribeToMotorTracking();
  }, []);

  /**
   * Unsubscribe from motor tracking
   */
  const unsubscribeFromMotorTracking = useCallback(() => {
    websocketService.unsubscribeFromMotorTracking();
  }, []);

  /**
   * Send ping
   */
  const ping = useCallback(() => {
    websocketService.ping();
  }, []);

  /**
   * Health check
   */
  const healthCheck = useCallback(() => {
    websocketService.healthCheck();
  }, []);

  /**
   * Update auth token
   */
  const updateAuthToken = useCallback((token: string) => {
    websocketService.updateAuthToken(token);
  }, []);

  return {
    // Connection state
    isConnected,

    // Event management
    on,
    emit,

    // Motor specific methods
    subscribeToMotor,
    unsubscribeFromMotor,
    subscribeToMotorTracking,
    unsubscribeFromMotorTracking,

    // Utility methods
    ping,
    healthCheck,
    updateAuthToken,

    // Connection management
    connect: websocketService.connect.bind(websocketService),
    disconnect: websocketService.disconnect.bind(websocketService),
  };
}
