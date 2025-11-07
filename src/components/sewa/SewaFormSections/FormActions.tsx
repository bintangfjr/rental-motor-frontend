import React from "react";
import { Button } from "../../ui/Button";
import { useTheme } from "../../../hooks/useTheme";

interface FormActionsProps {
  isEdit: boolean;
  isLoading: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  isEdit,
  isLoading,
  onCancel,
  showCancel = true,
}) => {
  const { isDark } = useTheme();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className={`flex gap-4 pt-6 border-t ${
        isDark ? "border-dark-border" : "border-gray-200"
      }`}
    >
      <Button
        type="submit"
        isLoading={isLoading}
        className="flex-1 sm:flex-none"
      >
        {isEdit ? "Update Sewa" : "Tambah Sewa"}
      </Button>

      {showCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1 sm:flex-none"
        >
          Batal
        </Button>
      )}
    </div>
  );
};

export default FormActions;
