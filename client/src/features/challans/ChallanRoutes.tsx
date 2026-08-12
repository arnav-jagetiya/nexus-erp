import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ChallansPage } from './ChallansPage';
import { CreateChallanPage } from './CreateChallanPage';
import { ChallanDetailPage } from './ChallanDetailPage';

export function ChallanRoutes() {
  return (
    <Routes>
      <Route index element={<ChallansPage />} />
      <Route path="new" element={<CreateChallanPage />} />
      <Route path=":id" element={<ChallanDetailPage />} />
    </Routes>
  );
}
