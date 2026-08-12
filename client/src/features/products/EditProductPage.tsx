import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { useProduct, useUpdateProduct } from '../../hooks/useProducts';
import { ProductForm, ProductFormValues } from './ProductForm';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(id!);
  const { mutateAsync: updateProduct, isPending } = useUpdateProduct();

  const handleSubmit = async (data: ProductFormValues) => {
    await updateProduct({ id: id!, data });
    navigate(`/app/products/${id}`);
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

  if (isError || !product) {
    return (
      <div className="p-8 text-center text-status-error">
        Failed to load product details. 
        <Button variant="outline" className="mt-4" onClick={() => navigate('/app/products')}>Return to List</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/app/products/${id}`)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Product
        </Button>
      </div>
      
      <PageHeader 
        title={`Edit ${product.sku}`}
        description="Update product information and pricing."
        icon={<Edit3 className="w-6 h-6" />}
      />

      <ProductForm 
        initialValues={{
          name: product.name,
          sku: product.sku,
          category: product.category,
          unitPrice: Number(product.unitPrice),
          minStockAlert: product.minStockAlert,
          location: product.location,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        onCancel={() => navigate(`/app/products/${id}`)}
      />
    </div>
  );
}
