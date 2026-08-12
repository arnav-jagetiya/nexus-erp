import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'default';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm', className, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-mono font-semibold tracking-wider rounded border uppercase';

  const variants = {
    default: 'bg-surface-tertiary text-content-secondary border-line-primary',
    info: 'bg-status-info-bg text-status-info border-status-info/20',
    success: 'bg-status-success-bg text-status-success border-status-success/20',
    warning: 'bg-status-warning-bg text-status-warning border-status-warning/20',
    danger: 'bg-status-danger-bg text-status-danger border-status-danger/20',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-1 text-[11px]',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
