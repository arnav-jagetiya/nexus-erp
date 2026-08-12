import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts';
import { DataPanel } from '../../components/ui/DataPanel';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ProductDTO } from '../../api/products';

const challanItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string(),
  sku: z.string(),
  unitPrice: z.number(),
  currentStock: z.number(),
  quantity: z.number().int().min(1, 'Must be at least 1')
}).refine(data => data.quantity <= data.currentStock, {
  message: "Quantity exceeds available stock",
  path: ["quantity"]
});

const challanSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  items: z.array(challanItemSchema).min(1, 'At least one product is required')
});

export type ChallanFormValues = z.infer<typeof challanSchema>;

interface ChallanFormProps {
  initialValues?: Partial<ChallanFormValues>;
  onSubmit: (data: ChallanFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ChallanForm({ initialValues, onSubmit, isSubmitting, onCancel }: ChallanFormProps) {
  const { data: customersResponse, isLoading: isLoadingCustomers } = useCustomers({ limit: 1000 });
  const customers = customersResponse?.data || [];

  const [productSearch, setProductSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(productSearch), 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const { data: productsResponse, isLoading: isLoadingProducts } = useProducts({ 
    search: debouncedSearch,
    limit: 10 
  });
  const searchResults = productsResponse?.data || [];

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ChallanFormValues>({
    resolver: zodResolver(challanSchema),
    defaultValues: {
      customerId: initialValues?.customerId || '',
      items: initialValues?.items || []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const grandTotal = watchItems.reduce((acc, item) => acc + (item.unitPrice * (item.quantity || 0)), 0);

  const handleAddProduct = (product: ProductDTO) => {
    // Check if already added
    if (fields.some(f => f.productId === product.id)) {
      return;
    }
    append({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      unitPrice: Number(product.unitPrice),
      currentStock: product.currentStock,
      quantity: 1
    });
    setProductSearch('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
      <DataPanel className="p-6">
        <h3 className="text-sm font-semibold text-content-primary mb-4 border-b border-line-primary pb-2 uppercase tracking-widest font-mono">
          Customer Details
        </h3>
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <Select 
              label="Select Customer"
              options={customers.map(c => ({ value: c.id, label: `${c.businessName} - ${c.name}` }))}
              error={errors.customerId?.message}
              disabled={isLoadingCustomers}
              {...field}
            />
          )}
        />
      </DataPanel>

      <DataPanel className="p-6 overflow-visible">
        <h3 className="text-sm font-semibold text-content-primary mb-4 border-b border-line-primary pb-2 uppercase tracking-widest font-mono">
          Line Items
        </h3>

        {/* Product Search Combobox */}
        <div className="relative mb-6">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-content-secondary mb-1.5 block">
            Add Product
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <input 
              type="text" 
              placeholder="Search by product name or SKU..." 
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-secondary border border-line-secondary rounded-md text-sm text-content-primary focus:outline-none focus:border-brand/50 transition-colors shadow-spatial-low"
            />
          </div>
          
          {productSearch && (
            <div className="absolute z-10 w-full mt-1 bg-surface-primary border border-line-secondary rounded-md shadow-lg max-h-60 overflow-y-auto">
              {isLoadingProducts ? (
                <div className="p-4 text-center text-sm text-content-secondary">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-content-secondary">No products found</div>
              ) : (
                searchResults.map(product => {
                  const isAdded = watchItems.some(item => item.productId === product.id);
                  const isOutOfStock = product.currentStock === 0;
                  return (
                    <div 
                      key={product.id}
                      onClick={() => !isAdded && !isOutOfStock && handleAddProduct(product)}
                      className={`flex items-center justify-between p-3 border-b border-line-secondary last:border-0 ${
                        isAdded || isOutOfStock ? 'opacity-50 cursor-not-allowed bg-surface-secondary' : 'cursor-pointer hover:bg-surface-secondary transition-colors'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-content-primary">{product.name}</span>
                        <span className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase">{product.sku}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm font-semibold text-content-primary">
                          ₹{Number(product.unitPrice).toLocaleString('en-IN')}
                        </span>
                        <div className={`text-xs font-mono px-2 py-1 rounded ${isOutOfStock ? 'bg-status-error/10 text-status-error' : 'bg-surface-primary border border-line-primary text-content-secondary'}`}>
                          Stock: {product.currentStock}
                        </div>
                        {isAdded ? (
                          <span className="text-xs text-content-secondary font-medium">Added</span>
                        ) : isOutOfStock ? (
                          <span className="text-xs text-status-error font-medium">No Stock</span>
                        ) : (
                          <Plus className="w-4 h-4 text-brand" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Selected Items Table */}
        <div className="border border-line-secondary rounded-lg overflow-x-auto bg-surface-primary shadow-spatial-low">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-secondary text-[10px] uppercase tracking-widest font-mono text-content-secondary border-b border-line-secondary">
                <th className="p-3 font-semibold">Product</th>
                <th className="p-3 font-semibold">Available</th>
                <th className="p-3 font-semibold w-32">Qty</th>
                <th className="p-3 font-semibold text-right">Unit Price</th>
                <th className="p-3 font-semibold text-right">Total</th>
                <th className="p-3 font-semibold text-center"></th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-content-tertiary text-sm">
                    No products added yet. Search and add products above.
                  </td>
                </tr>
              ) : (
                fields.map((field, index) => {
                  const quantity = watchItems[index].quantity;
                  const unitPrice = watchItems[index].unitPrice;
                  const currentStock = watchItems[index].currentStock;
                  const lineTotal = quantity * unitPrice;
                  const qtyError = errors.items?.[index]?.quantity?.message;

                  return (
                    <tr key={field.id} className="border-b border-line-secondary last:border-0 hover:bg-surface-secondary/50 transition-colors group">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-content-primary">{field.productName}</span>
                          <span className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase">{field.sku}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`font-mono text-sm ${currentStock <= 0 ? 'text-status-error' : 'text-content-secondary'}`}>
                          {currentStock}
                        </span>
                      </td>
                      <td className="p-3 relative">
                        <Controller
                          name={`items.${index}.quantity`}
                          control={control}
                          render={({ field: { onChange, value, ...rest } }) => (
                            <input
                              type="number"
                              min="1"
                              value={value}
                              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                              className={`w-full bg-surface-primary border ${qtyError ? 'border-status-error' : 'border-line-secondary focus:border-brand/50'} rounded-md px-3 py-1.5 text-sm font-mono text-content-primary focus:outline-none`}
                              {...rest}
                            />
                          )}
                        />
                        {qtyError && (
                          <div className="absolute top-1/2 -right-6 -translate-y-1/2 text-status-error group" title={qtyError}>
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-sm text-content-secondary">
                        ₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-sm font-bold text-content-primary">
                        ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          type="button" 
                          onClick={() => remove(index)}
                          className="p-1.5 text-content-tertiary hover:text-status-error hover:bg-status-error/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {errors.items?.root?.message && (
          <p className="mt-2 text-sm text-status-error font-medium">{errors.items.root.message}</p>
        )}
      </DataPanel>

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-surface-secondary p-6 rounded-lg border border-line-secondary shadow-spatial-low">
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <span className="text-[11px] font-mono tracking-widest uppercase text-content-secondary">Grand Total</span>
          <span className="text-3xl font-mono font-bold text-brand">
            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="flex justify-end gap-3 w-full md:w-auto">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={fields.length === 0}>
            Save Draft Challan
          </Button>
        </div>
      </div>
    </form>
  );
}
