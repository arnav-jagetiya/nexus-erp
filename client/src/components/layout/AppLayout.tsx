import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ErrorBoundary } from '../ui/ErrorBoundary';

import { useTheme } from '../../hooks/useTheme';
import { useSidebar } from '../../providers/SidebarProvider';

export function AppLayout() {
  const { resolvedTheme } = useTheme();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen flex bg-surface-primary text-content-primary print:bg-white relative overflow-hidden">
      {/* Subtle background grid & structural lines */}
      <div className="fixed inset-0 bg-nexus-grid opacity-30 pointer-events-none z-0" />
      <div className="fixed inset-0 border-l border-r border-line-primary/30 max-w-7xl mx-auto pointer-events-none z-0" />
      
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: resolvedTheme === 'dark'
          ? 'radial-gradient(ellipse at 50% -10%, rgba(245,158,11,0.06) 0%, transparent 60%), radial-gradient(ellipse at 85% 85%, rgba(6,182,212,0.04) 0%, transparent 50%)'
          : 'radial-gradient(ellipse at 50% -10%, rgba(217,119,6,0.06) 0%, transparent 60%), radial-gradient(ellipse at 85% 85%, rgba(13,148,136,0.04) 0%, transparent 50%)'
      }} />

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden animate-in fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={`print:hidden z-50 flex-shrink-0 fixed inset-y-0 left-0 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 print:block z-10 h-screen overflow-hidden relative">
        <div className="print:hidden z-50 flex-shrink-0 relative">
          <Header />
        </div>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden print:p-0 print:overflow-visible z-10 relative">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
