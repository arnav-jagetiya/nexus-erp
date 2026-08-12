import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, Users, FileText, Activity, Layers, ArrowUpRight, 
  ArrowDownRight, TrendingUp, Package, Shield, CreditCard, Clock, Boxes,
  CheckCircle, AlertTriangle, Ban, ShieldAlert, BarChart3, Receipt, History
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricPanel } from '../../components/ui/MetricPanel';
import { DataPanel } from '../../components/ui/DataPanel';
import { CommandBar } from '../../components/ui/CommandBar';
import { usersApi, UserListDTO } from '../../api/users';
import { customersApi } from '../../api/customers';
import { inventoryApi } from '../../api/inventory';
import { challansApi } from '../../api/challans';

const EmptyStateArea = ({ title, description, icon: Icon, height = 'h-64' }: { title: string, description: string, icon: any, height?: string }) => (
  <DataPanel className={`flex items-center justify-center border-dashed border-line-secondary bg-surface-primary/30 shadow-none ${height}`}>
    <div className="flex flex-col items-center opacity-60 text-center max-w-md px-6">
      <Icon className="w-8 h-8 mb-4 text-content-tertiary" />
      <span className="font-mono text-xs font-semibold tracking-widest uppercase text-content-primary mb-2">{title}</span>
      <span className="text-xs text-content-tertiary leading-relaxed">{description}</span>
    </div>
  </DataPanel>
);

