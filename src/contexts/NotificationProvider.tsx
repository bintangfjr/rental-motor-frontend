// NotificationProvider.tsx
import React, { useState, useCallback } from "react";
import {
  NotificationContext,
  NotificationContextType,
  Notification,
} from "./NotificationContext";

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newNotification = { ...notification, id };
      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const createNotificationHelper =
    (type: Notification["type"]) =>
    (
      title: string,
      message: string,
      options?: Partial<Omit<Notification, "id" | "type" | "title" | "message">>
    ) => {
      addNotification({ type, title, message, ...options });
    };

  const helpers: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    info: createNotificationHelper("info"),
    success: createNotificationHelper("success"),
    warning: createNotificationHelper("warning"),
    error: createNotificationHelper("error"),
  };

  return (
    <NotificationContext.Provider value={helpers}>
      {children}
    </NotificationContext.Provider>
  );
};
