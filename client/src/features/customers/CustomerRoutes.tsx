import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CustomersPage } from './CustomersPage';
import { CreateCustomerPage } from './CreateCustomerPage';
import { EditCustomerPage } from './EditCustomerPage';
import { CustomerDetailPage } from './CustomerDetailPage';

export function CustomerRoutes() {
  return (
    <Routes>
      <Route index element={<CustomersPage />} />
      <Route path="new" element={<CreateCustomerPage />} />
      <Route path=":id/edit" element={<EditCustomerPage />} />
      <Route path=":id" element={<CustomerDetailPage />} />
    </Routes>
  );
}
