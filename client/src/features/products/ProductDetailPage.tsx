import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Package, MapPin, Tag, Banknote, AlertTriangle, Boxes } from 'lucide-react';
import { useProduct } from '../../hooks/useProducts';
import { useStockMovements } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { DataPanel } from '../../components/ui/DataPanel';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: product, isLoading, isError } = useProduct(id!);
  const { data: movementsResponse, isLoading: isLoadingMovements } = useStockMovements({ productId: id, limit: 10 });
  const movements = movementsResponse?.data || [];

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <Skeleton className="h-8 w-24 mb-4" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full md:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="p-8 text-center text-status-error flex flex-col items-center">
        Failed to load product details.
        <Button variant="outline" className="mt-4" onClick={() => navigate('/app/products')}>Return to List</Button>
      </div>
    );
  }

  const isOutOfStock = product.currentStock === 0;
  const isLowStock = !isOutOfStock && product.currentStock <= product.minStockAlert;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-12">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate('/app/products')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        {canEdit && (
          <Button variant="primary" size="sm" onClick={() => navigate(`/app/products/${id}/edit`)} leftIcon={<Edit className="w-4 h-4" />}>
            Edit Product
          </Button>
        )}
      </div>

      <DataPanel className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-brand">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-content-primary">{product.name}</h1>
            {isOutOfStock ? (
              <StatusBadge status="OUT OF STOCK" variant="error" />
            ) : isLowStock ? (
              <StatusBadge status="LOW STOCK" variant="warning" />
            ) : (
              <StatusBadge status="HEALTHY" variant="success" />
            )}
          </div>
          <div className="flex items-center gap-3 text-content-secondary text-sm">
            <span className="font-mono tracking-widest uppercase bg-surface-secondary px-2 py-0.5 rounded border border-line-secondary">{product.sku}</span>
            <span className="text-content-tertiary px-1">•</span>
            <Tag className="w-4 h-4" />
            <span className="font-semibold">{product.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-surface-secondary px-6 py-4 rounded-lg border border-line-secondary shadow-spatial-low">
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-content-tertiary flex items-center gap-1">
              <Banknote className="w-3 h-3" /> Unit Price
            </span>
            <span className="text-lg font-mono font-bold text-content-primary">
              ₹{Number(product.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-px h-10 bg-line-primary"></div>
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-content-tertiary flex items-center gap-1">
              <Boxes className="w-3 h-3" /> Stock Level
            </span>
            <span className={`text-xl font-mono font-bold ${isOutOfStock ? 'text-status-error' : isLowStock ? 'text-status-warning' : 'text-brand'}`}>
              {product.currentStock}
            </span>
          </div>
        </div>
      </DataPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <DataPanel className="p-6">
            <h3 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-content-secondary" /> Inventory Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-content-tertiary font-mono uppercase">Minimum Stock Alert</span>
                <span className="text-sm font-medium text-content-primary flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-content-secondary" /> {product.minStockAlert} units
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-content-tertiary font-mono uppercase">Storage Location</span>
                <span className="text-sm font-medium text-content-primary flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-content-secondary" /> {product.location}
                </span>
              </div>
            </div>
          </DataPanel>

          <DataPanel className="flex flex-col h-full p-6">
            <h3 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2 border-b border-line-primary pb-4">
              <Boxes className="w-4 h-4 text-content-secondary" /> Recent Stock Movements
            </h3>
            
            {isLoadingMovements ? (
              <div className="py-4 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : movements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Boxes className="w-10 h-10 text-content-tertiary mb-4 opacity-50" />
                <h3 className="text-sm font-semibold text-content-primary mb-1">No movements yet</h3>
                <p className="text-xs text-content-secondary max-w-sm">
                  Stock adjustments for this product will appear here as an immutable ledger.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {movements.map((movement) => (
                  <div key={movement.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-md bg-surface-secondary border border-line-secondary">
                    <div className="flex items-center gap-3">
                      <StatusBadge 
                        status={movement.movementType} 
                        variant={movement.movementType === 'IN' ? 'success' : 'error'} 
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-content-primary">{movement.reason}</span>
                        <span className="text-[10px] text-content-tertiary font-mono">{new Date(movement.createdAt).toLocaleString()} • By {movement.createdBy.name}</span>
                      </div>
                    </div>
                    <div className={`font-mono font-bold text-sm ${movement.movementType === 'IN' ? 'text-status-success' : 'text-status-error'}`}>
                      {movement.movementType === 'IN' ? '+' : '-'}{movement.quantity}
                    </div>
                  </div>
                ))}
                <div className="mt-2 text-center">
                  <Button variant="outline" size="sm" onClick={() => navigate('/app/inventory/movements')}>
                    View Full Ledger
                  </Button>
                </div>
              </div>
            )}
          </DataPanel>
        </div>

        <div className="flex flex-col gap-6">
          <DataPanel className="flex items-center justify-center p-12 border-dashed border-line-secondary bg-surface-primary/30 min-h-[300px]">
            <div className="flex flex-col items-center opacity-60 text-center max-w-sm">
              <Package className="w-8 h-8 mb-4 text-content-tertiary" />
              <span className="font-mono text-xs font-semibold tracking-widest uppercase text-content-primary mb-2">Sales Analytics</span>
              <span className="text-xs text-content-tertiary leading-relaxed">Historical sales volume and performance metrics will appear here.</span>
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
