import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  Settings,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export function Sidebar() {
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/app/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'Customers',
      path: '/app/customers',
      icon: <Users className="w-4 h-4" />,
      roles: ['ADMIN', 'SALES', 'ACCOUNTS'],
    },
    {
      label: 'Products',
      path: '/app/products',
      icon: <Package className="w-4 h-4" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'Inventory',
      path: '/app/inventory',
      icon: <Boxes className="w-4 h-4" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'Sales Challans',
      path: '/app/challans',
      icon: <FileText className="w-4 h-4" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'Settings',
      path: '/app/settings',
      icon: <Settings className="w-4 h-4" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
  ];

  const userRole = user?.role || 'ADMIN';
  const visibleNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 border-r border-line-primary bg-surface-secondary flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-line-primary px-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-white shadow-sm font-bold text-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wider text-content-primary">NEXUS</span>
              <span className="text-[10px] font-mono font-semibold px-1 py-0.2 bg-brand-subtle text-brand border border-brand/20 rounded">
                ERP
              </span>
            </div>
            <p className="text-[10px] text-content-tertiary font-mono uppercase tracking-widest">
              Ops Portal v1.0
            </p>
          </div>
        </div>

        {/* Module Navigation Group */}
        <div className="p-4">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-content-tertiary px-3 mb-2">
            Modules
          </p>
          <nav className="flex flex-col gap-1">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand text-white shadow-xs font-semibold'
                      : 'text-content-secondary hover:bg-surface-tertiary hover:text-content-primary'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="p-4 border-t border-line-primary text-[10px] font-mono text-content-tertiary">
        <div className="flex items-center justify-between">
          <span>ENV: DEMO</span>
          <span className="text-status-success font-semibold">● ONLINE</span>
        </div>
        <p className="mt-1 truncate">ROLE: {userRole}</p>
      </div>
    </aside>
  );
}
