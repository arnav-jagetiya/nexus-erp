import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { AppLayout } from '../components/layout/AppLayout';
import { LandingPage } from '../features/landing/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { UsersPage } from '../features/users/UsersPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { ModulePlaceholder } from '../features/placeholder/ModulePlaceholder';
import { CustomerRoutes } from '../features/customers/CustomerRoutes';
import { ProductRoutes } from '../features/products/ProductRoutes';
import { InventoryRoutes } from '../features/inventory/InventoryRoutes';
import { ChallanRoutes } from '../features/challans/ChallanRoutes';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Authenticated App Shell */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Placeholder Routes for Phase 3 Feature Modules */}
        <Route
          path="customers/*"
          element={
            <RoleGuard roles={['ADMIN', 'SALES', 'ACCOUNTS']}>
              <CustomerRoutes />
            </RoleGuard>
          }
        />

        <Route
          path="products/*"
          element={
            <RoleGuard roles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
              <ProductRoutes />
            </RoleGuard>
          }
        />

        <Route
          path="inventory/*"
          element={
            <RoleGuard roles={['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS']}>
              <InventoryRoutes />
            </RoleGuard>
          }
        />

        <Route
          path="challans/*"
          element={
            <RoleGuard roles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
              <ChallanRoutes />
            </RoleGuard>
          }
        />

        <Route
          path="settings"
          element={<SettingsPage />}
        />

        <Route
          path="users"
          element={
            <RoleGuard roles={['ADMIN']}>
              <UsersPage />
            </RoleGuard>
          }
        />
      </Route>

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
