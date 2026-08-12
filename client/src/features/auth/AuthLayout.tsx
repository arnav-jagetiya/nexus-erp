import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { Sun, Moon, Activity, AlertCircle, Info } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footerLinks?: React.ReactNode;
}

export function AuthLayout({ children, title, subtitle, footerLinks }: AuthLayoutProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary flex flex-col">
      {/* Subtle background grid & structural lines */}
      <div className="fixed inset-0 bg-nexus-grid opacity-30 pointer-events-none z-0" />
      <div className="fixed inset-0 border-l border-r border-line-primary/30 max-w-7xl mx-auto pointer-events-none z-0" />
      
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: resolvedTheme === 'dark'
          ? 'radial-gradient(ellipse at 50% -10%, rgba(245,158,11,0.06) 0%, transparent 60%), radial-gradient(ellipse at 85% 85%, rgba(6,182,212,0.04) 0%, transparent 50%)'
          : 'radial-gradient(ellipse at 50% -10%, rgba(217,119,6,0.06) 0%, transparent 60%), radial-gradient(ellipse at 85% 85%, rgba(13,148,136,0.04) 0%, transparent 50%)'
      }} />

      {/* Top bar */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center shadow-spatial-low group-hover:shadow-spatial-md transition-shadow">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-[0.2em] text-content-primary">NEXUS</span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-brand-subtle text-brand border border-brand/15 rounded">ERP</span>
            </div>
          </Link>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md border border-line-primary bg-surface-secondary hover:bg-surface-tertiary text-content-secondary transition-all"
            title="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Auth header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-content-primary tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-content-secondary mt-2">{subtitle}</p>}
          </div>

          {/* Auth form area */}
          <div className="bg-surface-secondary border border-line-primary rounded-lg shadow-spatial-md overflow-hidden">
            {/* Top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />

            <div className="p-6 sm:p-8">
              {children}
            </div>
          </div>

          {/* Footer links */}
          {footerLinks && (
            <div className="mt-6 text-center text-sm text-content-secondary">
              {footerLinks}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 border-t border-line-secondary">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-[10px] font-mono text-content-tertiary">
          <span>NEXUS ERP &copy; 2026</span>
          <span>Built by Arnav Jagetiya</span>
        </div>
      </footer>
    </div>
  );
}

/** Reusable notice banner for unavailable backend endpoints */
export function BackendUnavailableNotice({ feature }: { feature: string }) {
  return (
    <div className="mb-5 p-3 rounded-md bg-status-info-bg border border-status-info/20 flex items-start gap-2.5">
      <Info className="w-4 h-4 text-status-info flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-status-info">{feature} is not yet connected</p>
        <p className="text-[11px] text-content-secondary mt-1 leading-relaxed">
          This form previews the intended UX. The required backend endpoint has not been implemented yet. Contact your administrator.
        </p>
      </div>
    </div>
  );
}

/** Error alert for auth forms */
export function AuthErrorAlert({ message }: { message: string }) {
  return (
    <div className="mb-5 p-3 rounded-md bg-status-danger-bg border border-status-danger/20 flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
      <span className="text-xs text-status-danger">{message}</span>
    </div>
  );
}
