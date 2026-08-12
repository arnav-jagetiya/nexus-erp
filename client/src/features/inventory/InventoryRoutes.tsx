import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { InventoryDashboardPage } from './InventoryDashboardPage';
import { MovementLedgerPage } from './MovementLedgerPage';
import { StockAdjustmentPage } from './StockAdjustmentPage';

export function InventoryRoutes() {
  return (
    <Routes>
      <Route index element={<InventoryDashboardPage />} />
      <Route path="movements" element={<MovementLedgerPage />} />
      <Route path="adjust" element={<StockAdjustmentPage />} />
    </Routes>
  );
}
