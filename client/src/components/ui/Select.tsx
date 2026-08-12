import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-[11px] font-mono font-semibold uppercase tracking-wider text-content-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-md border bg-surface-secondary px-3 py-2.5 pr-10 text-sm text-content-primary transition-all focus:outline-none focus:ring-2 focus:ring-line-focus shadow-spatial-low focus:shadow-spatial-md',
              error
                ? 'border-status-danger focus:ring-status-danger focus:border-status-danger'
                : 'border-line-primary focus:border-line-focus',
              className
            )}
            {...props}
          >
            <option value="" disabled>
              Select an option
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 text-content-tertiary pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </span>
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

Select.displayName = 'Select';
