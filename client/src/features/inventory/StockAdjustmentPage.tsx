import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Package } from 'lucide-react';
import { useStockAdjustment } from '../../hooks/useInventory';
import { useProducts, productKeys } from '../../hooks/useProducts';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataPanel } from '../../components/ui/DataPanel';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '../../utils/errorHandling';
import { AlertCircle } from 'lucide-react';

const adjustmentSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  movementType: z.enum(['IN', 'OUT']),
  quantity: z.number().int('Must be whole number').positive('Must be greater than 0'),
  reason: z.string().min(1, 'Reason is required').max(500),
});

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

export function StockAdjustmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ limit: 1000 });
  const { mutateAsync: createMovement, isPending } = useStockAdjustment();

  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      productId: '',
      movementType: 'IN',
      quantity: 1,
      reason: '',
    },
  });

  const products = productsData?.data || [];

  const handleTypeChange = (type: 'IN' | 'OUT') => {
    setMovementType(type);
    setValue('movementType', type);
  };

  const onSubmit = async (data: AdjustmentFormValues) => {
    setGlobalError(null);
    try {
      await createMovement(data);
      navigate('/app/inventory/movements');
    } catch (error: any) {
      setGlobalError(extractErrorMessage(error, 'Failed to record stock movement'));
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/app/inventory')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
      </div>

      <PageHeader 
        title="Record Stock Movement" 
        description="Log IN or OUT adjustments to product inventory."
        icon={<Package className="w-6 h-6" />}
      />

      <div className="flex bg-surface-secondary p-1 rounded-lg border border-line-secondary w-full max-w-sm mb-2 shadow-spatial-low">
        <button
          type="button"
          onClick={() => handleTypeChange('IN')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${
            movementType === 'IN' 
              ? 'bg-status-success/10 text-status-success shadow-sm' 
              : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          <ArrowDownToLine className="w-4 h-4" /> STOCK IN
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('OUT')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${
            movementType === 'OUT' 
              ? 'bg-status-error/10 text-status-error shadow-sm' 
              : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          <ArrowUpFromLine className="w-4 h-4" /> STOCK OUT
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DataPanel className="p-6 md:p-8 flex flex-col gap-8">
          {globalError && (
            <div className="p-4 rounded-md bg-status-error/10 border border-status-error/20 flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-status-error">{globalError}</span>
            </div>
          )}

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold text-content-primary border-b border-line-primary pb-2 uppercase tracking-widest font-mono">
              {movementType === 'IN' ? 'Receiving Details' : 'Dispatch Details'}
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <Select 
                label="Product" 
                options={products.map(p => ({ value: p.id, label: `${p.name} (${p.sku}) - Stock: ${p.currentStock}` }))}
                {...register('productId')}
                error={errors.productId?.message}
                disabled={isLoadingProducts}
              />
              
              <Input 
                label="Quantity" 
                type="number"
                min="1"
                step="1"
                {...register('quantity', { valueAsNumber: true })}
                error={errors.quantity?.message}
                className={movementType === 'IN' ? 'text-status-success font-bold font-mono' : 'text-status-error font-bold font-mono'}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-content-secondary">
                  Reason for Adjustment
                </label>
                <textarea
                  {...register('reason')}
                  className="w-full rounded-md border border-line-primary bg-surface-secondary px-3 py-2.5 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-line-focus focus:border-line-focus shadow-spatial-low"
                  rows={3}
                  placeholder={movementType === 'IN' ? 'e.g., Supplier delivery, return' : 'e.g., Damaged, consumed, transfer'}
                />
                {errors.reason?.message && (
                  <p className="text-xs text-status-danger font-medium mt-1">{errors.reason.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-line-secondary">
            <Button type="button" variant="outline" onClick={() => navigate('/app/inventory')} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant={movementType === 'IN' ? 'primary' : 'danger'} isLoading={isPending}>
              {movementType === 'IN' ? 'Confirm Stock IN' : 'Confirm Stock OUT'}
            </Button>
          </div>
        </DataPanel>
      </form>
    </div>
  );
}
