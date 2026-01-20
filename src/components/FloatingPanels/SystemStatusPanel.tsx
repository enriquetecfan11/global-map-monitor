import React, { useState, useEffect } from 'react';
import { FloatingPanel } from '../FloatingPanel';
import { useUIStore } from '../../stores/uiStore';

export const SystemStatusPanel: React.FC = () => {
  const { systemState } = useUIStore();
  const [position, setPosition] = useState({ x: 16, y: 16 });

  useEffect(() => {
    // Calcular posición después del mount
    setPosition({ x: window.innerWidth - 200, y: 16 });
  }, []);

  const getStatusDisplay = () => {
    switch (systemState) {
      case 'monitoring':
        return { label: 'Monitoring Active', color: 'bg-green-500', pulse: true };
      case 'loading':
        return { label: 'Loading Data', color: 'bg-blue-500', pulse: true };
      case 'error':
        return { label: 'System Error', color: 'bg-red-500', pulse: false };
      case 'idle':
      default:
        return { label: 'System Idle', color: 'bg-yellow-500', pulse: false };
    }
  };

  const status = getStatusDisplay();

  return (
    <FloatingPanel
      id="system-status-panel"
      initialPosition={position}
      className="px-3 py-1.5"
      headerContent={
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${status.color} ${
              status.pulse ? 'animate-pulse' : ''
            }`}
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-gray-300">{status.label}</span>
        </div>
      }
    >
      {null}
    </FloatingPanel>
  );
};

