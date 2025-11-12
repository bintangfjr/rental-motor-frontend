import React from "react";
import { Button } from "../../ui/Button";
import { useTheme } from "../../../hooks/useTheme";

interface FormActionsProps {
  isEdit: boolean;
  isLoading: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

const FormActions: React.FC<FormActionsProps> = ({
  isEdit,
  isLoading,
  onCancel,
  showCancel = true,
  submitLabel,
  cancelLabel = "Batal",
}) => {
  const { isDark } = useTheme();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Fallback ke history back dengan konfirmasi jika ada perubahan
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/sewas"; // Fallback ke list sewa
      }
    }
  };

  const getSubmitLabel = () => {
    if (submitLabel) return submitLabel;
    return isEdit ? "Update Sewa" : "Buat Sewa";
  };

  return (
    <div
      className={`flex flex-col sm:flex-row gap-3 pt-6 border-t ${
        isDark ? "border-dark-border" : "border-gray-200"
      }`}
    >
      <Button
        type="submit"
        isLoading={isLoading}
        loadingText={isEdit ? "Mengupdate..." : "Membuat..."}
        className="flex-1 sm:flex-none order-2 sm:order-1"
        size="lg"
      >
        {getSubmitLabel()}
      </Button>

      {showCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1 sm:flex-none order-1 sm:order-2"
          size="lg"
        >
          {cancelLabel}
        </Button>
      )}
    </div>
  );
};

export default FormActions;
