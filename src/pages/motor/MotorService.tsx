// src/pages/motor/MotorService.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motorService } from "../../services/motorService";
import { motorServiceService } from "../../services/motorServiceService";
import {
  Motor,
  ServiceRecord,
  StartServiceData,
  CompleteServiceData,
} from "../../types/motor";
import { Button } from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import Toast from "../../components/ui/Toast";
import ServiceForm from "../../components/motor/ServiceForm";
import ServiceHistory from "../../components/motor/ServiceHistory";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { useWebSocketContext } from "../../contexts/WebSocketContext"; // <-- Tambahkan ini
import {
  useMotorWebSocket,
  MotorServiceUpdate,
} from "../../hooks/useMotorWebSocket"; // <-- Tambahkan ini

interface ServiceFormData {
  service_type: "rutin" | "berat" | "perbaikan" | "emergency";
  service_location: string;
  service_technician: string;
  parts?: string[];
  services?: string[];
  estimated_cost?: number;
  estimated_completion?: string;
  notes?: string;
}

// Komponen Status WebSocket
const WebSocketStatusIndicator: React.FC = () => {
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
    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-opacity-10 border text-sm">
      <div
        className={`w-2 h-2 rounded-full ${statusInfo.color} animate-pulse`}
      />
      <span className="text-xs font-medium">{statusInfo.text}</span>
    </div>
  );
};

