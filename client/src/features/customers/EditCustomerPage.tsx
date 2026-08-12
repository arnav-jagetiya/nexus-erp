import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserCog } from 'lucide-react';
import { useCustomer, useUpdateCustomer } from '../../hooks/useCustomers';
import { CustomerForm, CustomerFormValues } from './CustomerForm';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

export function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, isError } = useCustomer(id!);
  const { mutateAsync: updateCustomer, isPending } = useUpdateCustomer();

  const handleSubmit = async (data: CustomerFormValues) => {
    const submitData = {
      ...data,
      followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null,
    };
    
    await updateCustomer({ id: id!, data: submitData });
    navigate(`/app/customers/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <Skeleton className="h-8 w-24 mb-4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="p-8 text-center text-status-error">
        Failed to load customer details. 
        <Button variant="outline" className="mt-4" onClick={() => navigate('/app/customers')}>Return to List</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/app/customers/${id}`)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Customer
        </Button>
      </div>
      
      <PageHeader 
        title={`Edit ${customer.name}`}
        description="Update customer information and CRM details."
        icon={<UserCog className="w-6 h-6" />}
      />

      <CustomerForm 
        initialValues={customer}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        onCancel={() => navigate(`/app/customers/${id}`)}
      />
    </div>
  );
}
