import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Construction } from 'lucide-react';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  moduleKey: string;
}

export function ModulePlaceholder({ title, description, moduleKey }: ModulePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] border border-dashed border-line-primary rounded-lg bg-surface-secondary p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-brand-subtle text-brand flex items-center justify-center mb-4">
        <Construction className="w-6 h-6" />
      </div>
      <Badge variant="info" className="mb-2">
        Phase 2 Module
      </Badge>
      <h2 className="text-xl font-bold text-content-primary mb-1">{title}</h2>
      <p className="text-xs text-content-secondary max-w-md mb-6">{description}</p>
      <div className="p-3 rounded bg-surface-primary border border-line-primary text-xs font-mono text-content-tertiary">
        MODULE_ID: <span className="text-brand font-semibold">{moduleKey}</span> // Scheduled for
        Phase 2 Implementation
      </div>
    </div>
  );
}
