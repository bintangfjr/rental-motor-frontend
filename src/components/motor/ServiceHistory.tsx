import React, { useState, useEffect, useCallback } from "react";
import { Motor, ServiceRecord } from "../../types/motor";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { motorServiceService } from "../../services/motorServiceService";
import { useTheme } from "../../hooks/useTheme";

interface ServiceHistoryProps {
  motor?: Motor | null;
  onClose: () => void;
  onServiceUpdate?: () => void;
}

const ServiceHistory: React.FC<ServiceHistoryProps> = ({
  motor,
  onClose,
  onServiceUpdate,
}) => {
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const { isDark } = useTheme();

  const loadServiceRecords = useCallback(async () => {
    if (!motor) return;

    setLoading(true);
    try {
      const records = await motorServiceService.getServiceRecordsByMotorId(
        motor.id
      );
      setServiceRecords(records);
    } catch (error) {
      console.error("Gagal memuat riwayat service:", error);
    } finally {
      setLoading(false);
    }
  }, [motor]);

  useEffect(() => {
    if (motor) {
      loadServiceRecords();
    }
  }, [motor, loadServiceRecords]);

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus record service ini?")) {
      return;
    }

    setDeletingId(serviceId);
    try {
      await motorServiceService.deleteServiceRecord(serviceId);
      await loadServiceRecords();
      if (onServiceUpdate) {
        onServiceUpdate();
      }
    } catch (error) {
      console.error("Gagal menghapus service record:", error);
      alert("Gagal menghapus record service. Silakan coba lagi.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelService = async (serviceId: number) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan service ini?")) {
      return;
    }

    setCancellingId(serviceId);
    try {
      await motorServiceService.cancelService(serviceId);
      await loadServiceRecords();
      if (onServiceUpdate) {
        onServiceUpdate();
      }
    } catch (error) {
      console.error("Gagal membatalkan service:", error);
      alert("Gagal membatalkan service. Silakan coba lagi.");
    } finally {
      setCancellingId(null);
    }
  };

  const getServiceTypeBadge = (type: string) => {
    const types = {
      rutin: <Badge variant="success">Rutin</Badge>,
      berat: <Badge variant="warning">Berat</Badge>,
      perbaikan: <Badge variant="danger">Perbaikan</Badge>,
      emergency: <Badge variant="danger">Emergency</Badge>,
    };
    return (
      types[type as keyof typeof types] || (
        <Badge variant="secondary">{type}</Badge>
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      pending: <Badge variant="secondary">Pending</Badge>,
      in_progress: <Badge variant="warning">Dalam Proses</Badge>,
      completed: <Badge variant="success">Selesai</Badge>,
      cancelled: <Badge variant="danger">Dibatalkan</Badge>,
    };
    return (
      statuses[status as keyof typeof statuses] || (
        <Badge variant="secondary">{status}</Badge>
      )
    );
  };

  const canDelete = (record: ServiceRecord) => {
    return record.status !== "in_progress";
  };

  const canCancel = (record: ServiceRecord) => {
    return record.status === "pending" || record.status === "in_progress";
  };

  const isActionLoading = (recordId: number) => {
    return deletingId === recordId || cancellingId === recordId;
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${
        isDark ? "bg-black bg-opacity-70" : "bg-black bg-opacity-50"
      }`}
    >
      <div
        className={`rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto ${
          isDark ? "bg-dark-card" : "bg-white"
        }`}
      >
        <Card className={isDark ? "bg-dark-card border-dark-border" : ""}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2
                  className={`text-xl font-bold ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  Riwayat Service {motor ? `- ${motor.plat_nomor}` : ""}
                </h2>
                {motor && (
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-dark-secondary" : "text-gray-600"
                    }`}
                  >
                    {motor.merk} {motor.model} • {motor.tahun}
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div
                  className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${
                    isDark ? "border-blue-400" : "border-blue-600"
                  }`}
                ></div>
                <p
                  className={`mt-2 ${
                    isDark ? "text-dark-secondary" : "text-gray-600"
                  }`}
                >
                  Memuat riwayat service...
                </p>
              </div>
            ) : serviceRecords.length === 0 ? (
              <div
                className={`text-center py-8 ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
              >
                <p>Belum ada riwayat service</p>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      isDark
                        ? "bg-dark-secondary border-dark-border hover:bg-dark-hover"
                        : "bg-white border-gray-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className={`font-semibold ${
                              isDark ? "text-dark-primary" : "text-gray-900"
                            }`}
                          >
                            {formatDate(record.service_date)}
                          </h3>
                          {getServiceTypeBadge(record.service_type)}
                          {getStatusBadge(record.status)}
                        </div>
                        <p
                          className={`text-sm ${
                            isDark ? "text-dark-secondary" : "text-gray-600"
                          }`}
                        >
                          {record.service_location} •{" "}
                          {record.service_technician}
                        </p>
                        {record.estimated_completion && (
                          <p
                            className={`text-sm mt-1 ${
                              isDark ? "text-dark-muted" : "text-gray-500"
                            }`}
                          >
                            Estimasi selesai:{" "}
                            {formatDate(record.estimated_completion)}
                          </p>
                        )}
                        {record.actual_completion && (
                          <p
                            className={`text-sm mt-1 ${
                              isDark ? "text-green-400" : "text-green-600"
                            }`}
                          >
                            Selesai: {formatDate(record.actual_completion)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-semibold ${
                            isDark ? "text-dark-primary" : "text-gray-900"
                          }`}
                        >
                          {record.actual_cost ? (
                            formatCurrency(record.actual_cost)
                          ) : record.estimated_cost ? (
                            <span
                              className={
                                isDark ? "text-dark-secondary" : "text-gray-600"
                              }
                            >
                              Est. {formatCurrency(record.estimated_cost)}
                            </span>
                          ) : (
                            <span
                              className={
                                isDark ? "text-dark-muted" : "text-gray-400"
                              }
                            >
                              -
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-2">
                          {canCancel(record) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelService(record.id)}
                              disabled={isActionLoading(record.id)}
                            >
                              {cancellingId === record.id
                                ? "Membatalkan..."
                                : "Batalkan"}
                            </Button>
                          )}

                          {canDelete(record) && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteService(record.id)}
                              disabled={isActionLoading(record.id)}
                            >
                              {deletingId === record.id
                                ? "Menghapus..."
                                : "Hapus"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {record.parts && record.parts.length > 0 && (
                        <div>
                          <h4
                            className={`font-medium mb-1 ${
                              isDark ? "text-dark-secondary" : "text-gray-700"
                            }`}
                          >
                            Part Diganti:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {record.parts.map((part, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 text-xs rounded ${
                                  isDark
                                    ? "bg-blue-900/30 text-blue-300"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {part}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.services && record.services.length > 0 && (
                        <div>
                          <h4
                            className={`font-medium mb-1 ${
                              isDark ? "text-dark-secondary" : "text-gray-700"
                            }`}
                          >
                            Service Dilakukan:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {record.services.map((service, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 text-xs rounded ${
                                  isDark
                                    ? "bg-green-900/30 text-green-300"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {record.notes && (
                      <div className="mt-3">
                        <h4
                          className={`font-medium text-sm mb-1 ${
                            isDark ? "text-dark-secondary" : "text-gray-700"
                          }`}
                        >
                          Catatan:
                        </h4>
                        <p
                          className={`text-sm ${
                            isDark ? "text-dark-secondary" : "text-gray-600"
                          }`}
                        >
                          {record.notes}
                        </p>
                      </div>
                    )}

                    {/* Perbaikan: Gunakan properti yang ada di ServiceRecord */}
                    {(record as any).service_summary && (
                      <div className="mt-3">
                        <h4
                          className={`font-medium text-sm mb-1 ${
                            isDark ? "text-dark-secondary" : "text-gray-700"
                          }`}
                        >
                          Ringkasan Service:
                        </h4>
                        <p
                          className={`text-sm ${
                            isDark ? "text-dark-secondary" : "text-gray-600"
                          }`}
                        >
                          {(record as any).service_summary}
                        </p>
                      </div>
                    )}

                    {record.mileage_at_service && (
                      <div
                        className={`mt-2 text-xs ${
                          isDark ? "text-dark-muted" : "text-gray-500"
                        }`}
                      >
                        Kilometer saat service:{" "}
                        {record.mileage_at_service.toLocaleString()} km
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServiceHistory;