const MotorService: React.FC = () => {
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [pendingService, setPendingService] = useState<Motor[]>([]);
  const [inService, setInService] = useState<Motor[]>([]);
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // WebSocket Context
  const { isConnected } = useWebSocketContext();

  // Modal states
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // ========== WEBSOCKET REAL-TIME UPDATES ==========

  // Handle service updates from WebSocket
  useEffect(() => {
    if (!isConnected) return;

    const handleServiceUpdate = (data: MotorServiceUpdate) => {
      console.log("Service update via WebSocket:", data);

      // Update state berdasarkan service status
      switch (data.serviceStatus) {
        case "pending":
          // Motor ditandai untuk service - tambah ke pending
          setPendingService((prev) => {
            const exists = prev.find((m) => m.id === data.motorId);
            if (exists) return prev;
            return [
              ...prev,
              {
                id: data.motorId,
                plat_nomor: data.plat_nomor,
                merk: "", // Data lengkap akan di-load via API
                model: "",
                tahun: 0,
                harga: 0,
                status: "pending_perbaikan",
                gps_status: "Offline",
                created_at: "",
                updated_at: "",
                service_notes: data.notes,
              } as Motor,
            ];
          });
          break;

        case "in_progress":
          // Service dimulai - pindah dari pending ke inService
          setPendingService((prev) =>
            prev.filter((m) => m.id !== data.motorId)
          );
          setInService((prev) => {
            const exists = prev.find((m) => m.id === data.motorId);
            if (exists) return prev;
            return [
              ...prev,
              {
                id: data.motorId,
                plat_nomor: data.plat_nomor,
                merk: "",
                model: "",
                tahun: 0,
                harga: 0,
                status: "perbaikan",
                gps_status: "Offline",
                created_at: "",
                updated_at: "",
                service_technician: data.technician,
              } as Motor,
            ];
          });
          break;

        case "completed":
          // Service selesai - hapus dari semua list
          setPendingService((prev) =>
            prev.filter((m) => m.id !== data.motorId)
          );
          setInService((prev) => prev.filter((m) => m.id !== data.motorId));
          break;

        case "cancelled":
          // Service dibatalkan - hapus dari semua list
          setPendingService((prev) =>
            prev.filter((m) => m.id !== data.motorId)
          );
          setInService((prev) => prev.filter((m) => m.id !== data.motorId));
          break;
      }

      // Juga reload data untuk memastikan konsistensi
      loadData();

      // Show notification
      let message = "";
      switch (data.serviceStatus) {
        case "pending":
          message = `Motor ${data.plat_nomor} ditandai untuk service`;
          break;
        case "in_progress":
          message = `Service ${data.plat_nomor} dimulai oleh ${
            data.technician || "teknisi"
          }`;
          break;
        case "completed":
          message = `Service ${data.plat_nomor} berhasil diselesaikan`;
          break;
        case "cancelled":
          message = `Service ${data.plat_nomor} dibatalkan`;
          break;
        default:
          message = `Status service ${data.plat_nomor} diperbarui`;
      }

      setToast({
        message,
        type: data.serviceStatus === "cancelled" ? "error" : "success",
      });
    };

    const handleStatusUpdate = (data: any) => {
      // Handle status changes that might affect service
      if (data.newStatus === "pending_perbaikan") {
        // Motor ditandai untuk service
        setPendingService((prev) => {
          const exists = prev.find((m) => m.id === data.motorId);
          if (exists) return prev;
          return [
            ...prev,
            {
              id: data.motorId,
              plat_nomor: data.plat_nomor,
              merk: "",
              model: "",
              tahun: 0,
              harga: 0,
              status: "pending_perbaikan",
              gps_status: "Offline",
              created_at: "",
              updated_at: "",
            } as Motor,
          ];
        });
        setInService((prev) => prev.filter((m) => m.id !== data.motorId));
      } else if (data.newStatus === "perbaikan") {
        // Motor dalam service
        setPendingService((prev) => prev.filter((m) => m.id !== data.motorId));
        setInService((prev) => {
          const exists = prev.find((m) => m.id === data.motorId);
          if (exists) return prev;
          return [
            ...prev,
            {
              id: data.motorId,
              plat_nomor: data.plat_nomor,
              merk: "",
              model: "",
              tahun: 0,
              harga: 0,
              status: "perbaikan",
              gps_status: "Offline",
              created_at: "",
              updated_at: "",
            } as Motor,
          ];
        });
      } else if (data.newStatus === "tersedia") {
        // Motor kembali tersedia - hapus dari semua service list
        setPendingService((prev) => prev.filter((m) => m.id !== data.motorId));
        setInService((prev) => prev.filter((m) => m.id !== data.motorId));
      }
    };

    // Subscribe to service events
    const unsubscribeService = window.websocketService?.on(
      "motor:service:update",
      handleServiceUpdate
    );
    const unsubscribeStatus = window.websocketService?.on(
      "motor:status:update",
      handleStatusUpdate
    );
    const unsubscribeStatusChanged = window.websocketService?.on(
      "motor:status:changed",
      handleStatusUpdate
    );

    return () => {
      unsubscribeService?.();
      unsubscribeStatus?.();
      unsubscribeStatusChanged?.();
    };
  }, [isConnected]);

  // Handle motor creation/deletion that might affect service
  useEffect(() => {
    if (!isConnected) return;

    const handleMotorCreated = (data: { motor: Motor; timestamp: string }) => {
      // Jika motor baru memiliki status service, update lists
      if (data.motor.status === "pending_perbaikan") {
        setPendingService((prev) => {
          const exists = prev.find((m) => m.id === data.motor.id);
          if (exists) return prev;
          return [...prev, data.motor];
        });
      } else if (data.motor.status === "perbaikan") {
        setInService((prev) => {
          const exists = prev.find((m) => m.id === data.motor.id);
          if (exists) return prev;
          return [...prev, data.motor];
        });
      }
    };

    const handleMotorDeleted = (data: {
      motorId: number;
      plat_nomor: string;
      timestamp: string;
    }) => {
      // Hapus motor dari service lists jika ada
      setPendingService((prev) =>
        prev.filter((motor) => motor.id !== data.motorId)
      );
      setInService((prev) => prev.filter((motor) => motor.id !== data.motorId));
      setServiceRecords((prev) =>
        prev.filter((record) => record.motor_id !== data.motorId)
      );
    };

    const unsubscribeCreated = window.websocketService?.on(
      "motor:created",
      handleMotorCreated
    );
    const unsubscribeDeleted = window.websocketService?.on(
      "motor:deleted",
      handleMotorDeleted
    );

    return () => {
      unsubscribeCreated?.();
      unsubscribeDeleted?.();
    };
  }, [isConnected]);

  // Handle motor creation/deletion that might affect service
  useEffect(() => {
    if (!isConnected) return;

    const handleMotorCreated = (data: { motor: Motor; timestamp: string }) => {
      // Jika motor baru memiliki status service, reload data
      if (
        data.motor.status === "pending_perbaikan" ||
        data.motor.status === "perbaikan"
      ) {
        loadData();
      }
    };

    const handleMotorDeleted = (data: {
      motorId: number;
      plat_nomor: string;
      timestamp: string;
    }) => {
      // Hapus motor dari service lists jika ada
      setPendingService((prev) =>
        prev.filter((motor) => motor.id !== data.motorId)
      );
      setInService((prev) => prev.filter((motor) => motor.id !== data.motorId));
      setServiceRecords((prev) =>
        prev.filter((record) => record.motor_id !== data.motorId)
      );
    };

    const unsubscribeCreated = window.websocketService?.on(
      "motor:created",
      handleMotorCreated
    );
    const unsubscribeDeleted = window.websocketService?.on(
      "motor:deleted",
      handleMotorDeleted
    );

    return () => {
      unsubscribeCreated?.();
      unsubscribeDeleted?.();
    };
  }, [isConnected]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [motorsData, serviceRecordsData] = await Promise.all([
        motorService.getAll(),
        motorServiceService.getAllServiceRecords(),
      ]);

      const pending = Array.isArray(motorsData)
        ? motorsData.filter((motor) => motor?.status === "pending_perbaikan")
        : [];

      const inServiceMotors = Array.isArray(motorsData)
        ? motorsData.filter((motor) => motor?.status === "perbaikan")
        : [];

      setServiceRecords(serviceRecordsData || []);
      setPendingService(pending);
      setInService(inServiceMotors);
    } catch (error: unknown) {
      setToast({
        message: "Gagal memuat data service",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartService = (motor: Motor) => {
    if (!motor?.id) {
      return;
    }
    setSelectedMotor(motor);
    setShowServiceForm(true);
  };

  const handleCompleteService = async (serviceData: ServiceFormData) => {
    if (!selectedMotor?.id) return;

    try {
      setIsSyncing(true);

      const startServiceData: StartServiceData = {
        service_type: serviceData.service_type || "rutin",
        service_location: serviceData.service_location || "",
        service_technician: serviceData.service_technician || "",
        parts: Array.isArray(serviceData.parts) ? serviceData.parts : [],
        services: Array.isArray(serviceData.services)
          ? serviceData.services
          : [],
        estimated_cost: Number(serviceData.estimated_cost) || 0,
        estimated_completion: serviceData.estimated_completion || "",
        notes: serviceData.notes || "",
      };

      await motorServiceService.startService(
        selectedMotor.id,
        startServiceData
      );

      // WebSocket akan meng-handle update real-time melalui event motor:service:update
      // Jadi kita tidak perlu manual update state di sini

      setShowServiceForm(false);
      setSelectedMotor(null);

      setToast({
        message: "Service berhasil dimulai",
        type: "success",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memulai service";

      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFinishService = async () => {
    if (!selectedMotor?.id) return;

    try {
      setActionLoading(selectedMotor.id);

      // Immediate UI update
      setInService((prev) => prev.filter((m) => m.id !== selectedMotor.id));

      const activeService = serviceRecords.find(
        (record) =>
          record.motor_id === selectedMotor.id &&
          record.status === "in_progress"
      );

      if (activeService?.id) {
        const completeData: CompleteServiceData = {
          actual_cost: activeService.estimated_cost || 0,
          actual_completion: new Date().toISOString(),
          service_summary: "Service telah diselesaikan",
        };

        await motorServiceService.completeService(
          activeService.id,
          completeData
        );
      }

      // WebSocket akan meng-handle update real-time
      setShowFinishModal(false);
      setSelectedMotor(null);
      setToast({
        message: "Service berhasil diselesaikan",
        type: "success",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyelesaikan service";

      // Jika gagal, reload data
      loadData();

      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };
  const handleCancelService = async () => {
    if (!selectedMotor?.id) return;

    try {
      setActionLoading(selectedMotor.id);

      // Immediate UI update - remove from lists
      setPendingService((prev) =>
        prev.filter((m) => m.id !== selectedMotor.id)
      );
      setInService((prev) => prev.filter((m) => m.id !== selectedMotor.id));

      const activeService = serviceRecords.find(
        (record) =>
          (record.motor_id === selectedMotor.id &&
            record.status === "in_progress") ||
          record.status === "pending"
      );

      if (activeService?.id) {
        await motorServiceService.cancelService(activeService.id);
      } else {
        const minimalUpdateData = {
          status: "tersedia" as const,
          service_technician: undefined,
          service_notes: undefined,
        };

        await motorService.update(selectedMotor.id, minimalUpdateData);
      }

      // WebSocket akan meng-handle update real-time dan memastikan konsistensi
      setShowCancelModal(false);
      setSelectedMotor(null);
      setToast({
        message: "Service berhasil dibatalkan",
        type: "success",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal membatalkan service";

      // Jika gagal, reload data untuk mengembalikan state yang benar
      loadData();

      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteServiceRecord = async () => {
    if (!selectedRecordId) return;

    try {
      setActionLoading(selectedRecordId);
      await motorServiceService.deleteServiceRecord(selectedRecordId);

      // Update local state untuk immediate feedback
      setServiceRecords((prev) =>
        prev.filter((record) => record.id !== selectedRecordId)
      );

      setShowDeleteModal(false);
      setSelectedRecordId(null);
      setToast({
        message: "Record service berhasil dihapus",
        type: "success",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal menghapus record service";

      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewHistory = (motor: Motor) => {
    if (!motor?.id) return;
    setSelectedMotor(motor);
    setShowServiceHistory(true);
  };

  const handleFinishClick = (motor: Motor) => {
    setSelectedMotor(motor);
    setShowFinishModal(true);
  };

  const handleCancelClick = (motor: Motor) => {
    setSelectedMotor(motor);
    setShowCancelModal(true);
  };

  const handleDeleteClick = (recordId: number) => {
    setSelectedRecordId(recordId);
    setShowDeleteModal(true);
  };

  const getServiceRecordForMotor = (
    motorId: number
  ): ServiceRecord | undefined => {
    return serviceRecords.find(
      (record) => record.motor_id === motorId && record.status === "in_progress"
    );
  };

  const safeFormatDate = (date: unknown): string => {
    if (!date) return "-";
    try {
      return formatDate(date as string);
    } catch {
      return "-";
    }
  };

  const safeFormatCurrency = (amount: unknown): string => {
    if (amount === null || amount === undefined) return "-";
    if (typeof amount === "number") return formatCurrency(amount);
    if (typeof amount === "string") {
      const parsed = parseFloat(amount);
      return formatCurrency(isNaN(parsed) ? 0 : parsed);
    }
    return "-";
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header dengan WebSocket Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/motors">
            <Button variant="outline">← Kembali ke Daftar Motor</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Manajemen Service</h1>
            <p className="text-gray-600 dark:text-dark-secondary text-sm">
              Real-time service monitoring{" "}
              {isConnected && "• Live updates active"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <WebSocketStatusIndicator />
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                setSelectedMotor(null);
                setShowServiceHistory(true);
              }}
              variant="outline"
            >
              Riwayat Service
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards dengan real-time updates */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {pendingService.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-dark-secondary">
              Pending Service
            </div>
            {pendingService.length > 0 && (
              <div className="text-xs text-orange-500 mt-1">
                {isConnected ? "Live" : "Manual update"}
              </div>
            )}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {inService.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-dark-secondary">
              Dalam Service
            </div>
            {inService.length > 0 && (
              <div className="text-xs text-yellow-500 mt-1">
                {isConnected ? "Live" : "Manual update"}
              </div>
            )}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {serviceRecords.filter((r) => r?.status === "completed").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-dark-secondary">
              Selesai
            </div>
            <div className="text-xs text-blue-500 mt-1">Total bulan ini</div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {serviceRecords.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-dark-secondary">
              Total Service
            </div>
            <div className="text-xs text-green-500 mt-1">Semua waktu</div>
          </div>
        </Card>
      </div>

      {/* Pending Service Section */}
      {pendingService.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-orange-700 dark:text-orange-400">
                Pending Service ({pendingService.length})
              </h2>
              {isConnected && (
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </div>
            <Badge variant="warning">Menunggu Service</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Plat Nomor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Merk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Tahun
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Alasan Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {pendingService.map((motor) => (
                  <tr
                    key={motor.id}
                    className="hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-dark-primary">
                      {motor.plat_nomor || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-primary">
                      {motor.merk || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-primary">
                      {motor.tahun || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-primary">
                      {motor.service_notes || "Service rutin"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/motors/${motor.id}`}>
                          <Button size="sm" variant="outline">
                            Detail
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleStartService(motor)}
                          disabled={!motor.id}
                        >
                          Mulai Service
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewHistory(motor)}
                          disabled={!motor.id}
                        >
                          Riwayat
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleCancelClick(motor)}
                          disabled={!motor.id || actionLoading === motor.id}
                          isLoading={actionLoading === motor.id}
                        >
                          {actionLoading === motor.id
                            ? "Membatalkan..."
                            : "Batal"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* In Service Section */}
      {inService.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                Dalam Service ({inService.length})
              </h2>
              {isConnected && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              )}
            </div>
            <Badge variant="warning">Sedang Diperbaiki</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Plat Nomor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Merk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Tahun
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Teknisi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Tanggal Mulai
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {inService.map((motor) => {
                  const currentService = getServiceRecordForMotor(motor.id);
                  return (
                    <tr
                      key={motor.id}
                      className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-dark-primary">
                        {motor.plat_nomor || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-primary">
                        {motor.merk || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-primary">
                        {motor.tahun || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-primary">
                        {currentService?.service_technician ||
                          motor.service_technician ||
                          "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-primary">
                        {safeFormatDate(currentService?.service_date)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/motors/${motor.id}`}>
                            <Button size="sm" variant="outline">
                              Detail
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            onClick={() => handleFinishClick(motor)}
                            isLoading={actionLoading === motor.id}
                            disabled={!motor.id || actionLoading === motor.id}
                          >
                            {actionLoading === motor.id
                              ? "Menyelesaikan..."
                              : "Selesai"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewHistory(motor)}
                            disabled={!motor.id}
                          >
                            Riwayat
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleCancelClick(motor)}
                            disabled={!motor.id || actionLoading === motor.id}
                            isLoading={actionLoading === motor.id}
                          >
                            {actionLoading === motor.id
                              ? "Membatalkan..."
                              : "Batal"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Completed & Cancelled Service Records Section */}
      {serviceRecords.filter(
        (record) =>
          record.status === "completed" || record.status === "cancelled"
      ).length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-dark-primary">
              Riwayat Service (
              {
                serviceRecords.filter(
                  (record) =>
                    record.status === "completed" ||
                    record.status === "cancelled"
                ).length
              }
              )
            </h2>
            <Badge variant="secondary">Riwayat</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Plat Nomor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Tipe Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Biaya
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-secondary uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {serviceRecords
                  .filter(
                    (record) =>
                      record.status === "completed" ||
                      record.status === "cancelled"
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.service_date).getTime() -
                      new Date(a.service_date).getTime()
                  )
                  .slice(0, 10)
                  .map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-dark-primary">
                        {record.motor?.plat_nomor || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-primary capitalize">
                        {record.service_type}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {record.status === "completed" ? (
                          <Badge variant="success">Selesai</Badge>
                        ) : (
                          <Badge variant="danger">Dibatalkan</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-primary">
                        {safeFormatDate(record.service_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-primary">
                        {safeFormatCurrency(
                          record.actual_cost || record.estimated_cost
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMotor(
                                record.motor
                                  ? ({
                                      id: record.motor_id,
                                      plat_nomor: record.motor.plat_nomor,
                                      merk: record.motor.merk,
                                      model: record.motor.model,
                                      tahun: 0,
                                      harga: 0,
                                      status: "tersedia",
                                      gps_status: "Offline",
                                      created_at: "",
                                      updated_at: "",
                                    } as Motor)
                                  : null
                              );
                              setShowServiceHistory(true);
                            }}
                          >
                            Detail
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteClick(record.id)}
                            disabled={actionLoading === record.id}
                            isLoading={actionLoading === record.id}
                          >
                            {actionLoading === record.id
                              ? "Menghapus..."
                              : "Hapus"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pendingService.length === 0 &&
        inService.length === 0 &&
        serviceRecords.length === 0 && (
          <Card>
            <div className="text-center py-8 text-gray-500 dark:text-dark-secondary">
              <p>Tidak ada motor yang perlu service</p>
              <p className="text-sm mt-2">
                Semua motor dalam kondisi baik dan siap digunakan
                {isConnected && " • Monitoring real-time aktif"}
              </p>
            </div>
          </Card>
        )}

      {/* Finish Service Confirmation Modal */}
      <Modal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        title="Konfirmasi Selesaikan Service"
        size="sm"
      >
        <ModalBody>
          <p className="text-gray-600 dark:text-dark-secondary">
            Apakah Anda yakin ingin menyelesaikan service untuk motor{" "}
            <span className="font-semibold text-gray-900 dark:text-dark-primary">
              {selectedMotor?.plat_nomor} - {selectedMotor?.merk}
            </span>
            ?
          </p>
          {isConnected && (
            <p className="text-xs text-green-600 mt-2">
              Perubahan akan terlihat secara real-time di semua perangkat
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowFinishModal(false)}>
            Batal
          </Button>
          <Button
            onClick={handleFinishService}
            isLoading={actionLoading === selectedMotor?.id}
          >
            Ya, Selesaikan
          </Button>
        </ModalFooter>
      </Modal>

      {/* Cancel Service Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Konfirmasi Batalkan Service"
        size="sm"
      >
        <ModalBody>
          <p className="text-gray-600 dark:text-dark-secondary">
            Apakah Anda yakin ingin membatalkan service untuk motor{" "}
            <span className="font-semibold text-gray-900 dark:text-dark-primary">
              {selectedMotor?.plat_nomor} - {selectedMotor?.merk}
            </span>
            ?
          </p>
          {isConnected && (
            <p className="text-xs text-green-600 mt-2">
              Perubahan akan terlihat secara real-time di semua perangkat
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCancelModal(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelService}
            isLoading={actionLoading === selectedMotor?.id}
          >
            Ya, Batalkan
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Service Record Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus Record Service"
        size="sm"
      >
        <ModalBody>
          <p className="text-gray-600 dark:text-dark-secondary">
            Apakah Anda yakin ingin menghapus record service ini? Tindakan ini
            tidak dapat dibatalkan.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteServiceRecord}
            isLoading={actionLoading === selectedRecordId}
          >
            Ya, Hapus
          </Button>
        </ModalFooter>
      </Modal>

      {/* Service Form Modal */}
      {showServiceForm && selectedMotor && (
        <ServiceForm
          motor={selectedMotor}
          onSave={handleCompleteService}
          onCancel={() => {
            setShowServiceForm(false);
            setSelectedMotor(null);
          }}
          isLoading={isSyncing}
        />
      )}

      {/* Service History Modal */}
      {showServiceHistory && (
        <ServiceHistory
          motor={selectedMotor}
          onClose={() => {
            setShowServiceHistory(false);
            setSelectedMotor(null);
          }}
          onServiceUpdate={loadData}
        />
      )}

      {/* Toast Notification */}
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

export default MotorService;
