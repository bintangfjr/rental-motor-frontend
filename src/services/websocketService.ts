import { io, Socket } from "socket.io-client";

export interface WebSocketEventMap {
  // Connection events
  connected: { message: string; clientId: string; timestamp: string };
  error: { error: string; timestamp: string };
  "health:response": {
    status: string;
    connectedClients: number;
    timestamp: string;
    uptime: number;
  };

  // IOPGPS events
  "iopgps:sync_update": {
    type: "sync_started" | "sync_completed" | "sync_failed";
    success?: number;
    failed?: number;
    total?: number;
    duration?: number;
    timestamp: string;
    errors?: string[];
  };
  "iopgps:location_update": {
    motorId: number;
    plat_nomor: string;
    imei: string;
    lat: number;
    lng: number;
    address?: string;
    last_update: string;
    location_status: "realtime" | "stale" | "none";
    timestamp: string;
  };
  "iopgps:health_update": {
    status: "healthy" | "degraded" | "unhealthy";
    tokenStatus: boolean;
    lastSync?: string;
    message: string;
    timestamp: string;
  };
  "iopgps:token_update": {
    hasToken: boolean;
    message: string;
    timestamp: string;
  };

  // Motor control events (emit from client)
  "motor:subscribe": { motorId: number };
  "motor:unsubscribe": { motorId: number };
  "motor:tracking:subscribe": void;
  "motor:tracking:unsubscribe": void;
  join_motor_room: { motorId: number };
  leave_motor_room: { motorId: number };
  ping: void;
  health: void;

  // Motor events (emit from server)
  "motor:subscribed": { motorId: number; room: string; timestamp: string };
  "motor:location:update": {
    motorId: number;
    plat_nomor: string;
    lat: number;
    lng: number;
    speed?: number;
    direction?: number;
    address?: string;
    last_update: string;
    gps_status: string;
    event: string;
    timestamp: string;
  };
  "motor:status:update": {
    motorId: number;
    plat_nomor: string;
    oldStatus: string;
    newStatus: string;
    updated_by?: string;
    timestamp: string;
    event: string;
  };
  "motor:service:update": {
    motorId: number;
    plat_nomor: string;
    serviceStatus: string;
    serviceType?: string;
    technician?: string;
    notes?: string;
    timestamp: string;
    event: string;
  };
  "motor:mileage:update": {
    motorId: number;
    plat_nomor: string;
    total_mileage: number;
    distance_km: number;
    period_date: string;
    average_speed_kmh: number;
    timestamp: string;
    event: string;
  };
  "motor:tracking:update": {
    motorId: number;
    plat_nomor: string;
    lat: number;
    lng: number;
    speed?: number;
    direction?: number;
    address?: string;
    last_update: string;
    gps_status: string;
    event: string;
    timestamp: string;
  };
  "motor:gps:sync:complete": {
    motorId: number;
    success: boolean;
    message?: string;
    timestamp: string;
  };
  "motor:mileage:sync:complete": {
    motorId: number;
    success: boolean;
    message?: string;
    timestamp: string;
  };
  "motor:created": {
    motor: any;
    timestamp: string;
  };
  "motor:deleted": {
    motorId: number;
    plat_nomor: string;
    timestamp: string;
  };
  "motor:status:changed": {
    motorId: number;
    plat_nomor: string;
    oldStatus: string;
    newStatus: string;
    updated_by?: string;
    timestamp: string;
    event: string;
  };

  // System events
  "websocket:stats": {
    totalClients: number;
    timestamp: string;
  };
}

