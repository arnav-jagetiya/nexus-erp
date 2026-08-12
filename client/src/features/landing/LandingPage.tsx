import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { ArrowRight, Sun, Moon, Users, Package, FileText, Boxes, Shield, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';

function NexusNetworkSVG() {
  return (
    <svg viewBox="0 0 600 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Grid lines */}
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" className="[stop-color:var(--color-accent)]" stopOpacity="0.4" />
          <stop offset="100%" className="[stop-color:var(--color-accent)]" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="copperLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" className="[stop-color:var(--color-accent)]" stopOpacity="0" />
          <stop offset="50%" className="[stop-color:var(--color-accent)]" stopOpacity="0.6" />
          <stop offset="100%" className="[stop-color:var(--color-accent)]" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0" />
          <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Connection lines */}
      <line x1="300" y1="140" x2="160" y2="240" stroke="url(#copperLine)" strokeWidth="1.5" />
      <line x1="300" y1="140" x2="440" y2="240" stroke="url(#copperLine)" strokeWidth="1.5" />
      <line x1="300" y1="140" x2="300" y2="300" stroke="url(#cyanLine)" strokeWidth="1" />
      <line x1="160" y1="240" x2="300" y2="300" stroke="url(#cyanLine)" strokeWidth="1" />
      <line x1="440" y1="240" x2="300" y2="300" stroke="url(#cyanLine)" strokeWidth="1" />
      <line x1="160" y1="240" x2="440" y2="240" stroke="url(#copperLine)" strokeWidth="1" strokeDasharray="4 4" />

      {/* Central Hub — NEXUS */}
      <circle cx="300" cy="140" r="40" fill="url(#nodeGlow)" />
      <circle cx="300" cy="140" r="6" className="fill-brand" />
      <circle cx="300" cy="140" r="14" fill="none" className="stroke-brand" strokeWidth="1" strokeDasharray="3 3" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" values="0 300 140;360 300 140" dur="20s" repeatCount="indefinite" />
      </circle>

      {/* CRM Node */}
      <g className="transition-transform duration-300 ease-out hover:-translate-y-1">
        <circle cx="160" cy="240" r="30" fill="url(#cyanGlow)" />
        <circle cx="160" cy="240" r="4" stopColor="#06B6D4" fill="#06B6D4" />
        <text x="160" y="286" textAnchor="middle" className="fill-content-tertiary text-[10px] font-mono">CRM</text>
      </g>

      {/* Inventory Node */}
      <g className="transition-transform duration-300 ease-out hover:-translate-y-1">
        <circle cx="440" cy="240" r="30" fill="url(#cyanGlow)" />
        <circle cx="440" cy="240" r="4" fill="#06B6D4" />
        <text x="440" y="286" textAnchor="middle" className="fill-content-tertiary text-[10px] font-mono">INVENTORY</text>
      </g>

      {/* Challans Node */}
      <g className="transition-transform duration-300 ease-out hover:-translate-y-1">
        <circle cx="300" cy="300" r="30" fill="url(#nodeGlow)" />
        <circle cx="300" cy="300" r="4" className="fill-brand" />
        <text x="300" y="346" textAnchor="middle" className="fill-content-tertiary text-[10px] font-mono">CHALLANS</text>
      </g>

      {/* Data flow pulses */}
      <circle r="2" className="fill-brand" opacity="0.8">
        <animateMotion dur="4s" repeatCount="indefinite" path="M300,140 L160,240" />
      </circle>
      <circle r="2" fill="#06B6D4" opacity="0.8">
        <animateMotion dur="5s" repeatCount="indefinite" path="M300,140 L440,240" />
      </circle>
      <circle r="2" className="fill-brand" opacity="0.6">
        <animateMotion dur="6s" repeatCount="indefinite" path="M160,240 L300,300 L440,240" />
      </circle>
    </svg>
  );
}

