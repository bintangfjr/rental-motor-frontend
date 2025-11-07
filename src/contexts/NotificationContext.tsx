// notification-context.ts
import { createContext } from "react";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationHelpers {
  info: (
    title: string,
    message: string,
    options?: Partial<Omit<Notification, "id" | "type" | "title" | "message">>,
  ) => void;
  success: (
    title: string,
    message: string,
    options?: Partial<Omit<Notification, "id" | "type" | "title" | "message">>,
  ) => void;
  warning: (
    title: string,
    message: string,
    options?: Partial<Omit<Notification, "id" | "type" | "title" | "message">>,
  ) => void;
  error: (
    title: string,
    message: string,
    options?: Partial<Omit<Notification, "id" | "type" | "title" | "message">>,
  ) => void;
}

export interface NotificationContextType extends NotificationHelpers {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);
