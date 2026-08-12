import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { DataPanel } from '../../components/ui/DataPanel';
import { AlertCircle } from 'lucide-react';
import { extractErrorMessage, applyFormErrors } from '../../utils/errorHandling';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  sku: z.string().min(1, 'SKU is required').max(50),
  category: z.string().min(1, 'Category is required').max(100),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  minStockAlert: z.number().int().min(0, 'Min stock alert cannot be negative'),
  location: z.string().min(1, 'Location is required').max(100),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ProductForm({ initialValues, onSubmit, isSubmitting, onCancel }: ProductFormProps) {
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialValues?.name || '',
      sku: initialValues?.sku || '',
      category: initialValues?.category || '',
      unitPrice: initialValues?.unitPrice || 0,
      minStockAlert: initialValues?.minStockAlert || 0,
      location: initialValues?.location || '',
    },
  });

  const handleFormSubmit = async (data: ProductFormValues) => {
    setGlobalError(null);
    try {
      await onSubmit(data);
    } catch (err: any) {
      if (!applyFormErrors(err, setError as any)) {
        const errorData = err.response?.data?.error;
        if (errorData?.code === 'CONFLICT') {
          setError('sku', { type: 'server', message: errorData.message || 'A product with this SKU already exists.' });
        } else {
          setGlobalError(extractErrorMessage(err, 'Failed to create product'));
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-8 w-full">
      {globalError && (
        <div className="p-4 rounded-md bg-status-error/10 border border-status-error/20 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium text-status-error">{globalError}</span>
        </div>
      )}
      
      <DataPanel className="p-6">
        <h3 className="text-sm font-semibold text-content-primary mb-4 border-b border-line-primary pb-2 uppercase tracking-widest font-mono">Product Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input 
              label="Product Name" 
              placeholder="Full product name"
              {...register('name')} 
              error={errors.name?.message} 
            />
          </div>
          <Input 
            label="SKU (Stock Keeping Unit)" 
            placeholder="e.g., WH-SYS-001"
            className="uppercase font-mono"
            {...register('sku')} 
            error={errors.sku?.message} 
          />
          <Input 
            label="Category" 
            placeholder="e.g., Electronics, Hardware"
            {...register('category')} 
            error={errors.category?.message} 
          />
        </div>
      </DataPanel>

      <DataPanel className="p-6">
        <h3 className="text-sm font-semibold text-content-primary mb-4 border-b border-line-primary pb-2 uppercase tracking-widest font-mono">Pricing & Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Unit Price (₹)" 
            type="number"
            step="0.01"
            min="0"
            {...register('unitPrice', { valueAsNumber: true })} 
            error={errors.unitPrice?.message} 
          />
          <Input 
            label="Minimum Stock Alert Level" 
            type="number"
            step="1"
            min="0"
            {...register('minStockAlert', { valueAsNumber: true })} 
            error={errors.minStockAlert?.message} 
          />
          <div className="md:col-span-2">
            <Input 
              label="Warehouse Location" 
              placeholder="e.g., Aisle 4, Shelf B2"
              {...register('location')} 
              error={errors.location?.message} 
            />
          </div>
        </div>
      </DataPanel>

      <div className="flex justify-end gap-3 mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Save Product
        </Button>
      </div>
    </form>
  );
}
