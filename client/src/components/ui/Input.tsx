import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[11px] font-mono font-semibold uppercase tracking-wider text-content-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-content-tertiary pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-md border bg-surface-secondary px-3 py-2.5 text-sm text-content-primary placeholder-content-tertiary transition-all focus:outline-none focus:ring-2 focus:ring-line-focus shadow-spatial-low focus:shadow-spatial-md',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error
                ? 'border-status-danger focus:ring-status-danger focus:border-status-danger'
                : 'border-line-primary focus:border-line-focus',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-content-tertiary">
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <p className="text-xs text-status-danger font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-content-tertiary mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