function AdminDashboard() {
  const [users, setUsers] = useState<UserListDTO[]>([]);
  const [totalCustomers, setTotalCustomers] = useState<number | '-'>('-');
  const [totalProducts, setTotalProducts] = useState<number | '-'>('-');
  const [challanStats, setChallanStats] = useState<{ total: number | '-'; confirmed: number | '-'; revenue: number | '-' }>({ total: '-', confirmed: '-', revenue: '-' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersApi.getUsers(),
      customersApi.getCustomers({ limit: 1 }),
      inventoryApi.getOverview(),
      challansApi.getChallans({ limit: 1000 })
    ]).then(([usersData, customersData, inventoryData, challansData]) => {
      setUsers(usersData);
      setTotalCustomers(customersData.meta?.total || 0);
      setTotalProducts(inventoryData.totalProducts);
      
      const challans = challansData.data || [];
      const confirmed = challans.filter(c => c.status === 'CONFIRMED');
      const revenue = confirmed.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
      
      setChallanStats({
        total: challansData.meta?.total || 0,
        confirmed: confirmed.length,
        revenue
      });
      
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  const totalUsers = users.length;
  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const suspendedCount = users.filter(u => u.status === 'SUSPENDED').length;
  const revokedCount = users.filter(u => u.status === 'REVOKED').length;
  const pendingCount = users.filter(u => u.approvalStatus === 'PENDING').length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Global Operations Command" 
        description="System overview, access management, and high-level performance metrics."
        icon={<Shield className="w-6 h-6" />}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricPanel label="Total Users" value={isLoading ? '-' : totalUsers} icon={<Users className="w-5 h-5 text-brand" />} trend="neutral" subValue="Registered accounts" />
        <MetricPanel label="Active Users" value={isLoading ? '-' : activeCount} icon={<CheckCircle className="w-5 h-5 text-status-success" />} trend="neutral" subValue="Operational accounts" />
        <MetricPanel label="Suspended / Revoked" value={isLoading ? '-' : suspendedCount + revokedCount} icon={<Ban className="w-5 h-5 text-status-warning" />} trend="neutral" subValue="Disabled access" />
        <MetricPanel label="Pending Requests" value={isLoading ? '-' : pendingCount} icon={<ShieldAlert className={`w-5 h-5 ${pendingCount > 0 ? 'text-status-error' : 'text-content-secondary'}`} />} trend={pendingCount > 0 ? 'down' : 'neutral'} subValue="Requires administrator review" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="flex flex-col gap-4">
          <MetricPanel 
            label="Total Customers" 
            value={totalCustomers} 
            icon={<Users className="w-5 h-5 text-brand" />} 
            trend="neutral" 
            subValue="Registered clients" 
          />
          <MetricPanel 
            label="Total Products" 
            value={totalProducts} 
            icon={<Package className="w-5 h-5 text-brand" />} 
            trend="neutral" 
            subValue="Inventory items" 
          />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricPanel 
            label="Total Challans" 
            value={challanStats.total} 
            icon={<FileText className={challanStats.total === '-' ? "w-5 h-5 opacity-50" : "w-5 h-5 text-brand"} />} 
            trend="neutral" 
            subValue="All generated documents" 
          />
          <MetricPanel 
            label="Confirmed Revenue" 
            value={challanStats.revenue !== '-' ? `₹${Number(challanStats.revenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '-'} 
            icon={<Receipt className={challanStats.revenue === '-' ? "w-5 h-5 opacity-50" : "w-5 h-5 text-status-success"} />} 
            trend="neutral" 
            subValue="From confirmed challans" 
          />
        </div>
      </div>
    </div>
  );
}

function SalesDashboard() {
  const [totalCustomers, setTotalCustomers] = useState<number | '-'>('-');
  const [challanStats, setChallanStats] = useState<{ draft: number | '-'; confirmed: number | '-'; revenue: number | '-' }>({ draft: '-', confirmed: '-', revenue: '-' });

  useEffect(() => {
    Promise.all([
      customersApi.getCustomers({ limit: 1 }),
      challansApi.getChallans({ limit: 1000 })
    ]).then(([customersData, challansData]) => {
      setTotalCustomers(customersData.meta?.total || 0);
      
      const challans = challansData.data || [];
      const drafts = challans.filter(c => c.status === 'DRAFT');
      const confirmed = challans.filter(c => c.status === 'CONFIRMED');
      const revenue = confirmed.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
      
      setChallanStats({
        draft: drafts.length,
        confirmed: confirmed.length,
        revenue
      });
    }).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Sales Operations" 
        description="Draft challans, customer follow-ups, and sales metrics."
        icon={<TrendingUp className="w-6 h-6" />}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricPanel label="Customers" value={totalCustomers} icon={<Users className={totalCustomers === '-' ? "w-5 h-5 opacity-50" : "w-5 h-5 text-brand"} />} trend="neutral" subValue={totalCustomers === '-' ? "No data yet" : "Registered clients"} />
        <MetricPanel label="Draft Challans" value={challanStats.draft} icon={<FileText className={challanStats.draft === '-' ? "w-5 h-5 opacity-50" : "w-5 h-5 text-status-warning"} />} trend="neutral" subValue="Pending confirmation" />
        <MetricPanel label="Confirmed Challans" value={challanStats.confirmed} icon={<CheckCircle className={challanStats.confirmed === '-' ? "w-5 h-5 opacity-50" : "w-5 h-5 text-status-success"} />} trend="neutral" subValue="Processed documents" />
        <MetricPanel label="Revenue" value={challanStats.revenue !== '-' ? `₹${Number(challanStats.revenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '-'} icon={<TrendingUp className={challanStats.revenue === '-' ? "w-5 h-5 opacity-50" : "w-5 h-5 text-brand"} />} trend="neutral" subValue="From confirmed orders" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <EmptyStateArea 
          title="Sales Pipeline Ready" 
          description="Create sales challans to start tracking your revenue and order pipeline."
          icon={TrendingUp}
          height="h-96" 
        />
      </div>
    </div>
  );
}

function WarehouseDashboard() {
  const [inventory, setInventory] = useState<{ total: number | '-'; lowStock: number | '-'; totalMovements: number | '-' }>({ total: '-', lowStock: '-', totalMovements: '-' });

  useEffect(() => {
    inventoryApi.getOverview()
      .then(data => setInventory({ total: data.totalProducts, lowStock: data.lowStockProducts, totalMovements: data.totalMovements }))
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Warehouse Operations" 
        description="Inventory levels, stock movements, and low stock alerts."
        icon={<Boxes className="w-6 h-6" />}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricPanel label="Inventory Items" value={inventory.total} icon={<Package className={inventory.total === '-' ? "w-5 h-5 opacity-50" : "w-5 h-5 text-brand"} />} trend="neutral" subValue="Products in catalog" />
        <MetricPanel label="Low Stock Alerts" value={inventory.lowStock} icon={<AlertTriangle className={inventory.lowStock === '-' ? "w-5 h-5 opacity-50" : inventory.lowStock > 0 ? "w-5 h-5 text-status-warning" : "w-5 h-5 text-status-success"} />} trend={inventory.lowStock !== '-' && inventory.lowStock > 0 ? 'down' : 'neutral'} subValue="Items needing restock" />
        <MetricPanel label="Stock Movements" value={inventory.totalMovements} icon={<History className={inventory.totalMovements === '-' ? "w-5 h-5 opacity-50" : "w-5 h-5 text-content-secondary"} />} trend="neutral" subValue="Total historical ledgers" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <EmptyStateArea 
          title="No inventory data yet" 
          description="Stock movements, inbound/outbound records, and low stock alerts will be tracked here once the warehouse module is active."
          icon={Boxes}
          height="h-96" 
        />
      </div>
    </div>
  );
}

function AccountsDashboard() {
  const [challanStats, setChallanStats] = useState<{ confirmed: number | '-'; revenue: number | '-' }>({ confirmed: '-', revenue: '-' });

  useEffect(() => {
    challansApi.getChallans({ limit: 1000, status: 'CONFIRMED' })
      .then(data => {
        const challans = data.data || [];
        const revenue = challans.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
        setChallanStats({ confirmed: data.meta?.total || 0, revenue });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Financial Operations" 
        description="Confirmed challan values, transaction audits, and daily totals."
        icon={<CreditCard className="w-6 h-6" />}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricPanel label="Confirmed Challans" value={challanStats.confirmed} icon={<FileText className={challanStats.confirmed === '-' ? "w-5 h-5 opacity-50" : "w-5 h-5 text-status-success"} />} trend="neutral" subValue="Processed documents" />
        <MetricPanel label="Transaction Value" value={challanStats.revenue !== '-' ? `₹${Number(challanStats.revenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '-'} icon={<CreditCard className={challanStats.revenue === '-' ? "w-5 h-5 opacity-50" : "w-5 h-5 text-brand"} />} trend="neutral" subValue="Lifetime revenue" />
        <MetricPanel label="Pending Verification" value="0" icon={<Clock className="w-5 h-5 text-status-success" />} trend="neutral" subValue="All verified" />
        <MetricPanel label="MTD Total" value={challanStats.revenue !== '-' ? `₹${Number(challanStats.revenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '-'} icon={<Receipt className={challanStats.revenue === '-' ? "w-5 h-5 opacity-50" : "w-5 h-5 text-brand"} />} trend="neutral" subValue="Estimated MTD" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <EmptyStateArea 
          title="No financial data yet" 
          description="Confirmed challans, billing verifications, and financial ledgers will appear here once transactions are processed."
          icon={CreditCard}
          height="h-96" 
        />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'SALES':
      return <SalesDashboard />;
    case 'WAREHOUSE':
      return <WarehouseDashboard />;
    case 'ACCOUNTS':
      return <AccountsDashboard />;
    default:
      return <AdminDashboard />;
  }
}
