import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/ui/Badge';
import { Users, Package, Boxes, FileText, CheckCircle2, Clock } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header Banner */}
      <div className="p-6 rounded-lg border border-line-primary bg-surface-secondary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-content-primary">
              Welcome back, {user?.name}
            </h2>
            <Badge variant="info">{user?.role}</Badge>
          </div>
          <p className="text-xs text-content-secondary mt-1">
            System status: All operational modules online. Authenticated as{' '}
            <span className="font-mono text-content-primary">{user?.email}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-content-tertiary">
          <Clock className="w-4 h-4 text-brand" />
          <span>SESSION: ACTIVE (24h)</span>
        </div>
      </div>

      {/* KPI Stat Cards Placeholder Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg border border-line-primary bg-surface-secondary flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-content-tertiary uppercase">Customers</span>
            <Users className="w-5 h-5 text-brand" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-content-primary font-mono">--</p>
            <p className="text-[11px] text-content-tertiary mt-1">CRM module coming in Phase 2</p>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-line-primary bg-surface-secondary flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-content-tertiary uppercase">Products</span>
            <Package className="w-5 h-5 text-status-warning" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-content-primary font-mono">--</p>
            <p className="text-[11px] text-content-tertiary mt-1">Catalog module coming in Phase 2</p>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-line-primary bg-surface-secondary flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-content-tertiary uppercase">Stock Items</span>
            <Boxes className="w-5 h-5 text-status-success" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-content-primary font-mono">--</p>
            <p className="text-[11px] text-content-tertiary mt-1">Inventory module coming in Phase 2</p>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-line-primary bg-surface-secondary flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-content-tertiary uppercase">Sales Challans</span>
            <FileText className="w-5 h-5 text-status-info" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-content-primary font-mono">--</p>
            <p className="text-[11px] text-content-tertiary mt-1">Challan module coming in Phase 2</p>
          </div>
        </div>
      </div>

      {/* Phase 1 Completion Status Container */}
      <div className="p-6 rounded-lg border border-line-primary bg-surface-secondary">
        <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-status-success" />
          Phase 1 Foundation Verification Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded border border-line-primary bg-surface-primary flex items-center justify-between">
            <span className="text-content-secondary">JWT Authentication System</span>
            <Badge variant="success">VERIFIED</Badge>
          </div>
          <div className="p-3 rounded border border-line-primary bg-surface-primary flex items-center justify-between">
            <span className="text-content-secondary">Prisma Database & Schema</span>
            <Badge variant="success">VERIFIED</Badge>
          </div>
          <div className="p-3 rounded border border-line-primary bg-surface-primary flex items-center justify-between">
            <span className="text-content-secondary">Role-Based Access Control</span>
            <Badge variant="success">VERIFIED</Badge>
          </div>
          <div className="p-3 rounded border border-line-primary bg-surface-primary flex items-center justify-between">
            <span className="text-content-secondary">Tailwind CSS v4 Theme Engine</span>
            <Badge variant="success">VERIFIED</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
