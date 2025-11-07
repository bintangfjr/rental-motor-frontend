import api from "./api";

interface WhatsAppResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

interface TestConnectionData {
  api_key?: string;
  fonnte_number?: string;
}

interface UpdateSettingsData {
  api_key?: string;
  fonnte_number?: string;
  admin_numbers?: string;
  reminder_template?: string;
  alert_template?: string;
  auto_notifications?: boolean;
}

export const whatsappService = {
  /**
   * Mengirim notifikasi pengingat untuk sewa tertentu
   */
  async sendReminder(sewaId: number): Promise<WhatsAppResponse> {
    try {
      const response = await api.post(`/whatsapp/reminder/${sewaId}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengirim pengingat";
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  /**
   * Mengirim notifikasi alert untuk sewa tertentu
   */
  async sendAlert(sewaId: number): Promise<WhatsAppResponse> {
    try {
      const response = await api.post(`/whatsapp/alert/${sewaId}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengirim alert";
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  /**
   * Mendapatkan data notifikasi dan sewa aktif
   */
  async getNotifications(): Promise<WhatsAppResponse> {
    try {
      const response = await api.get("/whatsapp/notifications");
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengambil data notifikasi";
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  /**
   * Mendapatkan pengaturan WhatsApp
   */
  async getSettings(): Promise<WhatsAppResponse> {
    try {
      const response = await api.get("/whatsapp/settings");
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengambil pengaturan";
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  /**
   * Memperbarui pengaturan WhatsApp
   */
  async updateSettings(
    settings: UpdateSettingsData,
  ): Promise<WhatsAppResponse> {
    try {
      const response = await api.put("/whatsapp/settings", settings);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memperbarui pengaturan";
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  /**
   * Menguji koneksi dengan API Fonnte
   */
  async testConnection(data: TestConnectionData): Promise<WhatsAppResponse> {
    try {
      const response = await api.post("/whatsapp/test-connection", data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menguji koneksi";
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  /**
   * Memicu notifikasi otomatis secara manual
   */
  async triggerAutomaticNotifications(): Promise<WhatsAppResponse> {
    try {
      const response = await api.post(
        "/whatsapp/trigger-automatic-notifications",
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal memicu notifikasi otomatis";
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  /**
   * Mendapatkan status notifikasi otomatis
   */
  async getAutomaticNotificationsStatus(): Promise<WhatsAppResponse> {
    try {
      const response = await api.get(
        "/whatsapp/automatic-notifications-status",
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengambil status notifikasi otomatis";
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  /**
   * Mengaktifkan/menonaktifkan notifikasi otomatis
   */
  async toggleAutomaticNotifications(
    enabled: boolean,
  ): Promise<WhatsAppResponse> {
    try {
      const settings = { auto_notifications: enabled };
      const response = await api.put("/whatsapp/settings", settings);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengubah pengaturan notifikasi otomatis";
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },
};

export default whatsappService;
