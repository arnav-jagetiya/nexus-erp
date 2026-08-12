import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useCreateCustomer } from '../../hooks/useCustomers';
import { CustomerForm, CustomerFormValues } from './CustomerForm';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';

export function CreateCustomerPage() {
  const navigate = useNavigate();
  const { mutateAsync: createCustomer, isPending } = useCreateCustomer();

  const handleSubmit = async (data: CustomerFormValues) => {
    // API expects followUpDate to be ISO string or null
    const submitData = {
      ...data,
      followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null,
    };
    
    const newCustomer = await createCustomer(submitData);
    navigate(`/app/customers/${newCustomer.id}`);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/app/customers')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
      </div>
      
      <PageHeader 
        title="New Customer" 
        description="Register a new customer account and business profile."
        icon={<UserPlus className="w-6 h-6" />}
      />

      <CustomerForm 
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        onCancel={() => navigate('/app/customers')}
      />
    </div>
  );
}
