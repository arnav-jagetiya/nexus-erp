import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className={cn(
          "relative w-full bg-surface-primary rounded-lg shadow-spatial-lg border border-line-primary flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200",
          sizes[size]
        )}
      >
        {(title || description) && (
          <div className="px-6 py-4 border-b border-line-primary">
            <div className="flex items-center justify-between">
              {title && <h2 className="text-lg font-semibold text-content-primary">{title}</h2>}
              <button 
                onClick={onClose}
                className="text-content-tertiary hover:text-content-primary transition-colors focus:outline-none focus:ring-2 focus:ring-line-focus rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {description && <p className="text-sm text-content-secondary mt-1">{description}</p>}
          </div>
        )}
        
        <div className="px-6 py-4 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-line-primary bg-surface-tertiary/50 rounded-b-lg flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
