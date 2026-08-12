import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastVariant } from '../components/ui/Toast';

export interface NotificationOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface NotificationContextType {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  notify: (options: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface ToastItem extends NotificationOptions {
  id: string;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((options: NotificationOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = options.duration ?? 5000;
    
    setToasts((prev) => [...prev, { ...options, id }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((title: string, description?: string) => {
    notify({ title, description, variant: 'success' });
  }, [notify]);

  const error = useCallback((title: string, description?: string) => {
    notify({ title, description, variant: 'error', duration: 7000 });
  }, [notify]);

  const warning = useCallback((title: string, description?: string) => {
    notify({ title, description, variant: 'warning' });
  }, [notify]);

  const info = useCallback((title: string, description?: string) => {
    notify({ title, description, variant: 'info' });
  }, [notify]);

  return (
    <NotificationContext.Provider value={{ success, error, warning, info, notify }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-6 pointer-events-none max-w-[100vw]">
        {toasts.map((toast) => (
          <div key={toast.id} className="animate-in slide-in-from-right-full fade-in duration-300">
            <Toast
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
