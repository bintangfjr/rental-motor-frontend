import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Switch } from "../../components/ui/Switch";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import Toast from "../../components/ui/Toast";
import { Card } from "../../components/ui/Card";
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
        },
        {
          key: "whatsappNotifications" as keyof NotificationSettingsState,
          label: "Notifikasi WhatsApp",
          description: "Terima pemberitahuan melalui WhatsApp",
        },
        {
          key: "systemNotifications" as keyof NotificationSettingsState,
          label: "Notifikasi Sistem",
          description: "Terima pemberitahuan dalam aplikasi",
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
        },
        {
          key: "paymentReminders" as keyof NotificationSettingsState,
          label: "Pengingat Pembayaran",
          description: "Pengingat untuk pembayaran yang akan jatuh tempo",
        },
        {
          key: "maintenanceAlerts" as keyof NotificationSettingsState,
          label: "Alert Perawatan",
          description: "Pemberitahuan jadwal perawatan motor",
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Pengaturan Notifikasi WhatsApp
        </h1>
        <p className="text-gray-600">
          Kelola konfigurasi WhatsApp dan template pesan
        </p>
      </div>

      {/* WhatsApp Configuration */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Konfigurasi WhatsApp</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key Fonnte
            </label>
            <Input
              type="password"
              value={settings.api_key}
              onChange={(e) => handleSettingsChange("api_key", e.target.value)}
              placeholder="Masukkan API Key Fonnte"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Dapatkan API Key dari dashboard Fonnte
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <p className="text-sm text-gray-500 mt-1">
              Nomor WhatsApp yang terdaftar di Fonnte (format: 62...)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <p className="text-sm text-gray-500 mt-1">
              Nomor WhatsApp admin yang akan menerima notifikasi alert (format:
              6281234567890, 6289876543210)
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleTestConnection}
              isLoading={isTesting}
              variant="outline"
            >
              Test Koneksi
            </Button>
            <Button onClick={handleSaveSettings} isLoading={isSaving}>
              Simpan Konfigurasi
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <div className="space-y-6">
        {notificationGroups.map((group, groupIndex) => (
          <Card key={groupIndex} className="p-6">
            <h2 className="text-lg font-semibold mb-4">{group.title}</h2>
            <div className="space-y-4">
              {group.settings.map((setting, settingIndex) => (
                <div
                  key={settingIndex}
                  className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{setting.label}</p>
                    <p className="text-sm text-gray-600">
                      {setting.description}
                    </p>
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
        <h2 className="text-lg font-semibold mb-4">Template Pesan WhatsApp</h2>

        {/* Available Variables */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">
            Variabel yang Tersedia:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableVariables.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <code className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {item.variable}
                </code>
                <span className="text-sm text-blue-700">
                  {item.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reminder Template */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Pengingat Sewa
            </label>
            <Textarea
              value={settings.reminder_template}
              onChange={(e) =>
                handleSettingsChange("reminder_template", e.target.value)
              }
              rows={6}
              placeholder="Template pesan untuk pengingat sewa"
              className="w-full font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-1">
              Template ini akan dikirim ke penyewa sebagai pengingat
            </p>
          </div>
        </div>

        {/* Alert Template */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Alert Admin
            </label>
            <Textarea
              value={settings.alert_template}
              onChange={(e) =>
                handleSettingsChange("alert_template", e.target.value)
              }
              rows={6}
              placeholder="Template pesan untuk alert admin"
              className="w-full font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-1">
              Template ini akan dikirim ke admin ketika sewa lewat tempo
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveSettings} isLoading={isSaving}>
            Simpan Template
          </Button>
        </div>
      </Card>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default NotificationSettings;
