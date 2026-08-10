import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ModulePlaceholder } from '../features/placeholder/ModulePlaceholder';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

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

        {/* Placeholder Routes for Phase 2 Feature Modules */}
        <Route
          path="customers/*"
          element={
            <RoleGuard roles={['ADMIN', 'SALES', 'ACCOUNTS']}>
              <ModulePlaceholder
                title="Customer CRM"
                description="Manage customer accounts, business contacts, GST information, follow-up logs, and customer status lifecycles."
                moduleKey="MOD_CUSTOMERS_CRM"
              />
            </RoleGuard>
          }
        />

        <Route
          path="products/*"
          element={
            <RoleGuard roles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
              <ModulePlaceholder
                title="Products Catalog"
                description="Manage product definitions, SKUs, pricing, categories, and warehouse storage locations."
                moduleKey="MOD_PRODUCTS_CATALOG"
              />
            </RoleGuard>
          }
        />

        <Route
          path="inventory/*"
          element={
            <RoleGuard roles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
              <ModulePlaceholder
                title="Inventory & Stock Movements"
                description="Track real-time stock levels, record IN movements, monitor low-stock alerts, and audit stock history logs."
                moduleKey="MOD_INVENTORY_LOGS"
              />
            </RoleGuard>
          }
        />

        <Route
          path="challans/*"
          element={
            <RoleGuard roles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
              <ModulePlaceholder
                title="Sales Challans"
                description="Create draft sales challans, perform atomic stock deduction upon confirmation, and store product price snapshots."
                moduleKey="MOD_SALES_CHALLANS"
              />
            </RoleGuard>
          }
        />

        <Route
          path="settings"
          element={
            <ModulePlaceholder
              title="System Settings"
              description="Configure workspace preferences, user role assignments, theme settings, and system parameters."
              moduleKey="MOD_SETTINGS"
            />
          }
        />
      </Route>

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
