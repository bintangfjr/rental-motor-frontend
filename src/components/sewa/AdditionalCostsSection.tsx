import React from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

interface AdditionalCostItem {
  description: string;
  amount: number;
  type: "discount" | "additional";
}

interface AdditionalCostsSectionProps {
  additionalCosts: AdditionalCostItem[];
  onAddCost: () => void;
  onRemoveCost: (index: number) => void;
  onUpdateCost: (
    index: number,
    field: keyof AdditionalCostItem,
    value: string | number
  ) => void;
}

const ADDITIONAL_COST_TYPE_OPTIONS = [
  { value: "additional", label: "Biaya Tambahan" },
  { value: "discount", label: "Potongan/Diskon" },
];

const AdditionalCostsSection: React.FC<AdditionalCostsSectionProps> = ({
  additionalCosts,
  onAddCost,
  onRemoveCost,
  onUpdateCost,
}) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">
          Biaya Tambahan & Potongan
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={onAddCost}>
          + Tambah Biaya
        </Button>
      </div>

      {additionalCosts.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          Belum ada biaya tambahan atau potongan
        </p>
      ) : (
        <div className="space-y-3">
          {additionalCosts.map((cost, index) => (
            <AdditionalCostItemRow
              key={index}
              cost={cost}
              index={index}
              onUpdate={onUpdateCost}
              onRemove={onRemoveCost}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ Sub-komponen untuk Additional Cost Item
interface AdditionalCostItemRowProps {
  cost: AdditionalCostItem;
  index: number;
  onUpdate: (
    index: number,
    field: keyof AdditionalCostItem,
    value: string | number
  ) => void;
  onRemove: (index: number) => void;
}

const AdditionalCostItemRow: React.FC<AdditionalCostItemRowProps> = ({
  cost,
  index,
  onUpdate,
  onRemove,
}) => {
  // ✅ Handler untuk input change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "description", e.target.value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "amount", Number(e.target.value));
  };

  // ✅ PERBAIKAN: Handler untuk select change yang compatible dengan HTMLSelectElement
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(index, "type", e.target.value as "discount" | "additional");
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded">
      <div className="col-span-5">
        <Input
          label="Deskripsi"
          value={cost.description}
          onChange={handleDescriptionChange}
          placeholder="Contoh: Biaya helm, Potongan member, dll."
        />
      </div>
      <div className="col-span-3">
        <Select
          label="Tipe"
          value={cost.type}
          onChange={handleTypeChange}
          options={ADDITIONAL_COST_TYPE_OPTIONS}
        />
      </div>
      <div className="col-span-3">
        <Input
          label="Jumlah (Rp)"
          type="number"
          value={cost.amount}
          onChange={handleAmountChange}
          min="0"
        />
      </div>
      <div className="col-span-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-700"
        >
          Hapus
        </Button>
      </div>
    </div>
  );
};

export default AdditionalCostsSection;