export type WebSocketEvent = keyof WebSocketEventMap;

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 3000;
  private eventCallbacks: Map<WebSocketEvent, Function[]> = new Map();
  private connectionCallbacks: Array<(connected: boolean) => void> = [];
  private readonly debugMode: boolean = false;

  constructor() {
    this.initializeSocket();
  }

  /**
   * Initialize socket connection - SINGLE NAMESPACE
   */
  private initializeSocket(): void {
    const token = localStorage.getItem("token");
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    // Gunakan namespace /api saja untuk semua events
    this.socket = io(`${backendUrl}/api`, {
      auth: {
        token: token || undefined,
      },
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  /**
   * Setup socket event listeners - ALL EVENTS IN ONE NAMESPACE
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      if (this.debugMode) {
        console.log("WebSocket connected to /api namespace");
      }
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionChange(true);
    });

    this.socket.on("disconnect", (reason) => {
      if (this.debugMode) {
        console.log("WebSocket disconnected:", reason);
      }
      this.isConnected = false;
      this.notifyConnectionChange(false);

      if (reason === "io server disconnect") {
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      if (this.debugMode) {
        console.error("WebSocket connection error:", error);
      }
      this.isConnected = false;
      this.notifyConnectionChange(false);
      this.handleReconnection();
    });

    // System events
    this.socket.on("connected", (data) => {
      this.emitEvent("connected", data);
    });

    this.socket.on("error", (data) => {
      if (this.debugMode) {
        console.error("WebSocket error:", data);
      }
      this.emitEvent("error", data);
    });

    this.socket.on("websocket:stats", (data) => {
      this.emitEvent("websocket:stats", data);
    });

    this.socket.on("health:response", (data) => {
      this.emitEvent("health:response", data);
    });

    // ========== MOTOR EVENTS ==========
    this.socket.on("motor:subscribed", (data) => {
      this.emitEvent("motor:subscribed", data);
    });

    this.socket.on("motor:location:update", (data) => {
      this.emitEvent("motor:location:update", data);
    });

    this.socket.on("motor:status:update", (data) => {
      this.emitEvent("motor:status:update", data);
    });

    this.socket.on("motor:service:update", (data) => {
      this.emitEvent("motor:service:update", data);
    });

    this.socket.on("motor:mileage:update", (data) => {
      this.emitEvent("motor:mileage:update", data);
    });

    this.socket.on("motor:tracking:update", (data) => {
      this.emitEvent("motor:tracking:update", data);
    });

    this.socket.on("motor:gps:sync:complete", (data) => {
      this.emitEvent("motor:gps:sync:complete", data);
    });

    this.socket.on("motor:mileage:sync:complete", (data) => {
      this.emitEvent("motor:mileage:sync:complete", data);
    });

    this.socket.on("motor:created", (data) => {
      this.emitEvent("motor:created", data);
    });

    this.socket.on("motor:deleted", (data) => {
      this.emitEvent("motor:deleted", data);
    });

    this.socket.on("motor:status:changed", (data) => {
      this.emitEvent("motor:status:changed", data);
    });

    // ========== IOPGPS EVENTS ==========
    this.socket.on("iopgps:sync_update", (data) => {
      this.emitEvent("iopgps:sync_update", data);
    });

    this.socket.on("iopgps:location_update", (data) => {
      this.emitEvent("iopgps:location_update", data);
    });

    this.socket.on("iopgps:health_update", (data) => {
      this.emitEvent("iopgps:health_update", data);
    });

    this.socket.on("iopgps:token_update", (data) => {
      this.emitEvent("iopgps:token_update", data);
    });

    // Handle events without namespace prefix (fallback)
    this.socket.on("sync_update", (data) => {
      this.emitEvent("iopgps:sync_update", data);
    });

    this.socket.on("location_update", (data) => {
      this.emitEvent("iopgps:location_update", data);
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      if (this.debugMode) {
        console.log(
          `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
      }

      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        } else {
          this.initializeSocket();
        }
      }, this.reconnectInterval);
    } else if (this.debugMode) {
      console.error("Max reconnection attempts reached");
    }
  }

  /**
   * Emit event to callbacks
   */
  private emitEvent<T extends WebSocketEvent>(
    event: T,
    data: WebSocketEventMap[T]
  ): void {
    const callbacks = this.eventCallbacks.get(event) || [];

    if (this.debugMode) {
      console.log(
        `Emitting event ${event} to ${callbacks.length} callbacks`,
        data
      );
    }

    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        if (this.debugMode) {
          console.error(
            `Error in WebSocket callback for event ${event}:`,
            error
          );
        }
      }
    });
  }

  /**
   * Notify connection status change
   */
  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        if (this.debugMode) {
          console.error("Error in connection callback:", error);
        }
      }
    });
  }

  // ========== PUBLIC METHODS ==========

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.notifyConnectionChange(false);
    }
  }

  /**
   * Subscribe to WebSocket event
   */
  on<T extends WebSocketEvent>(
    event: T,
    callback: (data: WebSocketEventMap[T]) => void
  ): () => void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }

    const callbacks = this.eventCallbacks.get(event)!;
    callbacks.push(callback);

    if (this.debugMode) {
      console.log(
        `Registered callback for event ${event}. Total callbacks: ${callbacks.length}`
      );
    }

    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);

        if (this.debugMode) {
          console.log(
            `Unregistered callback for event ${event}. Remaining callbacks: ${callbacks.length}`
          );
        }
      }
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Emit event to server
   */
  emit<T extends WebSocketEvent>(event: T, data?: any): void {
    if (this.socket && this.isConnected) {
      if (this.debugMode) {
        console.log(`Emitting event to server: ${event}`, data);
      }
      this.socket.emit(event, data);
    } else if (this.debugMode) {
      console.warn(`WebSocket not connected. Cannot emit event: ${event}`);
    }
  }

  /**
   * Subscribe to specific motor
   */
  subscribeToMotor(motorId: number): void {
    this.emit("motor:subscribe", { motorId });
    // Also join motor room for specific updates
    this.emit("join_motor_room", { motorId });
  }

  /**
   * Unsubscribe from specific motor
   */
  unsubscribeFromMotor(motorId: number): void {
    this.emit("motor:unsubscribe", { motorId });
    // Also leave motor room
    this.emit("leave_motor_room", { motorId });
  }

  /**
   * Subscribe to motor tracking (all motors)
   */
  subscribeToMotorTracking(): void {
    this.emit("motor:tracking:subscribe");
  }

  /**
   * Unsubscribe from motor tracking
   */
  unsubscribeFromMotorTracking(): void {
    this.emit("motor:tracking:unsubscribe");
  }

  /**
   * Send ping to server
   */
  ping(): void {
    this.emit("ping");
  }

  /**
   * Request health check
   */
  healthCheck(): void {
    this.emit("health");
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Reauthenticate with new token
   */
  updateAuthToken(token: string): void {
    if (this.socket) {
      this.socket.auth = { token };
      // Reconnect with new token
      this.disconnect();
      setTimeout(() => this.connect(), 100);
    }
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Debug method to list all registered callbacks
   */
  debugCallbacks(): void {
    if (!this.debugMode) return;

    console.log("=== WebSocket Callbacks Debug ===");
    this.eventCallbacks.forEach((callbacks, event) => {
      console.log(`Event: ${event}, Callbacks: ${callbacks.length}`);
    });
    console.log("=== End Debug ===");
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// Export untuk global access
if (typeof window !== "undefined") {
  (window as any).websocketService = websocketService;
}

export default websocketService;
