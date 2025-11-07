import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";

export interface MotorLocationUpdate {
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
}

export interface MotorStatusUpdate {
  motorId: number;
  plat_nomor: string;
  oldStatus: string;
  newStatus: string;
  updated_by?: string;
  timestamp: string;
  event: string;
}

export interface MotorServiceUpdate {
  motorId: number;
  plat_nomor: string;
  serviceStatus: string;
  serviceType?: string;
  technician?: string;
  notes?: string;
  timestamp: string;
  event: string;
}

interface UseMotorWebSocketOptions {
  motorId?: number;
  autoSubscribe?: boolean;
  onLocationUpdate?: (data: MotorLocationUpdate) => void;
  onStatusUpdate?: (data: MotorStatusUpdate) => void;
  onServiceUpdate?: (data: MotorServiceUpdate) => void;
  onMileageUpdate?: (data: any) => void;
  onSyncComplete?: (data: any) => void;
}

export function useMotorWebSocket(options: UseMotorWebSocketOptions = {}) {
  const {
    motorId,
    autoSubscribe = true,
    onLocationUpdate,
    onStatusUpdate,
    onServiceUpdate,
    onMileageUpdate,
    onSyncComplete,
  } = options;

  const { isConnected, on, subscribeToMotor, unsubscribeFromMotor } =
    useWebSocket();
  const [subscribedMotorId, setSubscribedMotorId] = useState<number | null>(
    null
  );

  // Auto subscribe/unsubscribe when motorId changes
  useEffect(() => {
    if (autoSubscribe && motorId && isConnected) {
      subscribeToMotor(motorId);
      setSubscribedMotorId(motorId);
    }

    return () => {
      if (subscribedMotorId) {
        unsubscribeFromMotor(subscribedMotorId);
        setSubscribedMotorId(null);
      }
    };
  }, [
    motorId,
    autoSubscribe,
    isConnected,
    subscribeToMotor,
    unsubscribeFromMotor,
    subscribedMotorId,
  ]);

  // Event listeners
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeCallbacks: (() => void)[] = [];

    // Location updates
    if (onLocationUpdate) {
      const unsubscribe = on("motor:location:update", (data) => {
        if (!motorId || data.motorId === motorId) {
          onLocationUpdate(data);
        }
      });
      unsubscribeCallbacks.push(unsubscribe);
    }

    // Status updates
    if (onStatusUpdate) {
      const unsubscribe = on("motor:status:update", (data) => {
        if (!motorId || data.motorId === motorId) {
          onStatusUpdate(data);
        }
      });
      unsubscribeCallbacks.push(unsubscribe);
    }

    // Service updates
    if (onServiceUpdate) {
      const unsubscribe = on("motor:service:update", (data) => {
        if (!motorId || data.motorId === motorId) {
          onServiceUpdate(data);
        }
      });
      unsubscribeCallbacks.push(unsubscribe);
    }

    // Mileage updates
    if (onMileageUpdate) {
      const unsubscribe = on("motor:mileage:update", (data) => {
        if (!motorId || data.motorId === motorId) {
          onMileageUpdate(data);
        }
      });
      unsubscribeCallbacks.push(unsubscribe);
    }

    // Sync complete events
    if (onSyncComplete) {
      const unsubscribeGPS = on("motor:gps:sync:complete", (data) => {
        if (!motorId || data.motorId === motorId) {
          onSyncComplete(data);
        }
      });
      const unsubscribeMileage = on("motor:mileage:sync:complete", (data) => {
        if (!motorId || data.motorId === motorId) {
          onSyncComplete(data);
        }
      });
      unsubscribeCallbacks.push(unsubscribeGPS, unsubscribeMileage);
    }

    return () => {
      unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
    };
  }, [
    isConnected,
    motorId,
    on,
    onLocationUpdate,
    onStatusUpdate,
    onServiceUpdate,
    onMileageUpdate,
    onSyncComplete,
  ]);

  /**
   * Manual subscription to motor
   */
  const subscribe = useCallback(
    (id: number) => {
      subscribeToMotor(id);
      setSubscribedMotorId(id);
    },
    [subscribeToMotor]
  );

  /**
   * Manual unsubscription from motor
   */
  const unsubscribe = useCallback(
    (id: number) => {
      unsubscribeFromMotor(id);
      setSubscribedMotorId(null);
    },
    [unsubscribeFromMotor]
  );

  return {
    isConnected,
    subscribedMotorId,
    subscribe,
    unsubscribe,
  };
}
