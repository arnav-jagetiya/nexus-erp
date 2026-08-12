import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSidebar } from '../../providers/SidebarProvider';
import { Theme } from '../../types';
import { Monitor, Moon, Sun, LayoutPanelLeft, User, Shield, Activity, LogOut } from 'lucide-react';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary tracking-tight">System Settings</h1>
          <p className="text-sm text-content-tertiary mt-1">Manage your workspace preferences and account details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div className="bg-surface-secondary border border-line-primary rounded-lg p-5 shadow-spatial-md">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-semibold text-content-primary">Appearance</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-2 uppercase tracking-wider">
                Interface Theme
              </label>
              <div className="flex p-1 bg-surface-primary border border-line-primary rounded-md">
                {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium rounded capitalize flex items-center justify-center gap-2 transition-colors ${
                      theme === t 
                        ? 'bg-surface-elevated shadow-sm text-brand border border-line-primary' 
                        : 'text-content-secondary hover:text-content-primary hover:bg-surface-tertiary'
                    }`}
                  >
                    {t === 'light' && <Sun className="w-4 h-4" />}
                    {t === 'dark' && <Moon className="w-4 h-4" />}
                    {t === 'system' && <Monitor className="w-4 h-4" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-2 uppercase tracking-wider">
                Sidebar Default State
              </label>
              <div className="flex items-center justify-between p-3 bg-surface-primary border border-line-primary rounded-md">
                <div className="flex items-center gap-3">
                  <LayoutPanelLeft className="w-5 h-5 text-content-tertiary" />
                  <div>
                    <p className="text-sm font-medium text-content-primary">Collapsed Sidebar</p>
                    <p className="text-xs text-content-tertiary">Start with icons only to maximize screen space.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isCollapsed ? 'bg-brand' : 'bg-surface-tertiary border border-line-primary'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isCollapsed ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-surface-secondary border border-line-primary rounded-lg p-5 shadow-spatial-md">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-semibold text-content-primary">Account Details</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1">
                Full Name
              </label>
              <p className="text-sm font-medium text-content-primary px-3 py-2 bg-surface-primary border border-line-primary rounded-md">
                {user?.name}
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1">
                Email Address
              </label>
              <p className="text-sm font-medium text-content-primary px-3 py-2 bg-surface-primary border border-line-primary rounded-md font-mono">
                {user?.email}
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1">
                Assigned Role
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-primary border border-line-primary rounded-md">
                <Shield className="w-4 h-4 text-brand" />
                <span className="text-sm font-medium text-brand uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="bg-surface-secondary border border-line-primary rounded-lg p-5 shadow-spatial-md md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand" />
              <h2 className="text-lg font-semibold text-content-primary">Current Session</h2>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-primary border border-line-primary rounded-md">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <p className="text-sm font-bold text-content-primary">Active Connection</p>
              </div>
              <p className="text-xs text-content-tertiary mt-1 font-mono">
                Environment: DEMO PORTAL<br/>
                Client: {navigator.userAgent.split(' ')[0]}
              </p>
            </div>
            
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-status-danger-bg text-status-danger border border-status-danger/20 hover:bg-status-danger hover:text-white rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Terminate Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
