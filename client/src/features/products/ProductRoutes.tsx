import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProductsPage } from './ProductsPage';
import { CreateProductPage } from './CreateProductPage';
import { EditProductPage } from './EditProductPage';
import { ProductDetailPage } from './ProductDetailPage';

export function ProductRoutes() {
  return (
    <Routes>
      <Route index element={<ProductsPage />} />
      <Route path="new" element={<CreateProductPage />} />
      <Route path=":id/edit" element={<EditProductPage />} />
      <Route path=":id" element={<ProductDetailPage />} />
    </Routes>
  );
}
