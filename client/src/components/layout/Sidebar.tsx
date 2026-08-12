import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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

import { useSidebar } from '../../providers/SidebarProvider';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const { isCollapsed, toggleCollapse, setIsMobileOpen } = useSidebar();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/app/dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'Customers',
      path: '/app/customers',
      icon: <Users className="w-5 h-5 shrink-0" />,
      roles: ['ADMIN', 'SALES', 'ACCOUNTS'],
    },
    {
      label: 'Products',
      path: '/app/products',
      icon: <Package className="w-5 h-5 shrink-0" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'Inventory',
      path: '/app/inventory',
      icon: <Boxes className="w-5 h-5 shrink-0" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'Sales Challans',
      path: '/app/challans',
      icon: <FileText className="w-5 h-5 shrink-0" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'User Access',
      path: '/app/users',
      icon: <Users className="w-5 h-5 shrink-0" />,
      roles: ['ADMIN'],
    },
    {
      label: 'Settings',
      path: '/app/settings',
      icon: <Settings className="w-5 h-5 shrink-0" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
  ];

  const userRole = user?.role || 'ADMIN';
  const visibleNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-out border-r border-line-primary bg-surface-secondary flex flex-col justify-between h-screen sticky top-0 z-50`}>
      <div className="flex flex-col h-full relative">
        {/* Brand Header */}
        <div className="h-16 border-b border-line-primary px-4 flex items-center gap-3 shrink-0 relative">
          <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-white shadow-sm font-bold text-sm shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="whitespace-nowrap transition-opacity duration-300">
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
          )}
        </div>

        {/* Module Navigation Group */}
        <div className={`p-3 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar`}>
          {!isCollapsed && (
            <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-content-tertiary px-3 mb-2 whitespace-nowrap">
              Modules
            </p>
          )}
          <nav className="flex flex-col gap-1">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'} rounded-md text-xs font-medium transition-all duration-300 ease-out overflow-hidden ${
                    isActive
                      ? 'bg-brand text-white shadow-spatial-sm font-semibold'
                      : 'text-content-secondary hover:bg-surface-tertiary hover:text-content-primary hover:translate-x-1 hover:shadow-sm'
                  }`
                }
              >
                {/* Active Indicator Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-300 ${item.path === location.pathname ? 'bg-white' : 'bg-brand opacity-0 group-hover:opacity-100'}`} />
                
                <div className={`transition-transform duration-300 ${item.path !== location.pathname ? 'group-hover:text-brand group-hover:scale-110' : ''}`}>
                  {item.icon}
                </div>
                
                {!isCollapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
                
                {!isCollapsed && item.label === 'User Access' && userRole === 'ADMIN' && (
                  <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-brand-subtle text-brand border border-brand/20 rounded-full text-[9px] font-bold">
                    !
                  </span>
                )}
                {isCollapsed && item.label === 'User Access' && userRole === 'ADMIN' && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full border border-surface-secondary"></span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer System Info & Collapse Toggle */}
        <div className="shrink-0 flex items-center justify-between border-t border-line-primary relative bg-surface-secondary">
          <div className={`p-4 text-[10px] font-mono text-content-tertiary whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 p-0 overflow-hidden' : 'opacity-100 flex-1'}`}>
            <div className="flex items-center justify-between">
              <span>ENV: DEMO</span>
              <span className="text-status-success font-semibold">● ONLINE</span>
            </div>
            <p className="mt-1 truncate">ROLE: {userRole}</p>
          </div>
          <button 
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            className={`hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-elevated border border-line-primary items-center justify-center text-content-secondary hover:text-brand hover:border-brand shadow-sm z-50 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
