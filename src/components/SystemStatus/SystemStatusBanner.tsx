import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import type { SystemState } from '../../types/ui.types';

interface SystemStatusBannerProps {
  className?: string;
}

const getStatusConfig = (state: SystemState) => {
  switch (state) {
    case 'monitoring':
      return {
        label: 'Monitoring Active',
        color: 'bg-green-500/20 border-green-500/50 text-green-400',
        icon: '●',
      };
    case 'loading':
      return {
        label: 'Loading Data',
        color: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
        icon: '⟳',
      };
    case 'error':
      return {
        label: 'System Error',
        color: 'bg-red-500/20 border-red-500/50 text-red-400',
        icon: '⚠',
      };
    case 'idle':
    default:
      return {
        label: 'System Idle',
        color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
        icon: '○',
      };
  }
};

export const SystemStatusBanner: React.FC<SystemStatusBannerProps> = ({
  className = '',
}) => {
  const { systemState } = useUIStore();
  const config = getStatusConfig(systemState);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium backdrop-blur-sm transition-colors ${config.color} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`System status: ${config.label}`}
    >
      <span
        className={`${
          systemState === 'monitoring' || systemState === 'loading'
            ? 'animate-pulse'
            : ''
        }`}
        aria-hidden="true"
      >
        {config.icon}
      </span>
      <span>{config.label}</span>
    </div>
  );
};

