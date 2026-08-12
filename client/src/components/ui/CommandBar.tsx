import React from 'react';
import { cn } from '../../utils/cn';

interface CommandBarProps {
  children: React.ReactNode;
  className?: string;
}

export function CommandBar({ children, className }: CommandBarProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-line-primary bg-surface-primary",
      className
    )}>
      {children}
    </div>
  );
}
