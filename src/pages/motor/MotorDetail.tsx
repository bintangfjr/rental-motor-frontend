import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motorService } from "../../services/motorService";
import { MotorWithIopgps } from "../../types/motor";
import { Button } from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import Toast from "../../components/ui/Toast";
import {
  formatCurrency,
  formatDate,
  formatDistance,
} from "../../utils/formatters";
import { useTheme } from "../../hooks/useTheme";
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
  <div className="flex justify-between items-start py-2">
    <span
      className={`text-sm font-medium flex-shrink-0 mr-2 ${
        isDark ? "text-dark-secondary" : "text-gray-600"
      }`}
    >
      {label}
    </span>
    <span
      className={`text-sm text-right break-words flex-1 ${
        isDark ? "text-dark-primary" : "text-gray-900"
      }`}
    >
      {value}
    </span>
  </div>
);

const MotorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const motorId = id ? parseInt(id) : 0;
  const [motor, setMotor] = useState<MotorWithIopgps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const { isDark } = useTheme();

  // Load initial motor data
  const loadMotorData = async () => {
    if (!motorId) return;

    try {
      setIsLoading(true);
      const motorData = await motorService.getById(motorId);
      setMotor(motorData);
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
  useMotorWebSocket({
    motorId,
    onLocationUpdate: (data: MotorLocationUpdate) => {
      setMotor((prev) => {
        if (!prev) return prev;

        const updatedMotor: MotorWithIopgps = {
          ...prev,
          lat: data.lat,
          lng: data.lng,
          last_update: data.last_update,
          gps_status: data.gps_status as
            | "Online"
            | "Offline"
            | "NoImei"
            | "Error",
          last_known_address: data.address,
        };

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
    },
    onStatusUpdate: (data: MotorStatusUpdate) => {
      setMotor((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: data.newStatus,
        };
      });
    },
    onServiceUpdate: (data: MotorServiceUpdate) => {
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
    },
  });

  // ========== EVENT HANDLERS ==========
  const handleSyncLocation = async () => {
    if (!motorId) return;

    try {
      setIsSyncing(true);
      await motorService.syncLocation(motorId);
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

  const handleDeleteMotor = async () => {
    if (!motorId || !motor) return;

    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus motor ${motor.plat_nomor}? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await motorService.delete(motorId);

      setToast({
        message: `Motor ${motor.plat_nomor} berhasil dihapus`,
        type: "success",
      });

      // Redirect ke halaman daftar motor setelah 1 detik
      setTimeout(() => {
        navigate("/motors");
      }, 1000);
    } catch (error: unknown) {
      console.error("Error deleting motor:", error);
      setToast({
        message: "Gagal menghapus motor",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
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

    const serviceInterval = 1000;
    const currentMileage = motor.total_mileage;
    const percentage = Math.min((currentMileage / serviceInterval) * 100, 100);
    const remaining = Math.max(serviceInterval - currentMileage, 0);

    return { percentage, remaining };
  };

  if (isLoading) return <Loading />;

  if (!motor) {
    return (
      <div
        className={`text-center py-8 px-4 ${
          isDark ? "text-dark-primary" : "text-gray-900"
        }`}
      >
        <p className="mb-4">Motor tidak ditemukan</p>
        <Link to="/motors">
          <Button className="w-full sm:w-auto">Kembali ke Daftar Motor</Button>
        </Link>
      </div>
    );
  }

  const serviceProgress = calculateServiceProgress();

  return (
    <div className="space-y-4 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Link to="/motors" className="flex-shrink-0">
            <Button variant="outline" size="sm" className="px-2 sm:px-3">
              ←
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1
              className={`text-lg sm:text-xl md:text-2xl font-bold truncate ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              {motor.plat_nomor}
            </h1>
            <p
              className={`text-xs sm:text-sm truncate ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              {motor.merk} {motor.model} • {motor.tahun}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link to={`/motors/${motor.id}/edit`} className="flex-1 sm:flex-none">
            <Button size="sm" className="w-full sm:w-auto">
              Edit Motor
            </Button>
          </Link>
          {motor.imei && (
            <Button
              onClick={handleSyncLocation}
              isLoading={isSyncing}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Sync Lokasi
            </Button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Kolom 1 - Informasi Utama */}
        <div className="space-y-4 sm:space-y-6">
          {/* Informasi Motor */}
          <Card
            className={`p-4 sm:p-6 ${
              isDark ? "bg-dark-card border-dark-border" : ""
            }`}
          >
            <h2
              className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Informasi Motor
            </h2>
            <div className="space-y-2 sm:space-y-3">
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
            </div>
          </Card>

          {/* Informasi Teknis */}
          <Card
            className={`p-4 sm:p-6 ${
              isDark ? "bg-dark-card border-dark-border" : ""
            }`}
          >
            <h2
              className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Informasi Teknis
            </h2>
            <div className="space-y-2 sm:space-y-3">
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
                  value={formatDate(motor.last_update)}
                  isDark={isDark}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Kolom 2 - Service & Maintenance */}
        <div className="space-y-4 sm:space-y-6">
          {/* Service Information */}
          <Card
            className={`p-4 sm:p-6 ${
              isDark ? "bg-dark-card border-dark-border" : ""
            }`}
          >
            <h2
              className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Informasi Service
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div
                  className={`flex justify-between text-xs sm:text-sm mb-1 sm:mb-2 ${
                    isDark ? "text-dark-secondary" : "text-gray-600"
                  }`}
                >
                  <span>Progress Service</span>
                  <span>{serviceProgress.percentage.toFixed(1)}%</span>
                </div>
                <div
                  className={`w-full rounded-full h-2 sm:h-3 ${
                    isDark ? "bg-dark-accent" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
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
                  label="Jarak Tempuh"
                  value={formatDistance(motor.total_mileage || 0)}
                  isDark={isDark}
                />
                <InfoRow
                  label="Sisa Service"
                  value={formatDistance(serviceProgress.remaining)}
                  isDark={isDark}
                />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <Card
            className={`p-4 sm:p-6 ${
              isDark ? "bg-dark-card border-dark-border" : ""
            }`}
          >
            <h2
              className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Actions
            </h2>
            <div className="flex flex-col space-y-2">
              {motor.imei && (
                <Button
                  onClick={handleSyncLocation}
                  isLoading={isSyncing}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Sync Lokasi
                </Button>
              )}
              <Link to={`/motors/${motor.id}/edit`}>
                <Button variant="outline" size="sm" className="w-full">
                  Edit Motor
                </Button>
              </Link>
              <Button
                onClick={handleDeleteMotor}
                isLoading={isDeleting}
                variant="danger"
                size="sm"
                className="w-full"
              >
                Hapus Motor
              </Button>
            </div>
          </Card>
        </div>

        {/* Kolom 3 - GPS & Lokasi */}
        <div className="space-y-4 sm:space-y-6">
          {/* GPS & Tracking */}
          <Card
            className={`p-4 sm:p-6 ${
              isDark ? "bg-dark-card border-dark-border" : ""
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
              <h2
                className={`text-base sm:text-lg font-semibold ${
                  isDark ? "text-dark-primary" : "text-gray-900"
                }`}
              >
                GPS & Lokasi
              </h2>
              {motor.imei && (
                <Button
                  onClick={handleSyncLocation}
                  isLoading={isSyncing}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Refresh
                </Button>
              )}
            </div>

            {!motor.imei ? (
              <div
                className={`text-center py-4 sm:py-6 ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
              >
                <p className="text-sm mb-2">
                  Motor ini tidak memiliki IMEI yang terdaftar
                </p>
                <p className="text-xs mb-3">
                  Tambahkan IMEI yang valid untuk mengaktifkan fitur tracking
                </p>
                <Link to={`/motors/${motor.id}/edit`}>
                  <Button size="sm" className="w-full sm:w-auto">
                    Tambahkan IMEI
                  </Button>
                </Link>
              </div>
            ) : motor.gps_status === "NoImei" ? (
              <div
                className={`text-center py-4 sm:py-6 ${
                  isDark ? "text-yellow-400" : "text-yellow-600"
                }`}
              >
                <p className="text-sm">
                  IMEI tidak valid atau tidak terdaftar di IOPGPS
                </p>
                <p className="text-xs mt-1">
                  Pastikan IMEI sudah terdaftar di akun IOPGPS Anda
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {/* Lokasi Terakhir */}
                <div className="space-y-2 sm:space-y-3">
                  <h3
                    className={`font-medium text-sm sm:text-base ${
                      isDark ? "text-dark-secondary" : "text-gray-700"
                    }`}
                  >
                    Lokasi Terakhir
                  </h3>
                  {motor.last_known_address ? (
                    <div className="space-y-2">
                      <InfoRow
                        label="Alamat"
                        value={
                          <span className="text-xs sm:text-sm break-all">
                            {motor.last_known_address}
                          </span>
                        }
                        isDark={isDark}
                      />
                      {motor.lat && motor.lng && (
                        <InfoRow
                          label="Koordinat"
                          value={
                            <span className="text-xs sm:text-sm font-mono">
                              {motor.lat.toFixed(6)}, {motor.lng.toFixed(6)}
                            </span>
                          }
                          isDark={isDark}
                        />
                      )}
                    </div>
                  ) : (
                    <p
                      className={`text-xs sm:text-sm ${
                        isDark ? "text-dark-muted" : "text-gray-500"
                      }`}
                    >
                      Tidak ada data lokasi
                    </p>
                  )}
                </div>

                {/* Status GPS */}
                {motor.lat && motor.lng && (
                  <div
                    className={`space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t ${
                      isDark ? "border-dark-border" : "border-gray-200"
                    }`}
                  >
                    <div className="space-y-2">
                      <InfoRow
                        label="Status GPS"
                        value={getGpsStatusBadge(motor.gps_status)}
                        isDark={isDark}
                      />
                      <InfoRow
                        label="Update Terakhir"
                        value={
                          motor.last_update
                            ? formatDate(motor.last_update)
                            : "Tidak tersedia"
                        }
                        isDark={isDark}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Status Ringkas */}
          <Card
            className={`p-4 sm:p-6 ${
              isDark ? "bg-dark-card border-dark-border" : ""
            }`}
          >
            <h2
              className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Status Ringkas
            </h2>
            <div className="space-y-2 sm:space-y-3">
              <InfoRow
                label="Ketersediaan"
                value={getStatusBadge(motor.status)}
                isDark={isDark}
              />
              <InfoRow
                label="Tracking"
                value={getGpsStatusBadge(motor.gps_status)}
                isDark={isDark}
              />
              <InfoRow
                label="Jarak Tempuh"
                value={formatDistance(motor.total_mileage || 0)}
                isDark={isDark}
              />
              {motor.last_update && (
                <InfoRow
                  label="Update Terakhir"
                  value={formatDate(motor.last_update)}
                  isDark={isDark}
                />
              )}
            </div>
          </Card>
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
