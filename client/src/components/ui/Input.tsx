import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
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
            className={`w-full rounded-md border bg-surface-secondary px-3 py-2 text-sm text-content-primary placeholder-content-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-line-focus ${
              leftIcon ? 'pl-9' : ''
            } ${rightIcon ? 'pr-9' : ''} ${
              error
                ? 'border-status-danger focus:ring-status-danger'
                : 'border-line-primary focus:border-line-focus'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-content-tertiary">
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <p className="text-xs text-status-danger font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-content-tertiary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
