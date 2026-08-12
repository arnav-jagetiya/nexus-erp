import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Search, Filter, Plus, ChevronRight, Phone, Mail } from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import { PageHeader } from '../../components/ui/PageHeader';
import { CommandBar } from '../../components/ui/CommandBar';
import { DataPanel } from '../../components/ui/DataPanel';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { CustomerDTO } from '../../api/customers';

export function CustomersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'LEAD' | 'ACTIVE' | 'INACTIVE' | ''>('');
  const [typeFilter, setTypeFilter] = useState<'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR' | ''>('');

  const { data, isLoading, isError } = useCustomers({
    search: search || undefined,
    status: statusFilter || undefined,
    customerType: typeFilter || undefined,
  });

  const customers = data?.data || [];
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Customers" 
        description="Customer relationship management"
        icon={<Users className="w-6 h-6" />}
        actions={
          canCreate && (
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('new')}>
              New Customer
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
                placeholder="Search customers..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-secondary border border-line-secondary rounded-md text-sm text-content-primary focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-content-tertiary hidden sm:block" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-surface-secondary border border-line-secondary rounded-md px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-brand/50"
              >
                <option value="">All Statuses</option>
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="bg-surface-secondary border border-line-secondary rounded-md px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-brand/50"
              >
                <option value="">All Types</option>
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
              {(search || statusFilter || typeFilter) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-content-secondary font-mono mt-4 md:mt-0">
            <span>{customers.length} Records</span>
          </div>
        </CommandBar>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer / Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-status-error py-8">
                    Failed to load customers. Please try again.
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <Users className="w-12 h-12 text-content-tertiary mb-4 opacity-50" />
                      <h3 className="text-sm font-semibold text-content-primary mb-1">No customers yet</h3>
                      <p className="text-xs text-content-secondary max-w-sm mb-6">
                        Your customer workspace is ready. Create your first customer to begin.
                      </p>
                      {canCreate && (
                        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('new')}>
                          Create Customer
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((row: CustomerDTO) => (
                  <TableRow key={row.id} className="group cursor-pointer" onClick={() => navigate(row.id)}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-content-primary">{row.name}</span>
                        <span className="text-xs text-content-tertiary">{row.businessName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-content-secondary font-mono">
                          <Phone className="w-3 h-3 text-content-tertiary" /> {row.mobile}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-content-secondary">
                          <Mail className="w-3 h-3 text-content-tertiary" /> {row.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold tracking-wider text-content-secondary">
                        {row.customerType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={row.status} 
                        variant={row.status === 'ACTIVE' ? 'success' : row.status === 'INACTIVE' ? 'error' : 'info'} 
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
