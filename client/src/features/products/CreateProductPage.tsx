import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PackagePlus } from 'lucide-react';
import { useCreateProduct } from '../../hooks/useProducts';
import { ProductForm, ProductFormValues } from './ProductForm';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';

export function CreateProductPage() {
  const navigate = useNavigate();
  const { mutateAsync: createProduct, isPending } = useCreateProduct();

  const handleSubmit = async (data: ProductFormValues) => {
    const newProduct = await createProduct(data);
    navigate(`/app/products/${newProduct.id}`);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/app/products')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
      </div>
      
      <PageHeader 
        title="New Product" 
        description="Register a new inventory item to the catalog."
        icon={<PackagePlus className="w-6 h-6" />}
      />

      <ProductForm 
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        onCancel={() => navigate('/app/products')}
      />
    </div>
  );
}
