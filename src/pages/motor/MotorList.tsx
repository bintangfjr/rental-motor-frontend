// src/pages/motor/MotorList.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motorService } from "../../services/motorService";
import { Motor } from "../../types/motor";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import Loading from "../../components/ui/Loading";
import { EmptyState } from "../../components/common/EmptyState";
import { DataTable, Column } from "../../components/ui/DataTable";
import { Card } from "../../components/ui/Card";
import Toast from "../../components/ui/Toast";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import { formatCurrency } from "../../utils/formatters";
import { AxiosError } from "axios";
import { useTheme } from "../../hooks/useTheme";
import {
  useMotorWebSocket,
  MotorStatusUpdate,
  MotorServiceUpdate,
} from "../../hooks/useMotorWebSocket"; // <-- Tambahkan ini
import { useWebSocketContext } from "../../contexts/WebSocketContext"; // <-- Tambahkan ini

// Settings Icon Component
const SettingsIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.4 15C19.2662 15.3044 19.1929 15.6345 19.2 16C19.2 16.5304 19.4107 17.0391 19.7857 17.4142C20.1608 17.7893 20.6696 18 21.2 18C21.5655 18.0071 21.8956 17.9338 22.2 17.8C22.2 18.9205 21.9686 20.0276 21.5218 21.0512C21.075 22.0748 20.422 22.9941 19.6035 23.7516C18.7851 24.5092 17.8186 25.0894 16.7634 25.4567C15.7083 25.824 14.5863 25.9708 13.466 25.8881C12.3457 25.8054 11.2506 25.4948 10.2453 24.9749C9.23998 24.455 8.34534 23.7365 7.6146 22.8617C6.88385 21.9869 6.33223 20.974 5.99253 19.8839C5.65283 18.7938 5.53214 17.6487 5.63751 16.5128C5.74288 15.3769 6.07213 15.7271 6.606 16.737C7.13987 17.7469 7.86769 18.6416 8.7448 19.3684C9.62191 20.0952 10.6308 20.6389 11.7104 20.968C12.79 21.2971 13.9178 21.4048 15.0344 21.2846C16.151 21.1645 17.2332 20.8191 18.2148 20.2687C19.1964 19.7183 20.0567 18.9742 20.7424 18.0817C21.4282 17.1892 21.9244 16.1674 22.2 15.08"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.4 15C19.2662 14.6956 19.1929 14.3655 19.2 14C19.2 13.4696 19.4107 12.9609 19.7857 12.5858C20.1608 12.2107 20.6696 12 21.2 12C21.5655 11.9929 21.8956 12.0662 22.2 12.2C22.2 11.0795 21.9686 9.9724 21.5218 8.94879C21.075 7.92518 20.422 7.00589 19.6035 6.24834C18.7851 5.49079 17.8186 4.91057 16.7634 4.54330C15.7083 4.17603 14.5863 4.02918 13.466 4.11191C12.3457 4.19464 11.2506 4.50524 10.2453 5.02513C9.23998 5.54502 8.34534 6.26354 7.6146 7.13833C6.88385 8.01312 6.33223 9.02604 5.99253 10.1161C5.65283 11.2062 5.53214 12.3513 5.63751 13.4872C5.74288 14.6231 6.07213 15.7271 6.606 16.737C7.13987 17.7469 7.86769 18.6416 8.7448 19.3684C9.62191 20.0952 10.6308 20.6389 11.7104 20.968C12.79 21.2971 13.9178 21.4048 15.0344 21.2846C16.151 21.1645 17.2332 20.8191 18.2148 20.2687C19.1964 19.7183 20.0567 18.9742 20.7424 18.0817C21.4282 17.1892 21.9244 16.1674 22.2 15.08"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Action Menu Component dengan layout grid 2x2
const ActionMenu: React.FC<{
  motor: Motor;
  onDetail: (motor: Motor) => void;
  onEdit: (motor: Motor) => void;
  onService: (motor: Motor) => void;
  onDelete: (motor: Motor) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ motor, onDetail, onEdit, onService, onDelete, isOpen, onClose }) => {
  const { isDark } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 z-50 animate-scale-in origin-top-right"
      style={{ top: "100%", marginTop: "8px" }}
    >
      <div
        className={`border shadow-xl p-2 min-w-[280px] ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Grid 2x2 untuk action buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Detail - Kiri Bawah */}
          <button
            onClick={() => onDetail(motor)}
            className={`flex flex-col items-center justify-center p-3 transition-all duration-200 rounded-lg border hover:scale-105 ${
              isDark
                ? "text-dark-secondary hover:bg-dark-hover border-dark-border"
                : "text-gray-700 hover:bg-gray-50 border-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-xs font-medium">Detail</span>
          </button>

          {/* Edit - Kanan Bawah */}
          <button
            onClick={() => onEdit(motor)}
            className={`flex flex-col items-center justify-center p-3 transition-all duration-200 rounded-lg border hover:scale-105 ${
              isDark
                ? "text-dark-secondary hover:bg-dark-hover border-dark-border"
                : "text-gray-700 hover:bg-gray-50 border-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="text-xs font-medium">Edit</span>
          </button>

          {/* Service - Kiri Atas */}
          {motor.status === "tersedia" && (
            <button
              onClick={() => onService(motor)}
              className={`flex flex-col items-center justify-center p-3 transition-all duration-200 rounded-lg border hover:scale-105 ${
                isDark
                  ? "text-dark-secondary hover:bg-dark-hover border-dark-border"
                  : "text-gray-700 hover:bg-gray-50 border-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5 mb-1"
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
              <span className="text-xs font-medium">Service</span>
            </button>
          )}

          {/* Hapus - Kanan Atas */}
          <button
            onClick={() => onDelete(motor)}
            className={`flex flex-col items-center justify-center p-3 transition-all duration-200 rounded-lg border hover:scale-105 ${
              isDark
                ? "text-red-400 hover:bg-red-900/20 border-red-900/30"
                : "text-red-600 hover:bg-red-50 border-red-100"
            }`}
          >
            <svg
              className="w-5 h-5 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="text-xs font-medium">Hapus</span>
          </button>
        </div>

        {/* Jika service tidak tersedia, tampilkan placeholder */}
        {motor.status !== "tersedia" && (
          <div
            className={`flex flex-col items-center justify-center p-3 rounded-lg border opacity-50 ${
              isDark
                ? "text-dark-muted border-dark-border"
                : "text-gray-400 border-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5 mb-1"
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
            <span className="text-xs">Tidak Tersedia</span>
          </div>
        )}
      </div>
    </div>
  );
};

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

const MotorList: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [motors, setMotors] = useState<Motor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // WebSocket Context
  const { isConnected } = useWebSocketContext();

  // Load initial motors
  const loadMotors = async () => {
    setIsLoading(true);
    try {
      const data: Motor[] = await motorService.getAll();
      setMotors(data);
      setError(null);
    } catch (err: unknown) {
      let message = "Gagal memuat data motor";
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      setError(message);
      console.error("Error loading motors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMotors();
  }, []);

  // ========== WEBSOCKET REAL-TIME UPDATES ==========

  // Handle motor creation from WebSocket
  useEffect(() => {
    if (!isConnected) return;

    const handleMotorCreated = (data: { motor: Motor; timestamp: string }) => {
      console.log("Motor created via WebSocket:", data.motor);
      setMotors((prev) => {
        // Cek apakah motor sudah ada untuk menghindari duplikasi
        const exists = prev.find((m) => m.id === data.motor.id);
        if (exists) return prev;

        // Tambahkan motor baru di awal list
        return [data.motor, ...prev];
      });

      setToast({
        message: `Motor ${data.motor.plat_nomor} berhasil ditambahkan`,
        type: "success",
      });
    };

    const handleMotorDeleted = (data: {
      motorId: number;
      plat_nomor: string;
      timestamp: string;
    }) => {
      console.log("Motor deleted via WebSocket:", data.motorId);
      setMotors((prev) => prev.filter((m) => m.id !== data.motorId));

      setToast({
        message: `Motor ${data.plat_nomor} berhasil dihapus`,
        type: "success",
      });
    };

    // Subscribe to global motor events
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

  // Handle status updates for all motors
  useEffect(() => {
    if (!isConnected) return;

    const handleStatusUpdate = (data: MotorStatusUpdate) => {
      console.log("Motor status updated via WebSocket:", data);
      setMotors((prev) =>
        prev.map((motor) =>
          motor.id === data.motorId
            ? { ...motor, status: data.newStatus }
            : motor
        )
      );

      // Show notification for status changes
      if (data.oldStatus !== data.newStatus) {
        setToast({
          message: `Status ${data.plat_nomor} berubah dari ${data.oldStatus} menjadi ${data.newStatus}`,
          type: "info",
        });
      }
    };

    const handleServiceUpdate = (data: MotorServiceUpdate) => {
      console.log("Motor service updated via WebSocket:", data);
      setMotors((prev) =>
        prev.map((motor) =>
          motor.id === data.motorId
            ? {
                ...motor,
                status:
                  data.serviceStatus === "completed"
                    ? "tersedia"
                    : data.serviceStatus === "in_progress"
                    ? "perbaikan"
                    : data.serviceStatus === "pending"
                    ? "pending_perbaikan"
                    : motor.status,
              }
            : motor
        )
      );

      // Show notification for service updates
      setToast({
        message: `Service ${data.plat_nomor}: ${data.serviceStatus}`,
        type: "info",
      });
    };

    const unsubscribeStatus = window.websocketService?.on(
      "motor:status:update",
      handleStatusUpdate
    );
    const unsubscribeService = window.websocketService?.on(
      "motor:service:update",
      handleServiceUpdate
    );
    const unsubscribeStatusChanged = window.websocketService?.on(
      "motor:status:changed",
      handleStatusUpdate
    );

    return () => {
      unsubscribeStatus?.();
      unsubscribeService?.();
      unsubscribeStatusChanged?.();
    };
  }, [isConnected]);

  // ========== EVENT HANDLERS ==========

  const handleDelete = async () => {
    if (!selectedMotor) return;

    setActionLoading(true);
    try {
      await motorService.delete(selectedMotor.id);
      // WebSocket akan meng-handle update real-time melalui event motor:deleted
      // Jadi kita tidak perlu manual update state di sini
      setToast({
        message: "Motor berhasil dihapus",
        type: "success",
      });
      setShowDeleteModal(false);
      setSelectedMotor(null);
    } catch (err: unknown) {
      let message = "Gagal menghapus motor";
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      setToast({
        message,
        type: "error",
      });
      console.error("Error deleting motor:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkForService = async () => {
    if (!selectedMotor) return;

    setActionLoading(true);
    try {
      await motorService.markForService(
        selectedMotor.id,
        "Perlu service rutin"
      );
      // WebSocket akan meng-handle update real-time melalui event motor:service:update
      // Jadi kita tidak perlu manual update state di sini
      setToast({
        message: `Motor ${selectedMotor.plat_nomor} berhasil ditandai untuk service`,
        type: "success",
      });
      setShowServiceModal(false);
      setSelectedMotor(null);
    } catch (err: unknown) {
      let message = "Gagal menandai motor untuk service";
      if (err instanceof AxiosError) {
        const errorDetails = err.response?.data;
        console.error("Error details:", errorDetails);

        if (errorDetails?.message && Array.isArray(errorDetails.message)) {
          message = errorDetails.message.join(", ");
        } else if (errorDetails?.message) {
          message = errorDetails.message;
        } else if (errorDetails?.error) {
          message = errorDetails.error;
        }
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      setToast({
        message,
        type: "error",
      });
      console.error("Error marking motor for service:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRowClick = (motor: Motor) => {
    navigate(`/motors/${motor.id}`);
  };

  const handleDetail = (motor: Motor) => {
    navigate(`/motors/${motor.id}`);
    setOpenMenuId(null);
  };

  const handleEdit = (motor: Motor) => {
    navigate(`/motors/${motor.id}/edit`);
    setOpenMenuId(null);
  };

  const handleServiceClick = (motor: Motor) => {
    setSelectedMotor(motor);
    setShowServiceModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (motor: Motor) => {
    setSelectedMotor(motor);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  // Mencegah event bubbling ketika mengklik action menu
  const handleActionMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      "success" | "warning" | "danger" | "secondary"
    > = {
      tersedia: "success",
      disewa: "warning",
      perbaikan: "danger",
      pending_perbaikan: "warning",
    };

    const statusLabels: Record<string, string> = {
      tersedia: "Tersedia",
      disewa: "Disewa",
      perbaikan: "Perbaikan",
      pending_perbaikan: "Pending Service",
    };

    return (
      <Badge variant={statusMap[status] || "secondary"}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  // Filter motors berdasarkan search query
  const filteredMotors = motors.filter(
    (motor) =>
      motor.plat_nomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      motor.merk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      motor.tahun.toString().includes(searchQuery)
  );

  const columns: Column<Motor>[] = [
    {
      key: "plat_nomor",
      header: "Plat Nomor",
      sortable: true,
      render: (value, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
        >
          {value}
        </div>
      ),
    },
    {
      key: "merk",
      header: "Merk",
      sortable: true,
      render: (value, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
        >
          {value}
        </div>
      ),
    },
    {
      key: "tahun",
      header: "Tahun",
      sortable: true,
      render: (value, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
        >
          {value}
        </div>
      ),
    },
    {
      key: "harga",
      header: "Harga Sewa",
      render: (_, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
        >
          {formatCurrency(row.harga)}
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => (
        <div
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
        >
          {getStatusBadge(row.status)}
        </div>
      ),
      sortable: true,
    },
    {
      key: "id",
      header: "Aksi",
      render: (_, row) => (
        <div
          className="relative flex justify-center"
          onClick={handleActionMenuClick}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === row.id ? null : row.id);
            }}
            className={`p-2 transition-colors rounded-lg hover:scale-105 ${
              isDark
                ? "text-dark-secondary hover:text-dark-primary hover:bg-dark-hover"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            title="Pengaturan"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          <ActionMenu
            motor={row}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onService={handleServiceClick}
            onDelete={handleDeleteClick}
            isOpen={openMenuId === row.id}
            onClose={() => setOpenMenuId(null)}
          />
        </div>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  if (error)
    return (
      <div className="text-center py-8">
        <p className={`${isDark ? "text-red-400" : "text-red-600"}`}>{error}</p>
        <Button onClick={loadMotors} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header dengan WebSocket Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Daftar Motor
          </h1>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            Total {filteredMotors.length} motor
            {isConnected && " • Real-time updates active"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <WebSocketStatusIndicator />
          <div className="flex space-x-2">
            <Link to="/motors/service">
              <Button variant="outline">Manajemen Service</Button>
            </Link>
            <Link to="/motors/create">
              <Button>+ Tambah Motor</Button>
            </Link>
          </div>
        </div>
      </div>

      <Card>
        {motors.length === 0 ? (
          <EmptyState
            title="Belum ada motor"
            description="Tambahkan motor pertama Anda untuk mulai mengelola rental."
            action={{
              label: "Tambah Motor",
              onClick: () => navigate("/motors/create"),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredMotors}
            search={{
              placeholder: "Cari plat nomor, merk, atau tahun...",
              onSearch: setSearchQuery,
            }}
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredMotors.length,
              onPageChange: (page, newSize) => {
                setCurrentPage(page);
                if (newSize) setPageSize(newSize);
              },
            }}
            onRowClick={handleRowClick}
            rowClassName={`cursor-pointer transition-all duration-200 ${
              isDark ? "hover:bg-dark-hover/50" : "hover:bg-gray-50"
            }`}
          />
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus Motor"
        size="sm"
      >
        <ModalBody>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            Apakah Anda yakin ingin menghapus motor{" "}
            <span
              className={`font-semibold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              {selectedMotor?.plat_nomor} - {selectedMotor?.merk}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={actionLoading}
          >
            Ya, Hapus
          </Button>
        </ModalFooter>
      </Modal>

      {/* Service Confirmation Modal */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        title="Konfirmasi Service Motor"
        size="sm"
      >
        <ModalBody>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            Tandai motor{" "}
            <span
              className={`font-semibold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              {selectedMotor?.plat_nomor} - {selectedMotor?.merk}
            </span>{" "}
            sebagai perlu service?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowServiceModal(false)}
            disabled={actionLoading}
          >
            Batal
          </Button>
          <Button onClick={handleMarkForService} isLoading={actionLoading}>
            Ya, Tandai Service
          </Button>
        </ModalFooter>
      </Modal>

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

export default MotorList;
