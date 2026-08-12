import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Plus, ChevronRight, CheckCircle2, CircleDashed, XCircle } from 'lucide-react';
import { useChallans } from '../../hooks/useChallans';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';
import { CommandBar } from '../../components/ui/CommandBar';
import { DataPanel } from '../../components/ui/DataPanel';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ChallanStatus, ChallanDTO } from '../../api/challans';

export function ChallansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChallanStatus | ''>('');

  const { data, isLoading, isError } = useChallans({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const challans = data?.data || [];
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-12">
      <PageHeader 
        title="Sales Challans" 
        description="Manage customer orders, draft challans, and confirmations."
        icon={<FileText className="w-6 h-6" />}
        actions={
          canCreate && (
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('new')}>
              Create Challan
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
                placeholder="Search challan number..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-secondary border border-line-secondary rounded-md text-sm text-content-primary focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-surface-secondary p-1 rounded-md border border-line-secondary">
              <button
                type="button"
                onClick={() => setStatusFilter('')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  statusFilter === '' ? 'bg-surface-primary text-content-primary shadow-spatial-low' : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('DRAFT')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                  statusFilter === 'DRAFT' ? 'bg-status-warning/10 text-status-warning shadow-spatial-low' : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                <CircleDashed className="w-3 h-3" /> Draft
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('CONFIRMED')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                  statusFilter === 'CONFIRMED' ? 'bg-status-success/10 text-status-success shadow-spatial-low' : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> Confirmed
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('CANCELLED')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                  statusFilter === 'CANCELLED' ? 'bg-status-error/10 text-status-error shadow-spatial-low' : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                <XCircle className="w-3 h-3" /> Cancelled
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-content-secondary font-mono mt-4 md:mt-0">
            <span>{challans.length} Records</span>
          </div>
        </CommandBar>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Challan Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-status-error py-8">
                    Failed to load challans. Please try again.
                  </TableCell>
                </TableRow>
              ) : challans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <FileText className="w-12 h-12 text-content-tertiary mb-4 opacity-50" />
                      <h3 className="text-sm font-semibold text-content-primary mb-1">No challans found</h3>
                      <p className="text-xs text-content-secondary max-w-sm mb-6">
                        No sales documents match your current filters.
                      </p>
                      {canCreate && !search && !statusFilter && (
                        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('new')}>
                          Create Challan
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                challans.map((row: ChallanDTO) => (
                  <TableRow key={row.id} className="group cursor-pointer" onClick={() => navigate(row.id)}>
                    <TableCell>
                      <span className="font-mono font-semibold text-content-primary group-hover:text-brand transition-colors">{row.challanNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-content-primary">{row.customer.name}</span>
                        <span className="text-[10px] tracking-wide text-content-tertiary uppercase">{row.customer.businessName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-content-secondary font-mono">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-mono text-content-primary">{row.items.length}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-bold text-content-primary">
                      ₹{Number(row.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={row.status} 
                        variant={row.status === 'CONFIRMED' ? 'success' : row.status === 'DRAFT' ? 'warning' : 'error'} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); navigate(row.id); }}>
                        View <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
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
