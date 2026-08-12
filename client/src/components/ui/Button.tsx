import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-bg-primary focus:ring-line-focus disabled:opacity-50 disabled:cursor-not-allowed rounded-md active:scale-[0.98]';

    const variants = {
      primary:
        'bg-brand hover:bg-brand-hover text-white shadow-spatial-md hover:shadow-spatial-lg border border-transparent',
      secondary:
        'bg-surface-tertiary hover:bg-surface-secondary text-content-primary border border-line-primary shadow-spatial-low',
      outline:
        'bg-transparent hover:bg-surface-tertiary text-content-primary border border-line-primary',
      ghost:
        'bg-transparent hover:bg-surface-tertiary text-content-secondary hover:text-content-primary',
      danger:
        'bg-status-danger hover:opacity-90 text-white shadow-spatial-md hover:shadow-spatial-lg border border-transparent',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          <span>{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!isLoading && rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
