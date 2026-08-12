import React from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-status-success/10 text-status-success border-status-success/20',
  warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
  error: 'bg-status-error/10 text-status-error border-status-error/20',
  info: 'bg-brand/10 text-brand border-brand/20',
  neutral: 'bg-surface-tertiary text-content-secondary border-line-secondary',
};

export function StatusBadge({ status, variant = 'neutral', className }: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border",
        variantStyles[variant],
        className
      )}
    >
      {status}
    </span>
  );
}
