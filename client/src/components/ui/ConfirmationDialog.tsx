import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode; // For extra inputs like reasons
}

export function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
  children
}: ConfirmationDialogProps) {
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      />
      
      <div className={cn(
        "relative w-full max-w-md bg-surface-primary rounded-xl border border-line-primary shadow-2xl",
        "transform transition-all animate-in fade-in zoom-in-95 duration-200",
        "flex flex-col overflow-hidden"
      )}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-line-secondary flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isDangerous && (
              <div className="w-8 h-8 rounded-full bg-status-error/10 text-status-error flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
            <h2 className="text-lg font-bold text-content-primary">{title}</h2>
          </div>
          <button 
            onClick={onCancel}
            className="text-content-tertiary hover:text-content-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-content-secondary leading-relaxed">
            {description}
          </p>
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-line-secondary flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button 
            variant={isDangerous ? 'danger' : 'primary'} 
            onClick={onConfirm} 
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
