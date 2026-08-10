import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Monitor, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Badge } from '../ui/Badge';
import { Theme } from '../../types';

export function Header() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const getBreadcrumbTitle = (pathname: string) => {
    if (pathname.includes('/customers')) return 'Customers CRM';
    if (pathname.includes('/products')) return 'Products Catalog';
    if (pathname.includes('/inventory')) return 'Inventory & Stock';
    if (pathname.includes('/challans')) return 'Sales Challans';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'SALES':
        return 'info';
      case 'WAREHOUSE':
        return 'warning';
      case 'ACCOUNTS':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <header className="h-16 border-b border-line-primary bg-surface-secondary px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb / Page Title */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-content-tertiary">SYS //</span>
        <h1 className="text-base font-semibold text-content-primary">
          {getBreadcrumbTitle(location.pathname)}
        </h1>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-4">
        {/* Theme Selector Menu */}
        <div className="relative">
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className="p-2 rounded-md border border-line-primary bg-surface-primary hover:bg-surface-tertiary text-content-secondary transition-colors"
            title="Toggle theme"
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : theme === 'dark' ? (
              <Moon className="w-4 h-4 text-blue-400" />
            ) : (
              <Monitor className="w-4 h-4 text-content-secondary" />
            )}
          </button>

          {isThemeOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-md border border-line-primary bg-surface-secondary shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setTheme('light');
                  setIsThemeOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-surface-tertiary ${
                  theme === 'light' ? 'text-brand font-semibold' : 'text-content-secondary'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" /> Light
              </button>
              <button
                onClick={() => {
                  setTheme('dark');
                  setIsThemeOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-surface-tertiary ${
                  theme === 'dark' ? 'text-brand font-semibold' : 'text-content-secondary'
                }`}
              >
                <Moon className="w-4 h-4 text-blue-400" /> Dark
              </button>
              <button
                onClick={() => {
                  setTheme('system');
                  setIsThemeOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-surface-tertiary ${
                  theme === 'system' ? 'text-brand font-semibold' : 'text-content-secondary'
                }`}
              >
                <Monitor className="w-4 h-4 text-content-secondary" /> System
              </button>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-line-primary"></div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-surface-tertiary transition-colors"
          >
            <div className="w-8 h-8 rounded-md bg-brand-subtle border border-brand/20 flex items-center justify-center text-brand font-semibold text-xs">
              {user?.name?.slice(0, 2).toUpperCase() || 'NX'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-content-primary flex items-center gap-1.5">
                {user?.name}
                <ChevronDown className="w-3 h-3 text-content-tertiary" />
              </div>
              <Badge variant={getRoleBadgeVariant(user?.role)} size="sm">
                {user?.role}
              </Badge>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-line-primary bg-surface-secondary shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-line-primary">
                <p className="text-xs font-semibold text-content-primary">{user?.name}</p>
                <p className="text-xs font-mono text-content-tertiary truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full px-4 py-2 text-xs text-status-danger hover:bg-surface-tertiary flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
