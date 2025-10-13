import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Motor, CreateMotorData, UpdateMotorData } from '../../types/motor';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const motorSchema = z.object({
  plat_nomor: z.string().min(1, 'Plat nomor wajib diisi').max(20, 'Plat nomor terlalu panjang'),
  merk: z.string().min(1, 'Merk wajib diisi').max(255, 'Merk terlalu panjang'),
  model: z.string().min(1, 'Model wajib diisi').max(255, 'Model terlalu panjang'),
  tahun: z.number()
    .min(1990, 'Tahun minimal 1990')
    .max(new Date().getFullYear() + 1, 'Tahun tidak valid'),
  harga: z.number().min(0, 'Harga tidak valid'),
  no_gsm: z.string().max(20, 'Nomor GSM terlalu panjang').optional().or(z.literal('')),
  imei: z.string().max(20, 'IMEI terlalu panjang').optional().or(z.literal('')),
  status: z.enum(['tersedia', 'disewa', 'perbaikan']),
});

type MotorFormData = z.infer<typeof motorSchema>;

interface MotorFormProps {
  motor?: Motor;
  onSubmit: (data: CreateMotorData | UpdateMotorData) => void;
  isLoading?: boolean;
}

export const MotorForm: React.FC<MotorFormProps> = ({ motor, onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MotorFormData>({
    resolver: zodResolver(motorSchema),
    defaultValues: motor ? {
      plat_nomor: motor.plat_nomor,
      merk: motor.merk,
      model: motor.model,
      tahun: motor.tahun,
      harga: motor.harga,
      no_gsm: motor.no_gsm || '',
      imei: motor.imei || '',
      status: motor.status,
    } : {
      status: 'tersedia',
    },
  });

  const handleFormSubmit = (data: MotorFormData) => {
    const submitData = {
      ...data,
      no_gsm: data.no_gsm || undefined,
      imei: data.imei || undefined,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Plat Nomor"
          {...register('plat_nomor')}
          error={errors.plat_nomor?.message}
          required
        />
        
        <Input
          label="Merk"
          {...register('merk')}
          error={errors.merk?.message}
          required
        />
        
        <Input
          label="Model"
          {...register('model')}
          error={errors.model?.message}
          required
        />
        
        <Input
          label="Tahun"
          type="number"
          {...register('tahun', { valueAsNumber: true })}
          error={errors.tahun?.message}
          required
        />
        
        <Input
          label="Harga Sewa per Hari"
          type="number"
          {...register('harga', { valueAsNumber: true })}
          error={errors.harga?.message}
          required
        />
        
        <Select
          label="Status"
          {...register('status')}
          error={errors.status?.message}
          options={[
            { value: 'tersedia', label: 'Tersedia' },
            { value: 'disewa', label: 'Disewa' },
            { value: 'perbaikan', label: 'Perbaikan' },
          ]}
          required
        />
        
        <Input
          label="Nomor GSM (Opsional)"
          {...register('no_gsm')}
          error={errors.no_gsm?.message}
        />
        
        <Input
          label="IMEI (Opsional)"
          {...register('imei')}
          error={errors.imei?.message}
        />
      </div>
      
      <Button type="submit" isLoading={isLoading}>
        {motor ? 'Update Motor' : 'Tambah Motor'}
      </Button>
    </form>
  );
};