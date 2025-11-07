import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import { MotorLocationUpdate } from "./useMotorWebSocket";

interface UseMotorTrackingOptions {
  autoSubscribe?: boolean;
  onLocationUpdate?: (data: MotorLocationUpdate) => void;
  onStatusChange?: (data: any) => void;
  onIopgpsUpdate?: (data: any) => void;
  filter?: (motorId: number) => boolean;
}

export function useMotorTracking(options: UseMotorTrackingOptions = {}) {
  const {
    autoSubscribe = true,
    onLocationUpdate,
    onStatusChange,
    onIopgpsUpdate,
    filter,
  } = options;

  const {
    isConnected,
    on,
    subscribeToMotorTracking,
    unsubscribeFromMotorTracking,
  } = useWebSocket();

  const [trackingData, setTrackingData] = useState<
    Map<number, MotorLocationUpdate>
  >(new Map());

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Auto subscribe/unsubscribe
  useEffect(() => {
    if (autoSubscribe && isConnected) {
      subscribeToMotorTracking();
      setIsSubscribed(true);
    }

    return () => {
      if (isSubscribed) {
        unsubscribeFromMotorTracking();
        setIsSubscribed(false);
      }
    };
  }, [
    autoSubscribe,
    isConnected,
    subscribeToMotorTracking,
    unsubscribeFromMotorTracking,
    isSubscribed,
  ]);

  // Event listeners
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeCallbacks: (() => void)[] = [];

    // Motor tracking updates
    const unsubscribeTracking = on(
      "motor:tracking:update",
      (data: MotorLocationUpdate) => {
        if (!filter || filter(data.motorId)) {
          setTrackingData((prev) => new Map(prev.set(data.motorId, data)));
          setLastUpdate(new Date());

          if (onLocationUpdate) {
            onLocationUpdate(data);
          }
        }
      }
    );

    // IOPGPS location updates (more real-time)
    const unsubscribeIopgps = on("iopgps:location_update", (data: any) => {
      if (!filter || filter(data.motorId)) {
        const motorData: MotorLocationUpdate = {
          motorId: data.motorId,
          plat_nomor: data.plat_nomor,
          lat: data.lat,
          lng: data.lng,
          address: data.address,
          last_update: data.last_update,
          gps_status:
            data.location_status === "realtime" ? "Online" : "Offline",
          event: "location_update",
          timestamp: data.timestamp,
        };

        setTrackingData((prev) => new Map(prev.set(data.motorId, motorData)));
        setLastUpdate(new Date());

        if (onLocationUpdate) {
          onLocationUpdate(motorData);
        }

        if (onIopgpsUpdate) {
          onIopgpsUpdate(data);
        }
      }
    });

    // Status changes
    const unsubscribeStatus = on("motor:status:changed", (data) => {
      if (!filter || filter(data.motorId)) {
        if (onStatusChange) {
          onStatusChange(data);
        }
      }
    });

    // IOPGPS sync updates
    const unsubscribeSync = on("iopgps:sync_update", (data) => {
      console.log("IOPGPS sync update:", data);
      if (onIopgpsUpdate) {
        onIopgpsUpdate(data);
      }
    });

    unsubscribeCallbacks.push(
      unsubscribeTracking,
      unsubscribeIopgps,
      unsubscribeStatus,
      unsubscribeSync
    );

    return () => {
      unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
    };
  }, [
    isConnected,
    on,
    onLocationUpdate,
    onStatusChange,
    onIopgpsUpdate,
    filter,
  ]);

  /**
   * Get tracking data for specific motor
   */
  const getMotorData = useCallback(
    (motorId: number): MotorLocationUpdate | undefined => {
      return trackingData.get(motorId);
    },
    [trackingData]
  );

  /**
   * Get all tracking data
   */
  const getAllTrackingData = useCallback((): MotorLocationUpdate[] => {
    return Array.from(trackingData.values());
  }, [trackingData]);

  /**
   * Check if motor is being tracked
   */
  const isMotorTracked = useCallback(
    (motorId: number): boolean => {
      return trackingData.has(motorId);
    },
    [trackingData]
  );

  /**
   * Manual subscription
   */
  const subscribe = useCallback(() => {
    subscribeToMotorTracking();
    setIsSubscribed(true);
  }, [subscribeToMotorTracking]);

  /**
   * Manual unsubscription
   */
  const unsubscribe = useCallback(() => {
    unsubscribeFromMotorTracking();
    setIsSubscribed(false);
    setTrackingData(new Map());
  }, [unsubscribeFromMotorTracking]);

  /**
   * Force refresh data
   */
  const refresh = useCallback(() => {
    // Trigger manual sync or refresh
    setLastUpdate(new Date());
  }, []);

  return {
    isConnected,
    isSubscribed,
    trackingData: getAllTrackingData(),
    lastUpdate,
    getMotorData,
    isMotorTracked,
    subscribe,
    unsubscribe,
    refresh,
  };
}
