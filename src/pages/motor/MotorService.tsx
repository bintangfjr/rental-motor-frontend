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

  // Modal states
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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

      setShowServiceForm(false);
      setSelectedMotor(null);

      // Reload data untuk update terbaru
      await loadData();

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

      setShowFinishModal(false);
      setSelectedMotor(null);

      // Reload data untuk update terbaru
      await loadData();

      setToast({
        message: "Service berhasil diselesaikan",
        type: "success",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyelesaikan service";

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

      setShowCancelModal(false);
      setSelectedMotor(null);

      // Reload data untuk update terbaru
      await loadData();

      setToast({
        message: "Service berhasil dibatalkan",
        type: "success",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal membatalkan service";

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

      // Update local state
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
    <div className="space-y-4 p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/motors">
            <Button variant="outline" size="sm" className="px-3">
              ← Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Manajemen Service</h1>
            <p className="text-gray-600 text-sm">
              Kelola service dan perbaikan motor
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              setSelectedMotor(null);
              setShowServiceHistory(true);
            }}
            variant="outline"
            size="sm"
          >
            Riwayat Service
          </Button>
        </div>
      </div>

      {/* Stats Cards - Mobile friendly */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 border-l-4 border-l-orange-500">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-orange-600">
              {pendingService.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Pending</div>
          </div>
        </Card>
        <Card className="p-3 border-l-4 border-l-yellow-500">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-yellow-600">
              {inService.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Dalam Service
            </div>
          </div>
        </Card>
        <Card className="p-3 border-l-4 border-l-blue-500">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-blue-600">
              {serviceRecords.filter((r) => r?.status === "completed").length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Selesai</div>
          </div>
        </Card>
        <Card className="p-3 border-l-4 border-l-green-500">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-green-600">
              {serviceRecords.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total</div>
          </div>
        </Card>
      </div>

      {/* Pending Service Section */}
      {pendingService.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-orange-700">
              Pending Service ({pendingService.length})
            </h2>
            <Badge variant="warning">Menunggu</Badge>
          </div>
          <div className="space-y-3">
            {pendingService.map((motor) => (
              <div
                key={motor.id}
                className="p-3 border rounded-lg hover:bg-orange-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm truncate">
                        {motor.plat_nomor || "-"}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {motor.merk} {motor.model}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {motor.service_notes || "Service rutin"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/motors/${motor.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        Detail
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => handleStartService(motor)}
                      disabled={!motor.id}
                      className="text-xs"
                    >
                      Mulai
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewHistory(motor)}
                      disabled={!motor.id}
                      className="text-xs"
                    >
                      Riwayat
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleCancelClick(motor)}
                      disabled={!motor.id || actionLoading === motor.id}
                      isLoading={actionLoading === motor.id}
                      className="text-xs"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* In Service Section */}
      {inService.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-yellow-700">
              Dalam Service ({inService.length})
            </h2>
            <Badge variant="warning">Sedang Diperbaiki</Badge>
          </div>
          <div className="space-y-3">
            {inService.map((motor) => {
              const currentService = getServiceRecordForMotor(motor.id);
              return (
                <div
                  key={motor.id}
                  className="p-3 border rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm truncate">
                          {motor.plat_nomor || "-"}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {motor.merk} {motor.model}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          Teknisi:{" "}
                          {currentService?.service_technician ||
                            motor.service_technician ||
                            "-"}
                        </div>
                        <div>
                          Mulai: {safeFormatDate(currentService?.service_date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/motors/${motor.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Detail
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleFinishClick(motor)}
                        isLoading={actionLoading === motor.id}
                        disabled={!motor.id || actionLoading === motor.id}
                        className="text-xs"
                      >
                        Selesai
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewHistory(motor)}
                        disabled={!motor.id}
                        className="text-xs"
                      >
                        Riwayat
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleCancelClick(motor)}
                        disabled={!motor.id || actionLoading === motor.id}
                        isLoading={actionLoading === motor.id}
                        className="text-xs"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
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
            <h2 className="text-lg font-semibold">
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
          <div className="space-y-3">
            {serviceRecords
              .filter(
                (record) =>
                  record.status === "completed" || record.status === "cancelled"
              )
              .sort(
                (a, b) =>
                  new Date(b.service_date).getTime() -
                  new Date(a.service_date).getTime()
              )
              .slice(0, 5) // Limit untuk mobile
              .map((record) => (
                <div
                  key={record.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm">
                          {record.motor?.plat_nomor || "-"}
                        </h3>
                        <Badge
                          variant={
                            record.status === "completed" ? "success" : "danger"
                          }
                          className="text-xs"
                        >
                          {record.status === "completed"
                            ? "Selesai"
                            : "Dibatalkan"}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="capitalize">{record.service_type}</div>
                        <div>
                          {safeFormatDate(record.service_date)} •{" "}
                          {safeFormatCurrency(
                            record.actual_cost || record.estimated_cost
                          )}
                        </div>
                      </div>
                    </div>
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
                        className="text-xs"
                      >
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteClick(record.id)}
                        disabled={actionLoading === record.id}
                        isLoading={actionLoading === record.id}
                        className="text-xs"
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {pendingService.length === 0 &&
        inService.length === 0 &&
        serviceRecords.length === 0 && (
          <Card>
            <div className="text-center py-8 text-gray-500">
              <p>Tidak ada motor yang perlu service</p>
              <p className="text-sm mt-2">
                Semua motor dalam kondisi baik dan siap digunakan
              </p>
            </div>
          </Card>
        )}

      {/* Finish Service Confirmation Modal */}
      <Modal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        title="Selesaikan Service"
        size="sm"
      >
        <ModalBody>
          <p className="text-gray-600">
            Apakah Anda yakin ingin menyelesaikan service untuk motor{" "}
            <span className="font-semibold">
              {selectedMotor?.plat_nomor} - {selectedMotor?.merk}
            </span>
            ?
          </p>
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
        title="Batalkan Service"
        size="sm"
      >
        <ModalBody>
          <p className="text-gray-600">
            Apakah Anda yakin ingin membatalkan service untuk motor{" "}
            <span className="font-semibold">
              {selectedMotor?.plat_nomor} - {selectedMotor?.merk}
            </span>
            ?
          </p>
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
        title="Hapus Record Service"
        size="sm"
      >
        <ModalBody>
          <p className="text-gray-600">
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
