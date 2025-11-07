/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_NODE_ENV: "development" | "production" | "test";
  readonly VITE_ENABLE_WHATSAPP_NOTIFICATIONS?: "true" | "false";
  readonly VITE_ENABLE_GPS_TRACKING?: "true" | "false";
  readonly VITE_ENABLE_REPORTS?: "true" | "false";
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_DATE_FORMAT?: string;
  readonly VITE_TIME_FORMAT?: string;
  readonly VITE_DATETIME_FORMAT?: string;
  readonly VITE_DEFAULT_PAGE_SIZE?: string;
  readonly VITE_MAX_PAGE_SIZE?: string;
  readonly VITE_TOAST_TIMEOUT?: string;
  readonly VITE_AUTO_LOGOUT_MINUTES?: string;
  readonly VITE_GENERATE_SOURCEMAP?: "true" | "false";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  websocketService?: {
    on: <T extends string>(
      event: T,
      callback: (data: any) => void
    ) => () => void;
    emit: (event: string, data?: any) => void;
    subscribeToMotor: (motorId: number) => void;
    unsubscribeFromMotor: (motorId: number) => void;
    subscribeToMotorTracking: () => void;
    unsubscribeFromMotorTracking: () => void;
    ping: () => void;
    healthCheck: () => void;
    updateAuthToken: (token: string) => void;
    getConnectionStatus: () => boolean;
    connect: () => void;
    disconnect: () => void;
  };
}
