import React from "react";
import {
  Control,
  FieldErrors,
  UseFormRegister,
  Controller,
} from "react-hook-form";
import { CheckboxGroup } from "../../ui/CheckboxGroup";
import DateTimeInput from "./DateTimeInput";
import { useTheme } from "../../../hooks/useTheme";

// ✅ Define proper types
interface Motor {
  id: number;
  plat_nomor: string;
  merk: string;
  model: string;
  harga: number;
  status: string;
}

interface Penyewa {
  id: number;
  nama: string;
  no_whatsapp: string;
  is_blacklisted: boolean;
}

interface Sewa {
  id?: number;
  motor_id?: number;
  penyewa_id?: number;
}

// ✅ Define form data type
interface SewaFormData {
  motor_id: number;
  penyewa_id: number;
  tgl_sewa: string;
  tgl_kembali: string;
  jaminan: string[];
  pembayaran?: "Cash" | "Transfer";
  additional_costs?: Array<{
    description: string;
    amount: number;
    type: "discount" | "additional";
  }>;
  catatan_tambahan?: string;
}

interface BasicInfoSectionProps {
  register: UseFormRegister<SewaFormData>;
  errors: FieldErrors<SewaFormData>;
  control: Control<SewaFormData>;
  motors: Motor[];
  penyewas: Penyewa[];
  sewa?: Sewa;
  getMinDateTime: () => string;
  getMinReturnDateTime: () => string;
}

const JAMINAN_OPTIONS = [
  { value: "KTP", label: "KTP" },
  { value: "KK", label: "Kartu Keluarga" },
  { value: "SIM", label: "SIM" },
  { value: "Motor", label: "Motor" },
  { value: "Deposito", label: "Deposito" },
];

const PEMBAYARAN_OPTIONS = [
  { value: "Cash", label: "Cash" },
  { value: "Transfer", label: "Transfer" },
];

// Custom Select Component dengan fitur pencarian
interface SearchableSelectProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  options: Array<{ value: number; label: string }>;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  error,
  options,
  required = false,
  disabled = false,
  placeholder = "Ketik untuk mencari...",
}) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((option) => option.value === value);

  React.useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    }
  }, [selectedOption]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);

    // Reset value jika input dihapus
    if (newValue === "") {
      onChange(0);
    }
  };

  const handleOptionClick = (optionValue: number, optionLabel: string) => {
    onChange(optionValue);
    setSearchTerm(optionLabel);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!value) {
      setSearchTerm("");
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow option click
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative">
      <label
        className={`block text-sm font-medium mb-1 ${
          isDark ? "text-dark-secondary" : "text-gray-700"
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            error
              ? "border-red-500"
              : isDark
              ? "border-dark-border bg-dark-secondary text-dark-primary"
              : "border-gray-300 bg-white text-gray-900"
          } ${
            disabled
              ? isDark
                ? "bg-dark-secondary/50 cursor-not-allowed"
                : "bg-gray-100 cursor-not-allowed"
              : ""
          }`}
        />

        {isOpen && !disabled && (
          <div
            className={`absolute z-10 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-auto ${
              isDark
                ? "bg-dark-card border-dark-border"
                : "bg-white border-gray-300"
            }`}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    option.value === value
                      ? isDark
                        ? "bg-blue-900/30 text-blue-300"
                        : "bg-blue-100 text-blue-900"
                      : isDark
                      ? "hover:bg-dark-hover text-dark-primary"
                      : "hover:bg-blue-50 text-gray-900"
                  }`}
                  onMouseDown={() =>
                    handleOptionClick(option.value, option.label)
                  }
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div
                className={`px-3 py-2 ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
              >
                Tidak ada hasil ditemukan
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  register,
  errors,
  control,
  motors,
  penyewas,
  sewa,
  getMinDateTime,
  getMinReturnDateTime,
}) => {
  const { isDark } = useTheme();

  const motorOptions = motors
    .filter(
      (motor) => motor.status === "tersedia" || motor.id === sewa?.motor_id
    )
    .map((motor) => ({
      value: motor.id,
      label: `${motor.merk} ${motor.model} (${
        motor.plat_nomor
      }) - Rp ${motor.harga?.toLocaleString()}/hari`,
    }));

  const penyewaOptions = penyewas
    .filter((p) => !p.is_blacklisted || p.id === sewa?.penyewa_id)
    .map((penyewa) => ({
      value: penyewa.id,
      label: `${penyewa.nama} (${penyewa.no_whatsapp})`,
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* SearchableSelect untuk Motor */}
      <Controller
        name="motor_id"
        control={control}
        rules={{ required: "Pilih motor" }}
        render={({ field, fieldState }) => (
          <SearchableSelect
            label="Pilih Motor"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            options={motorOptions}
            required
            disabled={!!sewa}
            placeholder="Ketik merk, model, atau plat nomor..."
          />
        )}
      />

      {/* SearchableSelect untuk Penyewa */}
      <Controller
        name="penyewa_id"
        control={control}
        rules={{ required: "Pilih penyewa" }}
        render={({ field, fieldState }) => (
          <SearchableSelect
            label="Pilih Penyewa"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            options={penyewaOptions}
            required
            disabled={!!sewa}
            placeholder="Ketik nama atau nomor WhatsApp..."
          />
        )}
      />

      <DateTimeInput
        label="Tanggal Sewa"
        register={register("tgl_sewa")}
        error={errors.tgl_sewa?.message}
        min={getMinDateTime()}
        disabled={!!sewa}
        note="Pilih tanggal dan waktu mulai sewa"
        disabledNote={sewa ? " (Tidak dapat diubah)" : ""}
      />

      <DateTimeInput
        label="Tanggal Kembali"
        register={register("tgl_kembali")}
        error={errors.tgl_kembali?.message}
        min={getMinReturnDateTime()}
        note="Pilih tanggal dan waktu pengembalian"
        disabledNote={sewa ? " - Dapat diubah untuk menyesuaikan durasi" : ""}
      />

      {/* Metode Pembayaran */}
      <div>
        <label
          className={`block text-sm font-medium mb-1 ${
            isDark ? "text-dark-secondary" : "text-gray-700"
          }`}
        >
          Metode Pembayaran
        </label>
        <select
          {...register("pembayaran")}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.pembayaran
              ? "border-red-500"
              : isDark
              ? "border-dark-border bg-dark-secondary text-dark-primary"
              : "border-gray-300 bg-white text-gray-900"
          }`}
        >
          <option value="">Pilih metode pembayaran</option>
          {PEMBAYARAN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.pembayaran && (
          <p className="mt-1 text-sm text-red-600">
            {errors.pembayaran.message}
          </p>
        )}
      </div>

      {/* Placeholder untuk alignment */}
      <div></div>

      {/* Jaminan */}
      <div className="md:col-span-2">
        <Controller
          name="jaminan"
          control={control}
          rules={{ required: "Pilih minimal 1 jaminan" }}
          render={({ field, fieldState }) => (
            <CheckboxGroup
              label="Jaminan *"
              options={JAMINAN_OPTIONS}
              value={field.value || []}
              onChange={field.onChange}
              error={fieldState.error?.message}
              required
            />
          )}
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
