import React from 'react';
import { cn } from '../../utils/cn';

interface DataPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function DataPanel({ children, className }: DataPanelProps) {
  return (
    <div className={cn(
      "rounded-lg border border-line-primary bg-surface-secondary shadow-spatial-md overflow-hidden relative",
      className
    )}>
      {children}
    </div>
  );
}
