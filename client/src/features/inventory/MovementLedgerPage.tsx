import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, ArrowLeft, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useStockMovements } from '../../hooks/useInventory';
import { PageHeader } from '../../components/ui/PageHeader';
import { CommandBar } from '../../components/ui/CommandBar';
import { DataPanel } from '../../components/ui/DataPanel';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';

export function MovementLedgerPage() {
  const navigate = useNavigate();
  
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | ''>('');

  const { data, isLoading, isError } = useStockMovements({
    movementType: movementType || undefined,
  });

  const movements = data?.data || [];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/app/inventory')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
      </div>

      <PageHeader 
        title="Movement Ledger" 
        description="Immutable record of all historical stock adjustments."
        icon={<History className="w-6 h-6" />}
      />

      <DataPanel>
        <CommandBar>
          <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-2 bg-surface-secondary p-1 rounded-md border border-line-secondary">
              <button
                type="button"
                onClick={() => setMovementType('')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  movementType === '' ? 'bg-surface-primary text-content-primary shadow-spatial-low' : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setMovementType('IN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                  movementType === 'IN' ? 'bg-status-success/10 text-status-success shadow-spatial-low' : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                <ArrowDownToLine className="w-3 h-3" /> IN
              </button>
              <button
                type="button"
                onClick={() => setMovementType('OUT')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                  movementType === 'OUT' ? 'bg-status-error/10 text-status-error shadow-spatial-low' : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                <ArrowUpFromLine className="w-3 h-3" /> OUT
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-content-secondary font-mono mt-4 md:mt-0">
            <span>{movements.length} Records</span>
          </div>
        </CommandBar>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Product / SKU</TableHead>
                <TableHead>Movement</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-status-error py-8">
                    Failed to load movement ledger. Please try again.
                  </TableCell>
                </TableRow>
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <History className="w-12 h-12 text-content-tertiary mb-4 opacity-50" />
                      <h3 className="text-sm font-semibold text-content-primary mb-1">No movements found</h3>
                      <p className="text-xs text-content-secondary max-w-sm">
                        There are no stock movements recorded that match your criteria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm font-mono text-content-secondary">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-content-primary hover:text-brand cursor-pointer" onClick={() => navigate(`/app/products/${row.product.id}`)}>{row.product.name}</span>
                        <span className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase">{row.product.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={row.movementType} 
                        variant={row.movementType === 'IN' ? 'success' : 'error'} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono font-bold text-sm ${row.movementType === 'IN' ? 'text-status-success' : 'text-status-error'}`}>
                        {row.movementType === 'IN' ? '+' : '-'}{row.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-content-primary">{row.reason}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-content-secondary">{row.createdBy.name}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DataPanel>
    </div>
  );
}
