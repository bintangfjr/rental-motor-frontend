import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Switch } from "../../components/ui/Switch";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import Toast from "../../components/ui/Toast";
import { Card } from "../../components/ui/Card";
import { useTheme } from "../../hooks/useTheme";
import api from "../../services/api";

interface WhatsAppSettings {
  api_key: string;
  fonnte_number: string;
  admin_numbers: string;
  reminder_template: string;
  alert_template: string;
}

interface NotificationSettingsState {
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  systemNotifications: boolean;
  rentalReminders: boolean;
  paymentReminders: boolean;
  maintenanceAlerts: boolean;
}

interface TestConnectionResponse {
  success: boolean;
  message: string;
  data?: any;
}

const NotificationSettings: React.FC = () => {
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState<NotificationSettingsState>(
    {
      emailNotifications: true,
      whatsappNotifications: true,
      systemNotifications: true,
      rentalReminders: true,
      paymentReminders: true,
      maintenanceAlerts: true,
    }
  );

  const [settings, setSettings] = useState<WhatsAppSettings>({
    api_key: "",
    fonnte_number: "",
    admin_numbers: "",
    reminder_template:
      "Halo {nama}! Ini adalah pengingat bahwa sewa motor {motor} (Plat: {plat}) akan jatuh tempo pada {jatuh_tempo} ({sisa_waktu}). Harap siapkan pengembalian motor tepat waktu. Terima kasih.",
    alert_template:
      "PERINGATAN: Sewa motor {motor} (Plat: {plat}) oleh {nama} telah lewat jatuh tempo sejak {jatuh_tempo}. Keterlambatan: {keterlambatan}. Segera tindak lanjuti!",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Load settings from backend
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/whatsapp/settings");
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setToast({ message: "Gagal memuat pengaturan", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (key: keyof WhatsAppSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleToggle = (key: keyof NotificationSettingsState) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await api.put("/whatsapp/settings", settings);
      setToast({ message: "Pengaturan berhasil disimpan", type: "success" });
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      setToast({
        message: error.response?.data?.message || "Gagal menyimpan pengaturan",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.api_key || !settings.fonnte_number) {
      setToast({
        message: "API Key dan Nomor Fonnte harus diisi",
        type: "error",
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await api.post<TestConnectionResponse>(
        "/whatsapp/test-connection",
        {
          api_key: settings.api_key,
          fonnte_number: settings.fonnte_number,
        }
      );

      setToast({
        message: response.data.message,
        type: response.data.success ? "success" : "error",
      });
    } catch (error: any) {
      console.error("Test connection failed:", error);
      setToast({
        message: error.response?.data?.message || "Gagal menguji koneksi",
        type: "error",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const notificationGroups = [
    {
      title: "Jenis Notifikasi",
      settings: [
        {
          key: "emailNotifications" as keyof NotificationSettingsState,
          label: "Notifikasi Email",
          description: "Terima pemberitahuan melalui email",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          ),
        },
        {
          key: "whatsappNotifications" as keyof NotificationSettingsState,
          label: "Notifikasi WhatsApp",
          description: "Terima pemberitahuan melalui WhatsApp",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          ),
        },
        {
          key: "systemNotifications" as keyof NotificationSettingsState,
          label: "Notifikasi Sistem",
          description: "Terima pemberitahuan dalam aplikasi",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Pengingat Otomatis",
      settings: [
        {
          key: "rentalReminders" as keyof NotificationSettingsState,
          label: "Pengingat Sewa",
          description: "Pengingat jatuh tempo sewa dan pengembalian",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          key: "paymentReminders" as keyof NotificationSettingsState,
          label: "Pengingat Pembayaran",
          description: "Pengingat untuk pembayaran yang akan jatuh tempo",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          ),
        },
        {
          key: "maintenanceAlerts" as keyof NotificationSettingsState,
          label: "Alert Perawatan",
          description: "Pemberitahuan jadwal perawatan motor",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ),
        },
      ],
    },
  ];

  const availableVariables = [
    { variable: "{nama}", description: "Nama penyewa" },
    { variable: "{motor}", description: "Merk dan model motor" },
    { variable: "{plat}", description: "Plat nomor motor" },
    { variable: "{jatuh_tempo}", description: "Tanggal jatuh tempo" },
    { variable: "{sisa_waktu}", description: "Sisa waktu sewa" },
    { variable: "{keterlambatan}", description: "Durasi keterlambatan" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div
          className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            isDark ? "border-blue-400" : "border-blue-600"
          }`}
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          Pengaturan Notifikasi WhatsApp
        </h1>
        <p
          className={`mt-1 ${isDark ? "text-dark-secondary" : "text-gray-600"}`}
        >
          Kelola konfigurasi WhatsApp dan template pesan
        </p>
      </div>

      {/* WhatsApp Configuration */}
      <Card className="p-6">
        <h2
          className={`text-lg font-semibold mb-4 ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          Konfigurasi WhatsApp
        </h2>
        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-dark-secondary" : "text-gray-700"
              }`}
            >
              API Key Fonnte
            </label>
            <Input
              type="password"
              value={settings.api_key}
              onChange={(e) => handleSettingsChange("api_key", e.target.value)}
              placeholder="Masukkan API Key Fonnte"
              className="w-full"
            />
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              Dapatkan API Key dari dashboard Fonnte
            </p>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-dark-secondary" : "text-gray-700"
              }`}
            >
              Nomor Fonnte
            </label>
            <Input
              value={settings.fonnte_number}
              onChange={(e) =>
                handleSettingsChange("fonnte_number", e.target.value)
              }
              placeholder="Contoh: 6281234567890"
              className="w-full"
            />
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              Nomor WhatsApp yang terdaftar di Fonnte (format: 62...)
            </p>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-dark-secondary" : "text-gray-700"
              }`}
            >
              Nomor Admin (Opsional)
            </label>
            <Textarea
              value={settings.admin_numbers}
              onChange={(e) =>
                handleSettingsChange("admin_numbers", e.target.value)
              }
              placeholder="Masukkan nomor admin untuk notifikasi alert, pisahkan dengan koma"
              rows={3}
              className="w-full"
            />
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              Nomor WhatsApp admin yang akan menerima notifikasi alert (format:
              6281234567890, 6289876543210)
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              onClick={handleTestConnection}
              isLoading={isTesting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
              Test Koneksi
            </Button>
            <Button
              onClick={handleSaveSettings}
              isLoading={isSaving}
              className="flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Simpan Konfigurasi
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <div className="space-y-6">
        {notificationGroups.map((group, groupIndex) => (
          <Card key={groupIndex} className="p-6">
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              {group.title}
            </h2>
            <div className="space-y-4">
              {group.settings.map((setting, settingIndex) => (
                <div
                  key={settingIndex}
                  className={`flex items-center justify-between py-3 ${
                    settingIndex < group.settings.length - 1
                      ? `border-b ${
                          isDark ? "border-dark-border" : "border-gray-200"
                        }`
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        isDark
                          ? "bg-dark-secondary/50 text-dark-primary"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {setting.icon}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          isDark ? "text-dark-primary" : "text-gray-900"
                        }`}
                      >
                        {setting.label}
                      </p>
                      <p
                        className={`text-sm ${
                          isDark ? "text-dark-secondary" : "text-gray-600"
                        }`}
                      >
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[setting.key]}
                    onChange={() => handleToggle(setting.key)}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* WhatsApp Templates */}
      <Card className="p-6">
        <h2
          className={`text-lg font-semibold mb-4 ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          Template Pesan WhatsApp
        </h2>

        {/* Available Variables */}
        <div
          className={`mb-6 p-4 rounded-lg ${
            isDark
              ? "bg-blue-900/20 border border-blue-800"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <h3
            className={`font-medium mb-2 ${
              isDark ? "text-blue-300" : "text-blue-900"
            }`}
          >
            Variabel yang Tersedia:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableVariables.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <code
                  className={`px-2 py-1 text-sm rounded ${
                    isDark
                      ? "bg-blue-900/30 text-blue-300 border border-blue-700"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}
                >
                  {item.variable}
                </code>
                <span
                  className={`text-sm ${
                    isDark ? "text-blue-300" : "text-blue-700"
                  }`}
                >
                  {item.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reminder Template */}
        <div className="space-y-4 mb-6">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-dark-secondary" : "text-gray-700"
              }`}
            >
              Template Pengingat Sewa
            </label>
            <Textarea
              value={settings.reminder_template}
              onChange={(e) =>
                handleSettingsChange("reminder_template", e.target.value)
              }
              rows={6}
              placeholder="Template pesan untuk pengingat sewa"
              className={`w-full font-mono text-sm ${
                isDark ? "bg-dark-secondary border-dark-border" : ""
              }`}
            />
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              Template ini akan dikirim ke penyewa sebagai pengingat
            </p>
          </div>
        </div>

        {/* Alert Template */}
        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-dark-secondary" : "text-gray-700"
              }`}
            >
              Template Alert Admin
            </label>
            <Textarea
              value={settings.alert_template}
              onChange={(e) =>
                handleSettingsChange("alert_template", e.target.value)
              }
              rows={6}
              placeholder="Template pesan untuk alert admin"
              className={`w-full font-mono text-sm ${
                isDark ? "bg-dark-secondary border-dark-border" : ""
              }`}
            />
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              Template ini akan dikirim ke admin ketika sewa lewat tempo
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveSettings}
            isLoading={isSaving}
            className="flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Simpan Template
          </Button>
        </div>
      </Card>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  );
};

export default NotificationSettings;
