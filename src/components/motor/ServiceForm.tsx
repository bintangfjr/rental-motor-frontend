import React, { useState } from "react";
import { Motor } from "../../types/motor";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTheme } from "../../hooks/useTheme";

// Types untuk form data
interface ServiceFormData {
  service_type: "rutin" | "berat" | "perbaikan" | "emergency";
  service_location: string;
  service_technician: string;
  estimated_cost: string;
  estimated_completion: string;
  parts: string[];
  services: string[];
  notes: string;
  service_notes: string;
}

interface ServiceSubmitData {
  service_type: "rutin" | "berat" | "perbaikan" | "emergency";
  service_location: string;
  service_technician: string;
  parts: string[];
  services: string[];
  estimated_cost: number;
  estimated_completion?: string;
  notes?: string;
  service_notes?: string;
}

interface ServiceFormProps {
  motor: Motor;
  onSave: (serviceData: ServiceSubmitData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  motor,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const { isDark } = useTheme();

  const [formData, setFormData] = useState<ServiceFormData>({
    service_type: "rutin",
    service_location: "",
    service_technician: "",
    estimated_cost: "",
    estimated_completion: "",
    parts: [],
    services: [],
    notes: "",
    service_notes: "",
  });

  const [newPart, setNewPart] = useState("");
  const [newService, setNewService] = useState("");

  const commonParts = [
    "Oli Mesin",
    "Filter Oli",
    "Filter Udara",
    "Busi",
    "Kampas Rem",
    "Rantai",
    "Ban Depan",
    "Ban Belakang",
    "Lampu",
    "Aki",
  ];

  const commonServices = [
    "Ganti Oli",
    "Service Rem",
    "Service Rantai",
    "Setel Karburator",
    "Service Lampu",
    "Check Aki",
    "Service Ban",
    "Tune Up",
    "Service Kelistrikan",
    "General Check",
  ];

  const handleAddPart = () => {
    if (newPart.trim() && !formData.parts.includes(newPart.trim())) {
      setFormData((prev) => ({
        ...prev,
        parts: [...prev.parts, newPart.trim()],
      }));
      setNewPart("");
    }
  };

  const handleRemovePart = (part: string) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((p) => p !== part),
    }));
  };

  const handleAddService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService("");
    }
  };

  const handleRemoveService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format data sesuai dengan backend
    const serviceData: ServiceSubmitData = {
      service_type: formData.service_type,
      service_location: formData.service_location,
      service_technician: formData.service_technician,
      parts: formData.parts,
      services: formData.services,
      estimated_cost: formData.estimated_cost
        ? Number(formData.estimated_cost)
        : 0,
      estimated_completion: formData.estimated_completion || undefined,
      notes: formData.notes || undefined,
      service_notes: formData.service_notes || undefined,
    };

    onSave(serviceData);
  };

  // Styling untuk dark mode
  const inputClass = `w-full p-2 border rounded-md transition-colors ${
    isDark
      ? "bg-dark-secondary border-dark-border text-dark-primary focus:ring-brand-blue focus:border-brand-blue"
      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
  }`;

  const labelClass = `block text-sm font-medium mb-2 ${
    isDark ? "text-dark-secondary" : "text-gray-700"
  }`;

  const infoBoxClass = `p-4 rounded-lg mb-6 ${
    isDark ? "bg-dark-accent border-dark-border" : "bg-gray-50 border-gray-200"
  } border`;

  const selectedItemsClass = (color: string) => {
    const baseClasses = "border rounded-md p-3";
    if (isDark) {
      return `${baseClasses} bg-${color}-900/20 border-${color}-800 text-${color}-300`;
    }
    return `${baseClasses} bg-${color}-50 border-${color}-200 text-${color}-800`;
  };

  const tagClass = (color: string) => {
    const baseClasses =
      "inline-flex items-center px-2 py-1 text-xs rounded border";
    if (isDark) {
      return `${baseClasses} bg-${color}-900/30 border-${color}-800 text-${color}-300`;
    }
    return `${baseClasses} bg-${color}-100 border-${color}-200 text-${color}-800`;
  };

  const quickButtonClass = (color: string, isSelected: boolean) => {
    const baseClasses = "px-2 py-1 text-xs rounded transition-colors";
    if (isDark) {
      return `${baseClasses} ${
        isSelected
          ? `bg-${color}-600 text-white`
          : `bg-${color}-900/30 text-${color}-300 hover:bg-${color}-800`
      }`;
    }
    return `${baseClasses} ${
      isSelected
        ? `bg-${color}-600 text-white`
        : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
    }`;
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${
        isDark ? "bg-black/70" : "bg-black/50"
      }`}
    >
      <div
        className={`rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
          isDark ? "bg-dark-card" : "bg-white"
        }`}
      >
        <Card>
          <div className="p-6">
            <h2
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Form Service Motor
            </h2>

            {/* Motor Info */}
            <div className={infoBoxClass}>
              <h3
                className={`font-semibold mb-2 ${
                  isDark ? "text-dark-primary" : "text-gray-900"
                }`}
              >
                Informasi Motor
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span
                    className={isDark ? "text-dark-secondary" : "text-gray-600"}
                  >
                    Plat Nomor:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {motor.plat_nomor}
                  </p>
                </div>
                <div>
                  <span
                    className={isDark ? "text-dark-secondary" : "text-gray-600"}
                  >
                    Merk/Model:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {motor.merk} {motor.model}
                  </p>
                </div>
                <div>
                  <span
                    className={isDark ? "text-dark-secondary" : "text-gray-600"}
                  >
                    Tahun:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {motor.tahun}
                  </p>
                </div>
                <div>
                  <span
                    className={isDark ? "text-dark-secondary" : "text-gray-600"}
                  >
                    Jarak Tempuh:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {motor.total_mileage || 0} km
                  </p>
                </div>
                <div>
                  <span
                    className={isDark ? "text-dark-secondary" : "text-gray-600"}
                  >
                    Status:
                  </span>
                  <p
                    className={`font-medium capitalize ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {motor.status}
                  </p>
                </div>
                <div>
                  <span
                    className={isDark ? "text-dark-secondary" : "text-gray-600"}
                  >
                    Terakhir Service:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {motor.last_service_date
                      ? new Date(motor.last_service_date).toLocaleDateString(
                          "id-ID"
                        )
                      : "Belum pernah"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Type */}
              <div>
                <label className={labelClass}>Jenis Service *</label>
                <select
                  value={formData.service_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      service_type: e.target.value as
                        | "rutin"
                        | "berat"
                        | "perbaikan"
                        | "emergency",
                    }))
                  }
                  className={inputClass}
                  required
                >
                  <option value="rutin">Service Rutin</option>
                  <option value="berat">Service Berat</option>
                  <option value="perbaikan">Perbaikan</option>
                  <option value="emergency">Emergency</option>
                </select>
                <p
                  className={`text-xs mt-1 ${
                    isDark ? "text-dark-muted" : "text-gray-500"
                  }`}
                >
                  Pilih jenis service yang akan dilakukan
                </p>
              </div>

              {/* Service Location */}
              <div>
                <label className={labelClass}>Lokasi Service *</label>
                <input
                  type="text"
                  value={formData.service_location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      service_location: e.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="Contoh: Bengkel Motor Jaya, Jl. Merdeka No. 123"
                  required
                />
              </div>

              {/* Technician */}
              <div>
                <label className={labelClass}>Nama Teknisi *</label>
                <input
                  type="text"
                  value={formData.service_technician}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      service_technician: e.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="Masukkan nama teknisi..."
                  required
                />
              </div>

              {/* Parts */}
              <div>
                <label className={labelClass}>Part yang Diganti</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPart}
                      onChange={(e) => setNewPart(e.target.value)}
                      className={inputClass}
                      placeholder="Tambah part..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddPart();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddPart}>
                      Tambah
                    </Button>
                  </div>

                  {/* Common Parts */}
                  <div>
                    <p
                      className={`text-xs mb-1 ${
                        isDark ? "text-dark-muted" : "text-gray-500"
                      }`}
                    >
                      Part umum:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {commonParts.map((part) => {
                        const isSelected = formData.parts.includes(part);
                        return (
                          <button
                            key={part}
                            type="button"
                            onClick={() => {
                              if (!isSelected) {
                                setFormData((prev) => ({
                                  ...prev,
                                  parts: [...prev.parts, part],
                                }));
                              }
                            }}
                            className={quickButtonClass("blue", isSelected)}
                            disabled={isSelected}
                          >
                            {part}
                            {isSelected && " ✓"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Parts */}
                  {formData.parts.length > 0 && (
                    <div className={selectedItemsClass("green")}>
                      <h4 className="text-sm font-medium mb-2">
                        Part Terpilih ({formData.parts.length}):
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {formData.parts.map((part) => (
                          <span key={part} className={tagClass("green")}>
                            {part}
                            <button
                              type="button"
                              onClick={() => handleRemovePart(part)}
                              className="ml-1 font-bold hover:opacity-70"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Services */}
              <div>
                <label className={labelClass}>
                  Jenis Service yang Dilakukan
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      className={inputClass}
                      placeholder="Tambah jenis service..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddService();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddService}>
                      Tambah
                    </Button>
                  </div>

                  {/* Common Services */}
                  <div>
                    <p
                      className={`text-xs mb-1 ${
                        isDark ? "text-dark-muted" : "text-gray-500"
                      }`}
                    >
                      Service umum:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {commonServices.map((service) => {
                        const isSelected = formData.services.includes(service);
                        return (
                          <button
                            key={service}
                            type="button"
                            onClick={() => {
                              if (!isSelected) {
                                setFormData((prev) => ({
                                  ...prev,
                                  services: [...prev.services, service],
                                }));
                              }
                            }}
                            className={quickButtonClass("purple", isSelected)}
                            disabled={isSelected}
                          >
                            {service}
                            {isSelected && " ✓"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Services */}
                  {formData.services.length > 0 && (
                    <div className={selectedItemsClass("purple")}>
                      <h4 className="text-sm font-medium mb-2">
                        Service Terpilih ({formData.services.length}):
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {formData.services.map((service) => (
                          <span key={service} className={tagClass("purple")}>
                            {service}
                            <button
                              type="button"
                              onClick={() => handleRemoveService(service)}
                              className="ml-1 font-bold hover:opacity-70"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost and Completion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Perkiraan Biaya (Rp)</label>
                  <input
                    type="number"
                    value={formData.estimated_cost}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estimated_cost: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="0"
                    min="0"
                  />
                  <p
                    className={`text-xs mt-1 ${
                      isDark ? "text-dark-muted" : "text-gray-500"
                    }`}
                  >
                    Biaya estimasi untuk service
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Perkiraan Selesai</label>
                  <input
                    type="date"
                    value={formData.estimated_completion}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estimated_completion: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className={inputClass}
                  />
                  <p
                    className={`text-xs mt-1 ${
                      isDark ? "text-dark-muted" : "text-gray-500"
                    }`}
                  >
                    Perkiraan tanggal penyelesaian service
                  </p>
                </div>
              </div>

              {/* Service Notes */}
              <div>
                <label className={labelClass}>Catatan Service</label>
                <textarea
                  value={formData.service_notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      service_notes: e.target.value,
                    }))
                  }
                  rows={2}
                  className={inputClass}
                  placeholder="Catatan khusus tentang service (opsional)..."
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className={labelClass}>Catatan Tambahan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  className={inputClass}
                  placeholder="Masukkan catatan tambahan tentang kondisi motor atau keluhan (opsional)..."
                />
              </div>

              {/* Summary */}
              <div
                className={`border rounded-lg p-4 ${
                  isDark
                    ? "bg-blue-900/20 border-blue-800 text-blue-300"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                }`}
              >
                <h4 className="font-medium mb-2">Ringkasan Service</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Motor:</strong> {motor.plat_nomor} - {motor.merk}{" "}
                    {motor.model}
                  </p>
                  <p>
                    <strong>Jenis Service:</strong> {formData.service_type}
                  </p>
                  <p>
                    <strong>Lokasi:</strong> {formData.service_location || "-"}
                  </p>
                  <p>
                    <strong>Teknisi:</strong>{" "}
                    {formData.service_technician || "-"}
                  </p>
                  <p>
                    <strong>Part:</strong> {formData.parts.length} item
                  </p>
                  <p>
                    <strong>Service:</strong> {formData.services.length} jenis
                  </p>
                  {formData.estimated_cost && (
                    <p>
                      <strong>Estimasi Biaya:</strong> Rp{" "}
                      {parseInt(formData.estimated_cost).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div
                className={`flex justify-end space-x-3 pt-4 border-t ${
                  isDark ? "border-dark-border" : "border-gray-200"
                }`}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={
                    !formData.service_location || !formData.service_technician
                  }
                >
                  Mulai Service
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServiceForm;
