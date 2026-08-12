import React from 'react';
import { cn } from '../../utils/cn';

interface MetricPanelProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  subValue?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricPanel({ label, value, icon, subValue, trend, className }: MetricPanelProps) {
  return (
    <div className={cn(
      "group relative flex flex-col p-5 rounded-lg border border-line-secondary bg-surface-secondary shadow-spatial-md",
      "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-spatial-lg hover:border-brand/40 overflow-hidden",
      className
    )}>
      {/* Subtle top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-content-tertiary uppercase tracking-wider transition-colors group-hover:text-brand">
          {label}
        </span>
        {icon && (
          <div className="text-content-secondary transition-transform duration-300 ease-out group-hover:scale-110 group-hover:text-brand">
            {icon}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-2xl font-bold text-content-primary font-mono tracking-tight">{value}</p>
        {subValue && (
          <p className={cn(
            "text-[11px] mt-2 font-medium flex items-center gap-1",
            trend === 'up' ? "text-status-success" : 
            trend === 'down' ? "text-status-error" : 
            "text-content-tertiary"
          )}>
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}
