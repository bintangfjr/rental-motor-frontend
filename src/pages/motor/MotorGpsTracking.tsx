// src/pages/motor/MotorGpsTracking.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motorService } from "../../services/motorService";
import { Motor } from "../../types/motor";
import { Button } from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import Toast from "../../components/ui/Toast";
import { formatDate, formatDistance } from "../../utils/formatters";
import { useTheme } from "../../hooks/useTheme";
import { useWebSocketContext } from "../../contexts/WebSocketContext"; // <-- Tambahkan ini
import { MotorLocationUpdate } from "../../hooks/useMotorWebSocket"; // <-- Tambahkan ini

// Komponen Status WebSocket untuk GPS Tracking
const GpsWebSocketStatus: React.FC = () => {
  const { isConnected, connectionStatus } = useWebSocketContext();

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          color: "bg-green-500",
          text: "Real-time GPS Active",
          bgColor: "bg-green-100 text-green-800 border-green-200",
        };
      case "disconnected":
        return {
          color: "bg-gray-500",
          text: "GPS Updates Offline",
          bgColor: "bg-gray-100 text-gray-800 border-gray-200",
        };
      case "connecting":
        return {
          color: "bg-yellow-500",
          text: "Connecting GPS...",
          bgColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "error":
        return {
          color: "bg-red-500",
          text: "GPS Connection Error",
          bgColor: "bg-red-100 text-red-800 border-red-200",
        };
      default:
        return {
          color: "bg-gray-500",
          text: "Unknown",
          bgColor: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm ${statusInfo.bgColor}`}
    >
      <div
        className={`w-2 h-2 rounded-full ${statusInfo.color} animate-pulse`}
      />
      <span className="text-xs font-medium">{statusInfo.text}</span>
    </div>
  );
};

const MotorGpsTracking: React.FC = () => {
  const [motors, setMotors] = useState<Motor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const { isDark } = useTheme();

  // WebSocket Context
  const { isConnected } = useWebSocketContext();

  useEffect(() => {
    loadMotors();
  }, []);

  const loadMotors = async () => {
    try {
      setIsLoading(true);
      const motorsData = await motorService.getAll();
      setMotors(motorsData);
    } catch (error: unknown) {
      console.error("Error loading motors:", error);
      setToast({
        message: "Gagal memuat data motor",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ========== WEBSOCKET REAL-TIME GPS UPDATES ==========

  useEffect(() => {
    if (!isConnected) return;

    // Handle real-time location updates
    const handleLocationUpdate = (data: MotorLocationUpdate) => {
      console.log("Real-time GPS update received:", data);

      setMotors((prev) =>
        prev.map((motor) =>
          motor.id === data.motorId
            ? {
                ...motor,
                lat: data.lat,
                lng: data.lng,
                last_update: data.last_update,
                gps_status: data.gps_status,
                last_known_address: data.address,
                // Update speed and direction jika tersedia
                ...(data.speed && { speed: data.speed }),
                ...(data.direction && { direction: data.direction }),
              }
            : motor
        )
      );

      // Show notification untuk update yang signifikan
      if (data.speed && data.speed > 0) {
        setToast({
          message: `${data.plat_nomor} bergerak - ${data.speed} km/h`,
          type: "info",
        });
      }
    };

    // Handle GPS sync completion
    const handleGpsSyncComplete = (data: {
      motorId: number;
      success: boolean;
      message?: string;
      timestamp: string;
    }) => {
      if (data.success) {
        setToast({
          message: `GPS sync berhasil untuk motor ID ${data.motorId}`,
          type: "success",
        });

        // Refresh data motor yang di-sync
        const updatedMotor = motors.find((m) => m.id === data.motorId);
        if (updatedMotor) {
          loadMotors(); // Reload untuk data terbaru
        }
      } else {
        setToast({
          message: `GPS sync gagal: ${data.message}`,
          type: "error",
        });
      }
    };

    // Handle status changes yang mungkin mempengaruhi GPS
    const handleStatusUpdate = (data: any) => {
      setMotors((prev) =>
        prev.map((motor) =>
          motor.id === data.motorId
            ? { ...motor, status: data.newStatus }
            : motor
        )
      );
    };

    // Subscribe to WebSocket events
    const unsubscribeLocation = window.websocketService?.on(
      "motor:location:update",
      handleLocationUpdate
    );
    const unsubscribeTracking = window.websocketService?.on(
      "motor:tracking:update",
      handleLocationUpdate
    );
    const unsubscribeGpsSync = window.websocketService?.on(
      "motor:gps:sync:complete",
      handleGpsSyncComplete
    );
    const unsubscribeStatus = window.websocketService?.on(
      "motor:status:update",
      handleStatusUpdate
    );

    // Subscribe to motor tracking untuk semua motor
    window.websocketService?.subscribeToMotorTracking();

    return () => {
      unsubscribeLocation?.();
      unsubscribeTracking?.();
      unsubscribeGpsSync?.();
      unsubscribeStatus?.();

      // Unsubscribe dari tracking ketika component unmount
      window.websocketService?.unsubscribeFromMotorTracking();
    };
  }, [isConnected, motors]);

  // Auto refresh stats setiap 30 detik jika WebSocket connected
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      // Refresh data untuk memastikan konsistensi
      loadMotors();
    }, 30000); // 30 detik

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleSyncAllLocations = async () => {
    try {
      setIsSyncing(true);
      const motorsWithImei = motors.filter((motor) => motor.imei);

      // Gunakan Promise.all untuk parallel processing
      const syncPromises = motorsWithImei.map((motor) =>
        motorService.syncLocation(motor.id).catch((error) => {
          console.warn(`Gagal sync motor ${motor.plat_nomor}:`, error);
          return null;
        })
      );

      await Promise.all(syncPromises);

      // WebSocket akan handle real-time updates, tapi kita refresh untuk memastikan
      await loadMotors();

      setToast({
        message: "Lokasi semua motor berhasil disinkronisasi",
        type: "success",
      });
    } catch (error: unknown) {
      console.error("Error syncing locations:", error);
      setToast({
        message: "Gagal sinkronisasi lokasi",
        type: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Optimized sync untuk motor individual
  const handleSingleSync = async (motor: Motor) => {
    try {
      await motorService.syncLocation(motor.id);
      // WebSocket akan meng-handle update real-time
      // Tidak perlu loadMotors() karena WebSocket akan update otomatis
      setToast({
        message: `Sync ${motor.plat_nomor} dimulai...`,
        type: "info",
      });
    } catch (error) {
      setToast({
        message: `Gagal sync ${motor.plat_nomor}`,
        type: "error",
      });
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
    };

    return (
      statusMap[status as keyof typeof statusMap] || (
        <Badge variant="secondary">{status}</Badge>
      )
    );
  };

  // Calculate time since last update
  const getTimeSinceUpdate = (lastUpdate: string) => {
    if (!lastUpdate) return "-";

    const now = new Date();
    const updateTime = new Date(lastUpdate);
    const diffInMinutes = Math.floor(
      (now.getTime() - updateTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Baru saja";
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari lalu`;
  };

  // Stats calculations dengan real-time updates
  const onlineCount = motors.filter((m) => m.gps_status === "Online").length;
  const offlineCount = motors.filter((m) => m.gps_status === "Offline").length;
  const noImeiCount = motors.filter(
    (m) => m.gps_status === "NoImei" || !m.imei
  ).length;
  const movingCount = motors.filter(
    (m) => m.gps_status === "Online" && m.speed && m.speed > 5
  ).length;

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header dengan WebSocket Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              GPS & Tracking
            </h1>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Real-time monitoring lokasi motor{" "}
              {isConnected && "• Live updates active"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <GpsWebSocketStatus />
          <Button
            onClick={handleSyncAllLocations}
            isLoading={isSyncing}
            variant="outline"
          >
            Sync Semua Lokasi
          </Button>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className={`p-4 ${isDark ? "bg-dark-card border-dark-border" : ""}`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {onlineCount}
            </div>
            <div
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Online
            </div>
          </div>
        </Card>
        <Card
          className={`p-4 ${isDark ? "bg-dark-card border-dark-border" : ""}`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {offlineCount}
            </div>
            <div
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Offline
            </div>
          </div>
        </Card>
        <Card
          className={`p-4 ${isDark ? "bg-dark-card border-dark-border" : ""}`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {movingCount}
            </div>
            <div
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Sedang Bergerak
            </div>
          </div>
        </Card>
        <Card
          className={`p-4 ${isDark ? "bg-dark-card border-dark-border" : ""}`}
        >
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              {noImeiCount}
            </div>
            <div
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              No IMEI
            </div>
          </div>
        </Card>
        <Card
          className={`p-4 ${isDark ? "bg-dark-card border-dark-border" : ""}`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {motors.length}
            </div>
            <div
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Total Motor
            </div>
          </div>
        </Card>
      </div>

      {/* Motors List dengan Real-time Updates */}
      <Card className={isDark ? "bg-dark-card border-dark-border" : ""}>
        <div className="overflow-x-auto rm-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead>
              <tr className={isDark ? "bg-dark-secondary" : "bg-gray-50"}>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? "text-dark-secondary" : "text-gray-500"
                  }`}
                >
                  Plat Nomor
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? "text-dark-secondary" : "text-gray-500"
                  }`}
                >
                  Merk/Model
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? "text-dark-secondary" : "text-gray-500"
                  }`}
                >
                  Status
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? "text-dark-secondary" : "text-gray-500"
                  }`}
                >
                  Status GPS
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? "text-dark-secondary" : "text-gray-500"
                  }`}
                >
                  Lokasi Terakhir
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? "text-dark-secondary" : "text-gray-500"
                  }`}
                >
                  Kecepatan
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? "text-dark-secondary" : "text-gray-500"
                  }`}
                >
                  Update Terakhir
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? "text-dark-secondary" : "text-gray-500"
                  }`}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-dark-border" : "divide-gray-200"
              }`}
            >
              {motors.map((motor) => (
                <tr
                  key={motor.id}
                  className={`transition-colors ${
                    isDark ? "hover:bg-dark-hover" : "hover:bg-gray-50"
                  } ${
                    motor.gps_status === "Online" &&
                    motor.speed &&
                    motor.speed > 0
                      ? "bg-yellow-50 dark:bg-yellow-900/20"
                      : ""
                  }`}
                >
                  <td
                    className={`px-4 py-3 text-sm font-medium ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{motor.plat_nomor}</span>
                      {motor.gps_status === "Online" &&
                        motor.speed &&
                        motor.speed > 0 && (
                          <div
                            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                            title="Sedang bergerak"
                          />
                        )}
                    </div>
                  </td>
                  <td
                    className={`px-4 py-3 text-sm ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    <div>{motor.merk}</div>
                    <div
                      className={
                        isDark ? "text-dark-secondary" : "text-gray-500"
                      }
                    >
                      {motor.model}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {getStatusBadge(motor.status)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {getGpsStatusBadge(motor.gps_status)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {motor.last_known_address || "-"}
                    {motor.lat && motor.lng && (
                      <div
                        className={`text-xs ${
                          isDark ? "text-dark-muted" : "text-gray-500"
                        }`}
                      >
                        {motor.lat.toFixed(6)}, {motor.lng.toFixed(6)}
                      </div>
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {motor.speed ? (
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{motor.speed} km/h</span>
                        {motor.speed > 0 && (
                          <svg
                            className="w-4 h-4 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {motor.last_update ? (
                      <div>
                        <div>{formatDate(motor.last_update)}</div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-dark-muted" : "text-gray-500"
                          }`}
                        >
                          {getTimeSinceUpdate(motor.last_update)}
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <Link to={`/motors/${motor.id}`}>
                        <Button size="sm" variant="outline">
                          Detail
                        </Button>
                      </Link>
                      {motor.imei && (
                        <Button
                          size="sm"
                          onClick={() => handleSingleSync(motor)}
                          disabled={isSyncing}
                        >
                          Sync
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Real-time Information Panel */}
      {isConnected && (
        <Card
          className={
            isDark
              ? "bg-blue-900/20 border-blue-800"
              : "bg-blue-50 border-blue-200"
          }
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <h3
                  className={`font-medium ${
                    isDark ? "text-blue-300" : "text-blue-800"
                  }`}
                >
                  Real-time GPS Tracking Active
                </h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Data lokasi akan update otomatis. {movingCount} motor sedang
                  bergerak.
                </p>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-xs ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Terakhir update
              </div>
              <div
                className={`text-sm font-medium ${
                  isDark ? "text-blue-300" : "text-blue-800"
                }`}
              >
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {motors.length === 0 && !isLoading && (
        <Card
          className={`text-center py-12 ${
            isDark ? "bg-dark-card border-dark-border" : ""
          }`}
        >
          <div className={isDark ? "text-dark-secondary" : "text-gray-500"}>
            Tidak ada data motor
          </div>
        </Card>
      )}

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

export default MotorGpsTracking;
