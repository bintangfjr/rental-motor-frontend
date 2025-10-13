import { useContext } from "react";
import { NotificationContext } from "../contexts/NotificationContext";
import type { NotificationContextType } from "../contexts/NotificationContext";

// Hook utama
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

// Hook alias untuk useNotify (lebih pendek)
export const useNotify = (): NotificationContextType => {
  return useNotification();
};

// Hook khusus untuk notifications state saja
export const useNotifications = () => {
  const { notifications, removeNotification, clearNotifications } =
    useNotification();

  return {
    notifications,
    removeNotification,
    clearNotifications,
  };
};
