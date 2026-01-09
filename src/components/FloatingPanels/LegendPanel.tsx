import React, { useState, useEffect } from 'react';
import { FloatingPanel } from '../FloatingPanel';

export const LegendPanel: React.FC = () => {
  const [position, setPosition] = useState({ x: 16, y: 16 });

  useEffect(() => {
    // Calcular posición después del mount
    setPosition({ x: 16, y: window.innerHeight - 200 });
  }, []);

  return (
    <FloatingPanel
      id="legend-panel"
      title="Legend"
      initialPosition={position}
      className="p-3 min-w-[180px]"
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" aria-hidden="true" />
          <span className="text-xs text-gray-400">Active Nodes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
          <span className="text-xs text-gray-400">Connected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" aria-hidden="true" />
          <span className="text-xs text-gray-400">Pending</span>
        </div>
      </div>
    </FloatingPanel>
  );
};

