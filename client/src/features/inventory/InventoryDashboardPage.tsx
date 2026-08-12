import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Package, History } from 'lucide-react';
import { useInventoryOverview } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricPanel } from '../../components/ui/MetricPanel';
import { DataPanel } from '../../components/ui/DataPanel';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';

export function InventoryDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data, isLoading, isError } = useInventoryOverview();
  const canAdjustStock = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-12">
      <PageHeader 
        title="Inventory Operations" 
        description="Warehouse metrics, stock levels, and recent movements."
        icon={<Boxes className="w-6 h-6" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('movements')} leftIcon={<History className="w-4 h-4" />}>
              Ledger
            </Button>
            {canAdjustStock && (
              <Button variant="primary" onClick={() => navigate('adjust')} leftIcon={<ArrowDownToLine className="w-4 h-4" />}>
                Record Stock
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricPanel 
          label="Total Products" 
          value={isLoading ? '-' : data?.totalProducts ?? '-'} 
          icon={<Package className="w-5 h-5 text-brand" />} 
          trend="neutral" 
          subValue="Active catalog items" 
        />
        <MetricPanel 
          label="Low Stock Alert" 
          value={isLoading ? '-' : data?.lowStockProducts ?? '-'} 
          icon={<AlertTriangle className={`w-5 h-5 ${data?.lowStockProducts ? 'text-status-warning' : 'text-content-secondary'}`} />} 
          trend={data?.lowStockProducts ? 'down' : 'neutral'} 
          subValue="Items at or below min level" 
        />
        <MetricPanel 
          label="Out of Stock" 
          value={isLoading ? '-' : data?.outOfStockProducts ?? '-'} 
          icon={<AlertTriangle className={`w-5 h-5 ${data?.outOfStockProducts ? 'text-status-error' : 'text-content-secondary'}`} />} 
          trend={data?.outOfStockProducts ? 'down' : 'neutral'} 
          subValue="Zero stock availability" 
        />
        <MetricPanel 
          label="Total Movements" 
          value={isLoading ? '-' : data?.totalMovements ?? '-'} 
          icon={<History className="w-5 h-5 text-content-secondary" />} 
          trend="neutral" 
          subValue="Historical ledger entries" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataPanel className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-4 border-b border-line-primary pb-4">
            <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-status-success" /> Recent IN Movements
            </h3>
          </div>
          
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : isError ? (
              <div className="text-sm text-status-error py-4">Failed to load movements.</div>
            ) : !data || data.recentMovements.filter(m => m.movementType === 'IN').length === 0 ? (
              <div className="py-8 text-center text-content-tertiary text-sm">
                No recent IN movements recorded.
              </div>
            ) : (
              data.recentMovements.filter(m => m.movementType === 'IN').map((movement) => (
                <div key={movement.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-md bg-surface-secondary border border-line-secondary cursor-pointer hover:border-brand/30 transition-colors" onClick={() => navigate(`/app/products/${movement.productId}`)}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-content-primary">{movement.product.name}</span>
                    <span className="text-[10px] text-content-tertiary font-mono uppercase">{movement.product.sku} • By {movement.createdBy.name}</span>
                  </div>
                  <div className="font-mono font-bold text-sm text-status-success shrink-0">
                    +{movement.quantity}
                  </div>
                </div>
              ))
            )}
          </div>
        </DataPanel>

        <DataPanel className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-4 border-b border-line-primary pb-4">
            <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2">
              <ArrowUpFromLine className="w-4 h-4 text-status-error" /> Recent OUT Movements
            </h3>
          </div>
          
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : isError ? (
              <div className="text-sm text-status-error py-4">Failed to load movements.</div>
            ) : !data || data.recentMovements.filter(m => m.movementType === 'OUT').length === 0 ? (
              <div className="py-8 text-center text-content-tertiary text-sm">
                No recent OUT movements recorded.
              </div>
            ) : (
              data.recentMovements.filter(m => m.movementType === 'OUT').map((movement) => (
                <div key={movement.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-md bg-surface-secondary border border-line-secondary cursor-pointer hover:border-brand/30 transition-colors" onClick={() => navigate(`/app/products/${movement.productId}`)}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-content-primary">{movement.product.name}</span>
                    <span className="text-[10px] text-content-tertiary font-mono uppercase">{movement.product.sku} • By {movement.createdBy.name}</span>
                  </div>
                  <div className="font-mono font-bold text-sm text-status-error shrink-0">
                    -{movement.quantity}
                  </div>
                </div>
              ))
            )}
          </div>
        </DataPanel>
      </div>
    </div>
  );
}
