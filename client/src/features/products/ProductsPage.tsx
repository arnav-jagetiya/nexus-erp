import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Filter, Plus, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';
import { CommandBar } from '../../components/ui/CommandBar';
import { DataPanel } from '../../components/ui/DataPanel';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ProductDTO } from '../../api/products';

export function ProductsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);

  const { data, isLoading, isError } = useProducts({
    search: search || undefined,
  });

  const allLoadedProducts = data?.data || [];
  
  const uniqueCategories = Array.from(new Set(allLoadedProducts.map((p: ProductDTO) => p.category))).filter(Boolean).sort();

  const products = allLoadedProducts.filter((p: ProductDTO) => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (lowStockFilter) {
      const isOutOfStock = p.currentStock === 0;
      const isLowStock = !isOutOfStock && p.currentStock < p.minStockAlert;
      if (!isLowStock) return false;
    }
    return true;
  });
  const canCreate = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Product Catalog" 
        description="Inventory items and stock availability"
        icon={<Package className="w-6 h-6" />}
        actions={
          canCreate && (
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('new')}>
              New Product
            </Button>
          )
        }
      />

      <DataPanel>
        <CommandBar>
          <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
              <input 
                type="text" 
                placeholder="Search products or SKU..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-secondary border border-line-secondary rounded-md text-sm text-content-primary focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-content-tertiary hidden sm:block" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-40 px-3 py-2 bg-surface-secondary border border-line-secondary rounded-md text-sm text-content-primary focus:outline-none focus:border-brand/50 transition-colors"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat as string} value={cat as string}>{cat as string}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setLowStockFilter(!lowStockFilter)}
                className={`px-3 py-2 rounded-md text-sm transition-colors border ${
                  lowStockFilter 
                    ? 'bg-status-warning/10 text-status-warning border-status-warning/20' 
                    : 'bg-surface-secondary text-content-secondary border-line-secondary'
                }`}
              >
                Low Stock
              </button>
              {(search || categoryFilter || lowStockFilter) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setSearch(''); setCategoryFilter(''); setLowStockFilter(false); }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-content-secondary font-mono mt-4 md:mt-0">
            <span>{products.length} Records</span>
          </div>
        </CommandBar>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product / SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-status-error py-8">
                    Failed to load products. Please try again.
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <Package className="w-12 h-12 text-content-tertiary mb-4 opacity-50" />
                      <h3 className="text-sm font-semibold text-content-primary mb-1">No products found</h3>
                      <p className="text-xs text-content-secondary max-w-sm mb-6">
                        Your product catalog is empty or no products match your filters.
                      </p>
                      {canCreate && !search && !categoryFilter && !lowStockFilter && (
                        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('new')}>
                          Create Product
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((row: ProductDTO) => {
                  const isOutOfStock = row.currentStock === 0;
                  const isLowStock = !isOutOfStock && row.currentStock < row.minStockAlert;
                  
                  return (
                    <TableRow key={row.id} className="group cursor-pointer" onClick={() => navigate(row.id)}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-content-primary">{row.name}</span>
                          <span className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase">{row.sku}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-content-secondary px-2 py-1 bg-surface-secondary border border-line-secondary rounded-md">
                          {row.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-content-primary">
                        ₹{Number(row.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`font-mono text-sm font-semibold ${isOutOfStock ? 'text-status-error' : isLowStock ? 'text-status-warning' : 'text-content-primary'}`}>
                            {row.currentStock}
                          </span>
                          <span className="text-[10px] text-content-tertiary font-mono">Min: {row.minStockAlert}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-content-secondary">{row.location}</span>
                      </TableCell>
                      <TableCell>
                        {isOutOfStock ? (
                          <StatusBadge status="OUT OF STOCK" variant="error" />
                        ) : isLowStock ? (
                          <StatusBadge status="LOW STOCK" variant="warning" />
                        ) : (
                          <StatusBadge status="HEALTHY" variant="success" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); navigate(row.id); }}>
                          View <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DataPanel>
    </div>
  );
}
