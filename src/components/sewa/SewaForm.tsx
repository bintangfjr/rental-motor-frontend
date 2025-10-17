import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sewa, CreateSewaData, UpdateSewaData } from "../../types/sewa";
import AdditionalCostsSection from "./AdditionalCostsSection";
import SewaNotes from "./SewaNotes";
import RentalSummary from "./RentalSummary";
import BasicInfoSection from "./SewaFormSections/BasicInfoSection";
import FormActions from "./SewaFormSections/FormActions";
import EditModeInfo from "./SewaFormSections/EditModeInfo";
import { formatUTCtoWIBForInput, convertInputToUTC } from "../../utils/date";

// Schema untuk create/update
const sewaSchema = z.object({
  motor_id: z.number().min(1, "Pilih motor"),
  penyewa_id: z.number().min(1, "Pilih penyewa"),
  tgl_sewa: z.string().min(1, "Tanggal sewa wajib diisi"),
  tgl_kembali: z.string().min(1, "Tanggal kembali wajib diisi"),
  jaminan: z.array(z.string()).min(1, "Pilih minimal 1 jaminan"),
  pembayaran: z.enum(["Cash", "Transfer"]).optional(),
  additional_costs: z
    .array(
      z.object({
        description: z.string().min(1, "Deskripsi wajib diisi"),
        amount: z.number().min(0, "Jumlah tidak boleh negatif"),
        type: z.enum(["discount", "additional"]),
      })
    )
    .optional(),
  catatan_tambahan: z.string().optional(),
});

type SewaFormData = z.infer<typeof sewaSchema>;

interface SewaFormProps {
  sewa?: Sewa;
  motors: Motor[];
  penyewas: Penyewa[];
  onSubmit: (data: CreateSewaData | UpdateSewaData) => void;
  isLoading?: boolean;
}

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

const SewaForm: React.FC<SewaFormProps> = ({
  sewa,
  motors,
  penyewas,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<SewaFormData>({
    resolver: zodResolver(sewaSchema),
    defaultValues: sewa
      ? {
          motor_id: sewa.motor_id,
          penyewa_id: sewa.penyewa_id,
          tgl_sewa: formatUTCtoWIBForInput(sewa.tgl_sewa as string),
          tgl_kembali: formatUTCtoWIBForInput(sewa.tgl_kembali as string),
          jaminan: Array.isArray(sewa.jaminan)
            ? sewa.jaminan
            : typeof sewa.jaminan === "string"
            ? sewa.jaminan.split(",").map((j) => j.trim())
            : [],
          pembayaran: (sewa.pembayaran as "Cash" | "Transfer") || "Cash",
          additional_costs: Array.isArray(sewa.additional_costs)
            ? sewa.additional_costs
            : [],
          catatan_tambahan: sewa.catatan_tambahan || "",
        }
      : {
          jaminan: [],
          additional_costs: [],
          pembayaran: "Cash",
          catatan_tambahan: "",
        },
  });

  const watchTglSewa = watch("tgl_sewa");
  const watchTglKembali = watch("tgl_kembali");
  const watchIdMotor = watch("motor_id");
  const watchAdditionalCosts = watch("additional_costs") || [];
  const watchCatatanTambahan = watch("catatan_tambahan");

  // Submit handler
  const handleFormSubmit = (data: SewaFormData) => {
    if (sewa) {
      const updateData: UpdateSewaData = {
        tgl_kembali: convertInputToUTC(data.tgl_kembali),
        jaminan: data.jaminan,
        pembayaran: data.pembayaran,
        additional_costs: data.additional_costs,
        catatan_tambahan: data.catatan_tambahan,
      };
      onSubmit(updateData);
    } else {
      const createData: CreateSewaData = {
        motor_id: data.motor_id,
        penyewa_id: data.penyewa_id,
        tgl_sewa: convertInputToUTC(data.tgl_sewa),
        tgl_kembali: convertInputToUTC(data.tgl_kembali),
        jaminan: data.jaminan,
        pembayaran: data.pembayaran,
        additional_costs: data.additional_costs,
        catatan_tambahan: data.catatan_tambahan,
        satuan_durasi: "hari",
      };
      onSubmit(createData);
    }
  };

  // Minimal tanggal/waktu untuk input
  const getMinDateTime = () => new Date().toISOString().slice(0, 16);
  const getMinReturnDateTime = () => {
    if (!watchTglSewa) return getMinDateTime();
    const minDate = new Date(watchTglSewa);
    minDate.setHours(minDate.getHours() + 1);
    return minDate.toISOString().slice(0, 16);
  };

  const selectedMotor = motors.find((m) => m.id === watchIdMotor);

  // Sync backend -> input saat edit
  useEffect(() => {
    if (sewa) {
      setValue("tgl_sewa", formatUTCtoWIBForInput(sewa.tgl_sewa as string));
      setValue(
        "tgl_kembali",
        formatUTCtoWIBForInput(sewa.tgl_kembali as string)
      );
    }
  }, [sewa, setValue]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <BasicInfoSection
        register={register}
        errors={errors}
        control={control}
        motors={motors}
        penyewas={penyewas}
        sewa={sewa}
        getMinDateTime={getMinDateTime}
        getMinReturnDateTime={getMinReturnDateTime}
      />

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Catatan Tambahan</h3>
        <SewaNotes
          sewaId={sewa?.id || 0}
          currentNote={watchCatatanTambahan}
          onNoteUpdated={(note) => setValue("catatan_tambahan", note)}
          isCreateMode={!sewa}
        />
      </div>

      <AdditionalCostsSection
        additionalCosts={watchAdditionalCosts}
        onAddCost={() =>
          setValue("additional_costs", [
            ...watchAdditionalCosts,
            { description: "", amount: 0, type: "additional" as const },
          ])
        }
        onRemoveCost={(index) =>
          setValue(
            "additional_costs",
            watchAdditionalCosts.filter((_, i) => i !== index)
          )
        }
        onUpdateCost={(index, field, value) => {
          const updatedCosts = [...watchAdditionalCosts];
          updatedCosts[index] = {
            ...updatedCosts[index],
            [field]: field === "amount" ? Number(value) : value,
          };
          setValue("additional_costs", updatedCosts);
        }}
      />

      {watchTglSewa && watchTglKembali && watchIdMotor && (
        <RentalSummary
          tglSewa={watchTglSewa}
          tglKembali={watchTglKembali}
          selectedMotor={selectedMotor}
          additionalCosts={watchAdditionalCosts}
          currentSewa={sewa}
        />
      )}

      <FormActions isEdit={!!sewa} isLoading={isLoading} />
      {sewa && <EditModeInfo />}
    </form>
  );
};

export default SewaForm;
