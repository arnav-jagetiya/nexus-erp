import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-mono font-medium rounded uppercase tracking-wider';

  const variants = {
    default: 'bg-surface-tertiary text-content-secondary border border-line-primary',
    success: 'bg-status-success-bg text-status-success border border-status-success/20',
    warning: 'bg-status-warning-bg text-status-warning border border-status-warning/20',
    danger: 'bg-status-danger-bg text-status-danger border border-status-danger/20',
    info: 'bg-status-info-bg text-status-info border border-status-info/20',
    neutral: 'bg-surface-tertiary text-content-tertiary border border-line-primary',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
