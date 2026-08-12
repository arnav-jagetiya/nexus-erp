import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { DataPanel } from '../../components/ui/DataPanel';
import { AlertCircle } from 'lucide-react';
import { extractErrorMessage, applyFormErrors } from '../../utils/errorHandling';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits').max(15),
  email: z.string().email('Please enter a valid email address'),
  businessName: z.string().min(1, 'Business name is required').max(200),
  gstNumber: z.string().max(15).optional().nullable(),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().min(1, 'Address is required'),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialValues?: Partial<CustomerFormValues>;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function CustomerForm({ initialValues, onSubmit, isSubmitting, onCancel }: CustomerFormProps) {
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialValues?.name || '',
      mobile: initialValues?.mobile || '',
      email: initialValues?.email || '',
      businessName: initialValues?.businessName || '',
      gstNumber: initialValues?.gstNumber || '',
      customerType: initialValues?.customerType || 'RETAIL',
      address: initialValues?.address || '',
      status: initialValues?.status || 'LEAD',
      followUpDate: initialValues?.followUpDate ? new Date(initialValues.followUpDate).toISOString().slice(0, 16) : '',
      notes: initialValues?.notes || '',
    },
  });

  const handleFormSubmit = async (data: CustomerFormValues) => {
    setGlobalError(null);
    try {
      await onSubmit(data);
    } catch (err: any) {
      if (!applyFormErrors(err, setError as any)) {
        const errorData = err.response?.data?.error;
        if (errorData?.code === 'CONFLICT') {
          // Assume email or mobile conflict
          const target = errorData.details?.target || 'record';
          setGlobalError(`A customer with this ${target} already exists.`);
        } else {
          setGlobalError(extractErrorMessage(err, 'Failed to save customer.'));
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
        <h3 className="text-sm font-semibold text-content-primary mb-4 border-b border-line-primary pb-2 uppercase tracking-widest font-mono">Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Full Name" 
            placeholder="Contact person's name"
            {...register('name')} 
            error={errors.name?.message} 
          />
          <Input 
            label="Email Address" 
            type="email"
            placeholder="contact@company.com"
            {...register('email')} 
            error={errors.email?.message} 
          />
          <Input 
            label="Mobile Number" 
            placeholder="10-digit mobile number"
            {...register('mobile')} 
            error={errors.mobile?.message} 
          />
        </div>
      </DataPanel>

      <DataPanel className="p-6">
        <h3 className="text-sm font-semibold text-content-primary mb-4 border-b border-line-primary pb-2 uppercase tracking-widest font-mono">Business</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Business Name" 
            placeholder="Company or retail name"
            {...register('businessName')} 
            error={errors.businessName?.message} 
          />
          <Input 
            label="GST Number (Optional)" 
            placeholder="15-character GSTIN"
            {...register('gstNumber')} 
            error={errors.gstNumber?.message} 
          />
          <Select 
            label="Customer Type" 
            options={[
              { value: 'RETAIL', label: 'Retail' },
              { value: 'WHOLESALE', label: 'Wholesale' },
              { value: 'DISTRIBUTOR', label: 'Distributor' },
            ]}
            {...register('customerType')}
            error={errors.customerType?.message}
          />
          <Select 
            label="Customer Status" 
            options={[
              { value: 'LEAD', label: 'Lead' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
            {...register('status')}
            error={errors.status?.message}
          />
        </div>
      </DataPanel>

      <DataPanel className="p-6">
        <h3 className="text-sm font-semibold text-content-primary mb-4 border-b border-line-primary pb-2 uppercase tracking-widest font-mono">Address</h3>
        <div className="grid grid-cols-1 gap-4">
          <Input 
            label="Full Address" 
            placeholder="Complete physical address"
            {...register('address')} 
            error={errors.address?.message} 
          />
        </div>
      </DataPanel>

      <DataPanel className="p-6">
        <h3 className="text-sm font-semibold text-content-primary mb-4 border-b border-line-primary pb-2 uppercase tracking-widest font-mono">CRM / Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Follow-up Date (Optional)" 
            type="datetime-local"
            {...register('followUpDate')} 
            error={errors.followUpDate?.message} 
          />
          <div className="w-full flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-content-secondary">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              className="w-full rounded-md border border-line-primary bg-surface-secondary px-3 py-2.5 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-line-focus focus:border-line-focus shadow-spatial-low"
              rows={3}
              placeholder="Internal notes about this customer..."
            />
          </div>
        </div>
      </DataPanel>

      <div className="flex justify-end gap-3 mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Save Customer
        </Button>
      </div>
    </form>
  );
}
