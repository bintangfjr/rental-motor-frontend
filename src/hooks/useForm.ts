import { useState, useCallback } from "react";
import { ZodTypeAny, ZodObject } from "zod";

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ZodTypeAny;
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (name: keyof T, value: unknown) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (name: keyof T, value: unknown) => void;
  setFieldError: (name: keyof T, error: string) => void;
  resetForm: (values?: T) => void;
  validateForm: () => Promise<boolean>;
}

interface ZodError {
  errors: Array<{
    path: string[];
    message: string;
  }>;
}

export const useForm = <T extends Record<string, unknown>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    async (name: keyof T, value: unknown) => {
      if (!validationSchema) return true;

      try {
        if (validationSchema instanceof ZodObject) {
          const fieldSchema = validationSchema.pick({ [name]: true } as Record<
            keyof T,
            true
          >);
          await fieldSchema.parseAsync({ [name]: value });
        } else {
          await validationSchema.parseAsync({ [name]: value });
        }
        return true;
      } catch (error) {
        const zodError = error as ZodError;
        return zodError.errors?.[0]?.message || "Invalid value";
      }
    },
    [validationSchema]
  );

  const validateForm = useCallback(async (): Promise<boolean> => {
    if (!validationSchema) return true;

    try {
      await validationSchema.parseAsync(values);
      setErrors({});
      return true;
    } catch (error) {
      const zodError = error as ZodError;
      const newErrors: Record<string, string> = {};

      if (zodError.errors) {
        zodError.errors.forEach((err) => {
          const path = err.path?.[0];
          if (path && typeof path === "string") {
            newErrors[path] = err.message;
          }
        });
      }
      setErrors(newErrors);
      return false;
    }
  }, [validationSchema, values]);

  const handleChange = useCallback(
    async (name: keyof T, value: unknown) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      if (touched[name as string]) {
        const error = await validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: typeof error === "string" ? error : "",
        }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback((name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name as string]: true }));
  }, []);

  const setFieldValue = useCallback((name: keyof T, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name as string]: error }));
  }, []);

  const resetForm = useCallback(
    (newValues?: T) => {
      setValues(newValues || initialValues);
      setErrors({});
      setTouched({});
    },
    [initialValues]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setIsSubmitting(true);

      try {
        const allTouched = Object.keys(values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setTouched(allTouched);

        const isValid = await validateForm();
        if (!isValid) return;

        await onSubmit?.(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit, validateForm]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateForm,
  };
};

// Specialized form hooks
export const useFormWithValidation = <T extends Record<string, unknown>>(
  schema: ZodTypeAny,
  initialValues: T,
  onSubmit?: (values: T) => void | Promise<void>
) => {
  return useForm({
    initialValues,
    validationSchema: schema,
    onSubmit,
  });
};

export const useQuickForm = <T extends Record<string, unknown>>(
  initialValues: T
) => {
  return useForm({
    initialValues,
    onSubmit: () => {},
  });
};
