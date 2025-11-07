import { VALIDATION } from "./constants";
import { isString, isNumber, isDate } from "./helpers";

/**
 * Validation utilities menggunakan Zod-like pattern
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Base validator functions
export const required = (value: any): ValidationResult => {
  const isValid = value !== null && value !== undefined && value !== "";
  return {
    isValid,
    errors: isValid ? [] : ["Field ini wajib diisi"],
  };
};

export const minLength =
  (min: number) =>
  (value: string): ValidationResult => {
    const isValid = isString(value) && value.length >= min;
    return {
      isValid,
      errors: isValid ? [] : [`Minimal ${min} karakter`],
    };
  };

export const maxLength =
  (max: number) =>
  (value: string): ValidationResult => {
    const isValid = isString(value) && value.length <= max;
    return {
      isValid,
      errors: isValid ? [] : [`Maksimal ${max} karakter`],
    };
  };

export const email = (value: string): ValidationResult => {
  const isValid = VALIDATION.EMAIL_REGEX.test(value);
  return {
    isValid,
    errors: isValid ? [] : ["Format email tidak valid"],
  };
};

export const phone = (value: string): ValidationResult => {
  const isValid = VALIDATION.PHONE_REGEX.test(value);
  return {
    isValid,
    errors: isValid ? [] : ["Format nomor telepon tidak valid"],
  };
};

export const platNomor = (value: string): ValidationResult => {
  const isValid = VALIDATION.PLAT_NOMOR_REGEX.test(value);
  return {
    isValid,
    errors: isValid ? [] : ["Format plat nomor tidak valid"],
  };
};

export const minValue =
  (min: number) =>
  (value: number): ValidationResult => {
    const isValid = isNumber(value) && value >= min;
    return {
      isValid,
      errors: isValid ? [] : [`Nilai minimal ${min}`],
    };
  };

export const maxValue =
  (max: number) =>
  (value: number): ValidationResult => {
    const isValid = isNumber(value) && value <= max;
    return {
      isValid,
      errors: isValid ? [] : [`Nilai maksimal ${max}`],
    };
  };

export const number = (value: any): ValidationResult => {
  const isValid = !isNaN(parseFloat(value)) && isFinite(value);
  return {
    isValid,
    errors: isValid ? [] : ["Harus berupa angka"],
  };
};

export const integer = (value: any): ValidationResult => {
  const isValid = Number.isInteger(Number(value));
  return {
    isValid,
    errors: isValid ? [] : ["Harus berupa bilangan bulat"],
  };
};

export const date = (value: any): ValidationResult => {
  const isValid = isDate(new Date(value)) && !isNaN(new Date(value).getTime());
  return {
    isValid,
    errors: isValid ? [] : ["Format tanggal tidak valid"],
  };
};

export const futureDate = (value: Date): ValidationResult => {
  const isValid = value > new Date();
  return {
    isValid,
    errors: isValid ? [] : ["Tanggal harus di masa depan"],
  };
};

export const pastDate = (value: Date): ValidationResult => {
  const isValid = value < new Date();
  return {
    isValid,
    errors: isValid ? [] : ["Tanggal harus di masa lalu"],
  };
};

export const url = (value: string): ValidationResult => {
  try {
    new URL(value);
    return { isValid: true, errors: [] };
  } catch {
    return { isValid: false, errors: ["Format URL tidak valid"] };
  }
};

export const oneOf =
  (allowedValues: any[]) =>
  (value: any): ValidationResult => {
    const isValid = allowedValues.includes(value);
    return {
      isValid,
      errors: isValid
        ? []
        : [`Nilai harus salah satu dari: ${allowedValues.join(", ")}`],
    };
  };

export const match =
  (fieldName: string, compareValue: any) =>
  (value: any): ValidationResult => {
    const isValid = value === compareValue;
    return {
      isValid,
      errors: isValid ? [] : [`Tidak cocok dengan ${fieldName}`],
    };
  };

// Composite validators
export const createValidator = (
  ...validators: ((value: any) => ValidationResult)[]
) => {
  return (value: any): ValidationResult => {
    const errors: string[] = [];

    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        errors.push(...result.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };
};

// Schema validators untuk forms
export const motorValidator = {
  plat_nomor: createValidator(required, platNomor, maxLength(20)),
  merk: createValidator(required, maxLength(255)),
  model: createValidator(required, maxLength(255)),
  tahun: createValidator(
    required,
    integer,
    minValue(1990),
    maxValue(new Date().getFullYear() + 1)
  ),
  harga: createValidator(required, number, minValue(0)),
  no_gsm: createValidator(maxLength(20)),
  imei: createValidator(maxLength(20)),
  status: createValidator(
    required,
    oneOf(Object.values(VALIDATION.MOTOR_STATUS))
  ),
};

export const penyewaValidator = {
  nama: createValidator(required, maxLength(255)),
  alamat: createValidator(maxLength(500)),
  no_whatsapp: createValidator(required, phone, maxLength(20)),
};

export const sewaValidator = {
  id_motor: createValidator(required, number),
  id_penyewa: createValidator(required, number),
  tgl_sewa: createValidator(required, date),
  tgl_kembali: createValidator(required, date),
  jaminan: createValidator(required, (value: string[]) => ({
    isValid: Array.isArray(value) && value.length > 0,
    errors: value.length === 0 ? ["Pilih minimal 1 jaminan"] : [],
  })),
  pembayaran: createValidator(
    required,
    oneOf(Object.values(VALIDATION.PEMBAYARAN_TYPES))
  ),
};

export const profileValidator = {
  nama_lengkap: createValidator(required, maxLength(255)),
  username: createValidator(required, minLength(3), maxLength(255)),
  email: createValidator(required, email, maxLength(255)),
};

export const passwordValidator = {
  password: createValidator(
    required,
    minLength(VALIDATION.PASSWORD_MIN_LENGTH),
    (value: string) => ({
      isValid: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value),
      errors: ["Password harus mengandung huruf besar, huruf kecil, dan angka"],
    })
  ),
  password_confirmation: createValidator(required),
};

// Utility functions
export const validateForm = (
  values: Record<string, any>,
  validators: Record<string, (value: any) => ValidationResult>
) => {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  Object.entries(validators).forEach(([field, validator]) => {
    const result = validator(values[field]);
    if (!result.isValid) {
      errors[field] = result.errors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

export const getFirstError = (
  errors: Record<string, string[]>
): string | null => {
  for (const fieldErrors of Object.values(errors)) {
    if (fieldErrors.length > 0) {
      return fieldErrors[0];
    }
  }
  return null;
};

export const hasErrors = (errors: Record<string, string[]>): boolean => {
  return Object.values(errors).some((fieldErrors) => fieldErrors.length > 0);
};

export default {
  // Base validators
  required,
  minLength,
  maxLength,
  email,
  phone,
  platNomor,
  minValue,
  maxValue,
  number,
  integer,
  date,
  futureDate,
  pastDate,
  url,
  oneOf,
  match,

  // Composite validators
  createValidator,

  // Schema validators
  motorValidator,
  penyewaValidator,
  sewaValidator,
  profileValidator,
  passwordValidator,

  // Utility functions
  validateForm,
  getFirstError,
  hasErrors,
};
