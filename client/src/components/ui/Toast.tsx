import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  onClose?: () => void;
}

export function Toast({ title, description, variant = 'info', onClose }: ToastProps) {
  const variants = {
    info: 'bg-surface-elevated border-status-info/20 text-content-primary',
    success: 'bg-surface-elevated border-status-success/20 text-content-primary',
    warning: 'bg-surface-elevated border-status-warning/20 text-content-primary',
    error: 'bg-surface-elevated border-status-danger/20 text-content-primary',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-status-info" />,
    success: <CheckCircle2 className="w-5 h-5 text-status-success" />,
    warning: <AlertCircle className="w-5 h-5 text-status-warning" />,
    error: <XCircle className="w-5 h-5 text-status-danger" />,
  };

  return (
    <div className={cn(
      "pointer-events-auto flex w-full max-w-md rounded-lg shadow-spatial-lg border overflow-hidden transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full p-4",
      variants[variant]
    )}>
      <div className="flex gap-3 w-full">
        <div className="flex-shrink-0 mt-0.5">
          {icons[variant]}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <p className="text-sm font-semibold">{title}</p>
          {description && (
            <p className="text-xs text-content-secondary">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-content-tertiary hover:text-content-primary focus:outline-none focus:ring-2 focus:ring-line-focus rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
