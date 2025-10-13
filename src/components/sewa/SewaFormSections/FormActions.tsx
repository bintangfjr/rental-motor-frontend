import React from "react";
import { Button } from "../../ui/Button";

interface FormActionsProps {
  isEdit: boolean;
  isLoading: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ isEdit, isLoading }) => (
  <div className="flex gap-4">
    <Button type="submit" isLoading={isLoading}>
      {isEdit ? "Update Sewa" : "Tambah Sewa"}
    </Button>

    {isEdit && (
      <Button
        type="button"
        variant="outline"
        onClick={() => window.history.back()}
      >
        Batal
      </Button>
    )}
  </div>
);

export default FormActions;
