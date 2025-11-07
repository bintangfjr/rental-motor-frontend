import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motorService } from "../../services/motorService";
import { MotorWithIopgps, VehicleStatus } from "../../types/motor";
import { Button } from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import Toast from "../../components/ui/Toast";
import {
  formatCurrency,
  formatDate,
  formatDistance,
  formatSpeed,
  formatDuration,
} from "../../utils/formatters";
import { useTheme } from "../../hooks/useTheme";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import {
  useMotorWebSocket,
  MotorLocationUpdate,
  MotorStatusUpdate,
  MotorServiceUpdate,
} from "../../hooks/useMotorWebSocket";

// Helper component untuk menampilkan info row dengan dark theme support
const InfoRow: React.FC<{
  label: string;
  value: React.ReactNode;
  isDark: boolean;
}> = ({ label, value, isDark }) => (
  <div className="flex justify-between items-center py-1">
    <span
      className={`text-sm ${isDark ? "text-dark-secondary" : "text-gray-600"}`}
    >
      {label}:
    </span>
    <span
      className={`font-medium text-sm text-right ${
        isDark ? "text-dark-primary" : "text-gray-900"
      }`}
    >
      {value}
    </span>
  </div>
);

// Komponen Status WebSocket untuk Detail
const WebSocketStatusDetail: React.FC = () => {
  const { isConnected, connectionStatus } = useWebSocketContext();

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case "connected":
        return { color: "bg-green-500", text: "Real-time Active" };
      case "disconnected":
        return { color: "bg-gray-500", text: "Real-time Offline" };
      case "connecting":
        return { color: "bg-yellow-500", text: "Connecting..." };
      case "error":
        return { color: "bg-red-500", text: "Connection Error" };
      default:
        return { color: "bg-gray-500", text: "Unknown" };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
      <span className={`text-xs ${statusInfo.color.replace("bg-", "text-")}`}>
        {statusInfo.text}
      </span>
    </div>
  );
};

const MotorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const motorId = id ? parseInt(id) : 0;
  const [motor, setMotor] = useState<MotorWithIopgps | null>(null);
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const { isDark } = useTheme();

  // WebSocket Context
  const { isConnected } = useWebSocketContext();

  // Load initial motor data
  const loadMotorData = async () => {
    if (!motorId) return;

    try {
      setIsLoading(true);

      const motorData = await motorService.getById(motorId);

      // Optional: Get vehicle status (boleh gagal)
      let statusData = null;
      try {
        statusData = await motorService.getVehicleStatus(motorId);
      } catch (statusError) {
        console.warn("Could not load vehicle status:", statusError);
      }

      setMotor(motorData);
      setVehicleStatus(statusData);
    } catch (error: unknown) {
      console.error("Error loading motor data:", error);
      setToast({
        message: "Gagal memuat data motor",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMotorData();
  }, [motorId]);

  // ========== WEBSOCKET REAL-TIME UPDATES ==========

  // Subscribe to motor-specific events
  const { isConnected: isMotorConnected } = useMotorWebSocket({
    motorId,
    onLocationUpdate: (data: MotorLocationUpdate) => {
      console.log("Real-time location update:", data);

      // Update motor dengan data lokasi real-time
      setMotor((prev) => {
        if (!prev) return prev;

        const updatedMotor = {
          ...prev,
          lat: data.lat,
          lng: data.lng,
          last_update: data.last_update,
          gps_status: data.gps_status,
          last_known_address: data.address,
        };

        // Update iopgps_data jika ada
        if (prev.iopgps_data) {
          updatedMotor.iopgps_data = {
            ...prev.iopgps_data,
            location: {
              lat: data.lat,
              lng: data.lng,
              address: data.address || "Lokasi tidak diketahui",
              speed: data.speed || 0,
              direction: data.direction || 0,
              gps_time: data.last_update,
            },
            status: data.gps_status === "Online" ? "online" : "offline",
            online: data.gps_status === "Online",
            last_update: data.last_update,
          };
        }

        return updatedMotor;
      });

      // Show notification untuk lokasi update
      if (data.gps_status === "Online") {
        setToast({
          message: `Lokasi ${data.plat_nomor} diperbarui`,
          type: "success",
        });
      }
    },
    onStatusUpdate: (data: MotorStatusUpdate) => {
      console.log("Real-time status update:", data);

      // Update status motor
      setMotor((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          status: data.newStatus,
        };
      });

      // Show notification untuk status change
      setToast({
        message: `Status ${data.plat_nomor} berubah menjadi ${data.newStatus}`,
        type: "info",
      });
    },
    onServiceUpdate: (data: MotorServiceUpdate) => {
      console.log("Real-time service update:", data);

      // Update service information
      setMotor((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          status:
            data.serviceStatus === "completed"
              ? "tersedia"
              : data.serviceStatus === "in_progress"
              ? "perbaikan"
              : data.serviceStatus === "pending"
              ? "pending_perbaikan"
              : prev.status,
          service_notes: data.notes || prev.service_notes,
          service_technician: data.technician || prev.service_technician,
        };
      });

      // Show notification untuk service update
      setToast({
        message: `Service ${data.plat_nomor}: ${data.serviceStatus}`,
        type: "info",
      });
    },
    onMileageUpdate: (data: any) => {
      console.log("Real-time mileage update:", data);

      // Update total mileage
      setMotor((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          total_mileage: data.total_mileage,
          last_mileage_sync: new Date().toISOString(),
        };
      });

      // Show notification untuk mileage update
      setToast({
        message: `Mileage ${data.plat_nomor} diperbarui: ${data.distance_km} km`,
        type: "success",
      });
    },
    onSyncComplete: (data: any) => {
      console.log("Sync complete:", data);

      if (data.success) {
        setToast({
          message: data.message || "Sinkronisasi berhasil",
          type: "success",
        });

        // Reload data setelah sync berhasil
        setTimeout(() => {
          loadMotorData();
        }, 1000);
      } else {
        setToast({
          message: data.message || "Sinkronisasi gagal",
          type: "error",
        });
      }

      setIsSyncing(false);
    },
  });

  // Handle motor deletion from WebSocket
  useEffect(() => {
    if (!isConnected || !motorId) return;

    const handleMotorDeleted = (data: {
      motorId: number;
      plat_nomor: string;
      timestamp: string;
    }) => {
      if (data.motorId === motorId) {
        console.log("Motor deleted via WebSocket:", data.motorId);
        setToast({
          message: `Motor ${data.plat_nomor} telah dihapus`,
          type: "error",
        });

        // Set motor ke null untuk menunjukkan motor sudah dihapus
        setTimeout(() => {
          setMotor(null);
        }, 2000);
      }
    };

    const unsubscribeDeleted = window.websocketService?.on(
      "motor:deleted",
      handleMotorDeleted
    );

    return () => {
      unsubscribeDeleted?.();
    };
  }, [isConnected, motorId]);

  // ========== EVENT HANDLERS ==========

  const handleSyncLocation = async () => {
    if (!motorId) return;

    try {
      setIsSyncing(true);
      await motorService.syncLocation(motorId);
      // WebSocket akan meng-handle update real-time melalui event motor:gps:sync:complete
      setToast({
        message: "Memulai sinkronisasi lokasi...",
        type: "info",
      });
    } catch (error: unknown) {
      console.error("Error syncing location:", error);
      setToast({
        message: "Gagal memulai sinkronisasi lokasi",
        type: "error",
      });
      setIsSyncing(false);
    }
  };

  const handleSyncMileage = async () => {
    if (!motorId) return;

    try {
      setIsSyncing(true);
      await motorService.syncMileage(motorId);
      // WebSocket akan meng-handle update real-time melalui event motor:mileage:sync:complete
      setToast({
        message: "Memulai sinkronisasi mileage...",
        type: "info",
      });
    } catch (error: unknown) {
      console.error("Error syncing mileage:", error);
      setToast({
        message: "Gagal memulai sinkronisasi mileage",
        type: "error",
      });
      setIsSyncing(false);
    }
  };

  const handleResetServiceMileage = async () => {
    if (!motor || !motorId) return;

    if (
      !window.confirm(
        "Reset jarak tempuh service ke 0? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      return;
    }

    try {
      setIsSyncing(true);
      // Update motor status ke 'tersedia' dan reset service mileage
      await motorService.update(motorId, {
        ...motor,
        status: "tersedia",
      });

      // WebSocket akan meng-handle update real-time melalui event motor:status:update
      setToast({
        message: "Mengupdate status motor...",
        type: "info",
      });
    } catch (error: unknown) {
      console.error("Error resetting service mileage:", error);
      setToast({
        message: "Gagal reset jarak tempuh service",
        type: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getGpsStatusBadge = (status: string) => {
    const statusConfig = {
      Online: { variant: "success" as const, label: "Online" },
      Offline: { variant: "warning" as const, label: "Offline" },
      NoImei: { variant: "secondary" as const, label: "No IMEI" },
      Error: { variant: "danger" as const, label: "Error" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      label: status,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      tersedia: <Badge variant="success">Tersedia</Badge>,
      disewa: <Badge variant="warning">Disewa</Badge>,
      perbaikan: <Badge variant="danger">Perbaikan</Badge>,
      pending_perbaikan: <Badge variant="warning">Pending Service</Badge>,
    };

    return (
      statusMap[status as keyof typeof statusMap] || (
        <Badge variant="secondary">{status}</Badge>
      )
    );
  };

  // Calculate service mileage progress
  const calculateServiceProgress = () => {
    if (!motor?.total_mileage) return { percentage: 0, remaining: 1000 };

    const serviceInterval = 1000; // 1000 km service interval
    const currentMileage = motor.total_mileage;
    const percentage = Math.min((currentMileage / serviceInterval) * 100, 100);
    const remaining = Math.max(serviceInterval - currentMileage, 0);

    return { percentage, remaining };
  };

  if (isLoading) return <Loading />;

  if (!motor) {
    return (
      <div
        className={`text-center py-8 ${
          isDark ? "text-dark-primary" : "text-gray-900"
        }`}
      >
        <p>Motor tidak ditemukan</p>
        <Link to="/motors">
          <Button className="mt-4">Kembali ke Daftar Motor</Button>
        </Link>
      </div>
    );
  }

  const serviceProgress = calculateServiceProgress();

  return (
    <div className="space-y-6">
      {/* Header dengan WebSocket Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/motors">
            <Button variant="outline">← Kembali</Button>
          </Link>
          <div>
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              {motor.plat_nomor} - {motor.merk} {motor.model}
            </h1>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Detail informasi dan tracking motor
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <WebSocketStatusDetail />
          <div className="flex space-x-2">
            <Link to={`/motors/${motor.id}/edit`}>
              <Button>Edit Motor</Button>
            </Link>
            {motor.imei && (
              <Button
                onClick={handleSyncLocation}
                isLoading={isSyncing}
                variant="outline"
              >
                Sync Lokasi
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri */}
        <div className="space-y-6">
          {/* Informasi Motor */}
          <Card className={isDark ? "bg-dark-card border-dark-border" : ""}>
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Informasi Motor
            </h2>
            <div className="space-y-3">
              <InfoRow
                label="Plat Nomor"
                value={motor.plat_nomor}
                isDark={isDark}
              />
              <InfoRow label="Merk" value={motor.merk} isDark={isDark} />
              <InfoRow label="Model" value={motor.model} isDark={isDark} />
              <InfoRow
                label="Tahun"
                value={motor.tahun.toString()}
                isDark={isDark}
              />
              <InfoRow
                label="Harga Sewa"
                value={formatCurrency(motor.harga)}
                isDark={isDark}
              />
              <InfoRow
                label="Status"
                value={getStatusBadge(motor.status)}
                isDark={isDark}
              />
              {isMotorConnected && (
                <div
                  className={`text-xs mt-2 p-2 rounded ${
                    isDark
                      ? "bg-green-900/20 text-green-400"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  🔄 Real-time updates aktif
                </div>
              )}
            </div>
          </Card>

          {/* Informasi Teknis */}
          <Card className={isDark ? "bg-dark-card border-dark-border" : ""}>
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Informasi Teknis
            </h2>
            <div className="space-y-3">
              <InfoRow
                label="Nomor GSM"
                value={motor.no_gsm || "-"}
                isDark={isDark}
              />
              <InfoRow label="IMEI" value={motor.imei || "-"} isDark={isDark} />
              <InfoRow
                label="Device ID"
                value={motor.device_id || "-"}
                isDark={isDark}
              />
              <InfoRow
                label="Status GPS"
                value={getGpsStatusBadge(motor.gps_status)}
                isDark={isDark}
              />
              {motor.last_update && (
                <InfoRow
                  label="Update Terakhir"
                  value={
                    <div className="flex items-center space-x-1">
                      <span>{formatDate(motor.last_update)}</span>
                      {isMotorConnected && motor.gps_status === "Online" && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  }
                  isDark={isDark}
                />
              )}
            </div>
          </Card>

          {/* Service Information */}
          <Card className={isDark ? "bg-dark-card border-dark-border" : ""}>
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Informasi Service
            </h2>
            <div className="space-y-4">
              <div>
                <div
                  className={`flex justify-between text-sm mb-1 ${
                    isDark ? "text-dark-secondary" : "text-gray-600"
                  }`}
                >
                  <span>Progress Service</span>
                  <span>{serviceProgress.percentage.toFixed(1)}%</span>
                </div>
                <div
                  className={`w-full rounded-full h-2 ${
                    isDark ? "bg-dark-accent" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      serviceProgress.percentage >= 80
                        ? "bg-red-500"
                        : serviceProgress.percentage >= 60
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${serviceProgress.percentage}%` }}
                  ></div>
                </div>
                <div
                  className={`flex justify-between text-xs mt-1 ${
                    isDark ? "text-dark-muted" : "text-gray-500"
                  }`}
                >
                  <span>0 km</span>
                  <span>1000 km</span>
                </div>
              </div>

              <div className="space-y-2">
                <InfoRow
                  label="Status Service"
                  value={
                    <Badge
                      variant={
                        motor.status === "perbaikan"
                          ? "danger"
                          : serviceProgress.percentage >= 80
                          ? "warning"
                          : "success"
                      }
                    >
                      {motor.status === "perbaikan"
                        ? "Dalam Service"
                        : serviceProgress.percentage >= 80
                        ? "Perlu Service Segera"
                        : "Normal"}
                    </Badge>
                  }
                  isDark={isDark}
                />
                <InfoRow
                  label="Jarak Tempuh Total"
                  value={formatDistance(motor.total_mileage || 0)}
                  isDark={isDark}
                />
                <InfoRow
                  label="Sisa Menuju Service"
                  value={formatDistance(serviceProgress.remaining)}
                  isDark={isDark}
                />
                {motor.last_mileage_sync && (
                  <InfoRow
                    label="Terakhir Sync Mileage"
                    value={formatDate(motor.last_mileage_sync)}
                    isDark={isDark}
                  />
                )}
              </div>

              {motor.status === "perbaikan" && (
                <div
                  className={`rounded-lg p-3 ${
                    isDark
                      ? "bg-yellow-900/20 border-yellow-800"
                      : "bg-yellow-50 border-yellow-200"
                  } border`}
                >
                  <h4
                    className={`font-medium text-sm ${
                      isDark ? "text-yellow-300" : "text-yellow-800"
                    }`}
                  >
                    Motor Sedang Dalam Service
                  </h4>
                  <p
                    className={`text-xs mt-1 ${
                      isDark ? "text-yellow-400" : "text-yellow-700"
                    }`}
                  >
                    Setelah service selesai, klik tombol di bawah untuk
                    mengembalikan status motor.
                  </p>
                  <Button
                    onClick={handleResetServiceMileage}
                    isLoading={isSyncing}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    Selesai Service & Reset
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-6">
          {/* GPS & Tracking */}
          <Card className={isDark ? "bg-dark-card border-dark-border" : ""}>
            <div className="flex justify-between items-center mb-4">
              <h2
                className={`text-lg font-semibold ${
                  isDark ? "text-dark-primary" : "text-gray-900"
                }`}
              >
                GPS & Tracking
                {isMotorConnected && motor.gps_status === "Online" && (
                  <span className="ml-2 text-xs text-green-500 font-normal">
                    ● Live
                  </span>
                )}
              </h2>
              {motor.imei && (
                <Button
                  onClick={handleSyncLocation}
                  isLoading={isSyncing}
                  variant="outline"
                  size="sm"
                >
                  Refresh
                </Button>
              )}
            </div>

            {!motor.imei ? (
              <div
                className={`text-center py-6 ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
              >
                <p>Motor ini tidak memiliki IMEI yang terdaftar</p>
                <p className="text-sm mt-2">
                  Tambahkan IMEI yang valid untuk mengaktifkan fitur tracking
                </p>
                <Link to={`/motors/${motor.id}/edit`}>
                  <Button size="sm" className="mt-3">
                    Tambahkan IMEI
                  </Button>
                </Link>
              </div>
            ) : motor.gps_status === "NoImei" ? (
              <div
                className={`text-center py-6 ${
                  isDark ? "text-yellow-400" : "text-yellow-600"
                }`}
              >
                <p>IMEI tidak valid atau tidak terdaftar di IOPGPS</p>
                <p className="text-sm mt-2">
                  Pastikan IMEI sudah terdaftar di akun IOPGPS Anda
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Lokasi Terakhir */}
                <div className="space-y-3">
                  <h3
                    className={`font-medium ${
                      isDark ? "text-dark-secondary" : "text-gray-700"
                    }`}
                  >
                    Lokasi Terakhir
                  </h3>
                  {motor.last_known_address ? (
                    <div className="space-y-2">
                      <InfoRow
                        label="Alamat"
                        value={motor.last_known_address}
                        isDark={isDark}
                      />
                      {motor.lat && motor.lng && (
                        <InfoRow
                          label="Koordinat"
                          value={`${motor.lat.toFixed(6)}, ${motor.lng.toFixed(
                            6
                          )}`}
                          isDark={isDark}
                        />
                      )}
                    </div>
                  ) : (
                    <p
                      className={`text-sm ${
                        isDark ? "text-dark-muted" : "text-gray-500"
                      }`}
                    >
                      Tidak ada data lokasi
                    </p>
                  )}
                </div>

                {/* Real-time Location */}
                {motor.lat && motor.lng && (
                  <div
                    className={`space-y-3 pt-3 border-t ${
                      isDark ? "border-dark-border" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`font-medium ${
                          isDark ? "text-dark-secondary" : "text-gray-700"
                        }`}
                      >
                        Lokasi Real-time
                      </h3>
                      {isMotorConnected && motor.gps_status === "Online" && (
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-green-500">Live</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <InfoRow
                        label="Alamat"
                        value={
                          motor.last_known_address || "Alamat tidak diketahui"
                        }
                        isDark={isDark}
                      />
                      <InfoRow
                        label="Koordinat"
                        value={`${motor.lat.toFixed(6)}, ${motor.lng.toFixed(
                          6
                        )}`}
                        isDark={isDark}
                      />
                      <InfoRow
                        label="Status GPS"
                        value={getGpsStatusBadge(motor.gps_status)}
                        isDark={isDark}
                      />
                      <InfoRow
                        label="Update Terakhir"
                        value={
                          <div className="flex items-center space-x-1">
                            <span>
                              {motor.last_update
                                ? formatDate(motor.last_update)
                                : "Tidak tersedia"}
                            </span>
                            {isMotorConnected &&
                              motor.gps_status === "Online" && (
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              )}
                          </div>
                        }
                        isDark={isDark}
                      />
                    </div>
                  </div>
                )}

                {/* Vehicle Status */}
                {vehicleStatus && (
                  <div
                    className={`space-y-3 pt-3 border-t ${
                      isDark ? "border-dark-border" : "border-gray-200"
                    }`}
                  >
                    <h3
                      className={`font-medium ${
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      }`}
                    >
                      Status Kendaraan
                    </h3>
                    <div className="space-y-2">
                      <InfoRow
                        label="Status"
                        value={vehicleStatus.status}
                        isDark={isDark}
                      />
                      <InfoRow
                        label="Online"
                        value={
                          <div className="flex items-center space-x-1">
                            <Badge
                              variant={
                                vehicleStatus.online === "online"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {vehicleStatus.online}
                            </Badge>
                            {isMotorConnected &&
                              vehicleStatus.online === "online" && (
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              )}
                          </div>
                        }
                        isDark={isDark}
                      />
                      <InfoRow
                        label="ACC"
                        value={
                          <Badge
                            variant={
                              vehicleStatus.acc === "on"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {vehicleStatus.acc}
                          </Badge>
                        }
                        isDark={isDark}
                      />
                      <InfoRow
                        label="Update Terakhir"
                        value={formatDate(
                          new Date(vehicleStatus.gpsTime * 1000)
                        )}
                        isDark={isDark}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className={isDark ? "bg-dark-card border-dark-border" : ""}>
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Quick Actions
            </h2>
            <div className="flex flex-col space-y-2">
              {motor.imei && (
                <>
                  <Button
                    onClick={handleSyncLocation}
                    isLoading={isSyncing}
                    variant="outline"
                    size="sm"
                  >
                    Sync Lokasi Sekarang
                  </Button>
                  <Button
                    onClick={handleSyncMileage}
                    isLoading={isSyncing}
                    variant="outline"
                    size="sm"
                  >
                    Sync Mileage
                  </Button>
                </>
              )}
              <Link to={`/motors/${motor.id}/edit`}>
                <Button variant="outline" size="sm" className="w-full">
                  Edit Motor
                </Button>
              </Link>
            </div>
          </Card>

          {/* Mileage History */}
          {motor.mileage_history && motor.mileage_history.length > 0 && (
            <Card className={isDark ? "bg-dark-card border-dark-border" : ""}>
              <h2
                className={`text-lg font-semibold mb-4 ${
                  isDark ? "text-dark-primary" : "text-gray-900"
                }`}
              >
                Riwayat Mileage 7 Hari Terakhir
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {motor.mileage_history.slice(0, 7).map((day) => (
                  <div
                    key={day.id}
                    className={`flex justify-between items-center py-2 border-b ${
                      isDark ? "border-dark-border" : "border-gray-100"
                    } last:border-b-0`}
                  >
                    <div>
                      <div
                        className={`text-sm font-medium ${
                          isDark ? "text-dark-primary" : "text-gray-900"
                        }`}
                      >
                        {formatDate(day.period_date)}
                      </div>
                      <div
                        className={`text-xs ${
                          isDark ? "text-dark-muted" : "text-gray-500"
                        }`}
                      >
                        {formatDuration(day.run_time_seconds)} operasi
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${
                          isDark ? "text-dark-primary" : "text-gray-900"
                        }`}
                      >
                        {formatDistance(day.distance_km)}
                      </div>
                      <div
                        className={`text-xs ${
                          isDark ? "text-dark-muted" : "text-gray-500"
                        }`}
                      >
                        {formatSpeed(day.average_speed_kmh)} rata-rata
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

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

export default MotorDetail;