function ModuleIndicator({ icon, label, description }: { icon: React.ReactNode; label: string; description: string }) {
  return (
    <div className="group relative flex items-start gap-4 p-5 rounded-lg border border-line-secondary bg-surface-primary shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-spatial-lg hover:border-brand/40 overflow-hidden">
      {/* Subtle top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-brand-subtle border border-brand/10 flex items-center justify-center text-brand transition-transform duration-300 ease-out group-hover:scale-110 group-hover:shadow-spatial-md">
        {icon}
      </div>
      <div className="transition-transform duration-300 ease-out group-hover:translate-x-1">
        <p className="text-xs font-semibold text-content-primary font-mono tracking-wider uppercase transition-colors group-hover:text-brand">{label}</p>
        <p className="text-[11px] text-content-tertiary mt-1.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary flex flex-col">
      {/* Subtle background grid & structural lines */}
      <div className="fixed inset-0 bg-nexus-grid opacity-30 pointer-events-none" />
      <div className="fixed inset-0 border-l border-r border-line-primary/30 max-w-7xl mx-auto pointer-events-none" />
      
      <div className="fixed inset-0 pointer-events-none" style={{
        background: resolvedTheme === 'dark'
          ? 'radial-gradient(ellipse at 50% -10%, rgba(245,158,11,0.06) 0%, transparent 60%), radial-gradient(ellipse at 85% 85%, rgba(6,182,212,0.04) 0%, transparent 50%)'
          : 'radial-gradient(ellipse at 50% -10%, rgba(217,119,6,0.06) 0%, transparent 60%), radial-gradient(ellipse at 85% 85%, rgba(13,148,136,0.04) 0%, transparent 50%)'
      }} />

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-brand flex items-center justify-center shadow-spatial-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-[0.2em] text-content-primary">NEXUS</span>
              <span className="ml-1.5 text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-brand-subtle text-brand border border-brand/15 rounded">ERP</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md border border-line-primary bg-surface-secondary hover:bg-surface-tertiary text-content-secondary transition-all"
              title="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand hover:bg-brand-hover text-white rounded-md shadow-spatial-md hover:shadow-spatial-lg transition-all active:scale-[0.98]"
            >
              Enter NEXUS
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12 lg:py-0">
          {/* Left: Identity & CTA */}
          <div className="flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 max-w-12 bg-brand/50" />
                <span className="text-[10px] font-mono font-semibold tracking-[0.25em] text-brand uppercase">Operations Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                <span className="text-content-primary">Operations,</span>
                <br />
                <span className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r",
                  resolvedTheme === 'dark'
                    ? "from-amber-400 via-amber-300 to-cyan-400"
                    : "from-amber-600 via-amber-500 to-teal-500"
                )}>
                  Orchestrated.
                </span>
              </h1>

              <p className="mt-6 text-sm sm:text-base text-content-secondary leading-relaxed max-w-md">
                Unified command over your customer relationships, product inventory, and sales challan workflows — designed for wholesale and distribution operations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold bg-brand hover:bg-brand-hover text-white rounded-md shadow-spatial-lg hover:shadow-spatial-lg transition-all active:scale-[0.98]"
              >
                Enter NEXUS
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 text-[11px] font-mono text-content-tertiary py-3">
                <Shield className="w-3.5 h-3.5" />
                <span>Role-based secure access</span>
              </div>
            </div>

            {/* System status */}
            <div className="flex items-center gap-4 text-[10px] font-mono text-content-tertiary border-t border-line-secondary pt-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                SYSTEM ONLINE
              </span>
              <span className="text-line-primary">|</span>
              <span>v1.0.0</span>
              <span className="text-line-primary">|</span>
              <span>4 ROLES PROVISIONED</span>
            </div>
          </div>

          {/* Right: Network Visualization */}
          <div className="relative flex items-center justify-center group perspective-[1000px]">
            <div className="w-full max-w-md lg:max-w-lg aspect-[3/2] transition-transform duration-500 ease-out group-hover:[transform:rotateX(2deg)_rotateY(-2deg)]">
              <NexusNetworkSVG />
            </div>
          </div>
        </div>

        {/* Operational Modules */}
        <div className="max-w-6xl w-full mx-auto pb-16 pt-8 lg:pt-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 max-w-8 bg-line-primary" />
            <span className="text-[10px] font-mono font-semibold tracking-[0.2em] text-content-tertiary uppercase">Operational Modules</span>
            <div className="h-px flex-1 bg-line-primary" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ModuleIndicator
              icon={<Users className="w-4 h-4" />}
              label="Customer CRM"
              description="Lifecycle tracking, follow-ups, and business contact management."
            />
            <ModuleIndicator
              icon={<Package className="w-4 h-4" />}
              label="Products"
              description="Catalog management with SKU, pricing, and category organization."
            />
            <ModuleIndicator
              icon={<Boxes className="w-4 h-4" />}
              label="Inventory"
              description="Real-time stock levels, movement tracking, and low-stock alerts."
            />
            <ModuleIndicator
              icon={<FileText className="w-4 h-4" />}
              label="Sales Challans"
              description="Draft-to-confirmed workflow with atomic stock deduction."
            />
          </div>
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
