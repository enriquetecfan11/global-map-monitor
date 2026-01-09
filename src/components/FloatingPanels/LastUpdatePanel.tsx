import React, { useState, useEffect } from 'react';
import { FloatingPanel } from '../FloatingPanel';

export const LastUpdatePanel: React.FC = () => {
  const [position, setPosition] = useState({ x: 16, y: 16 });

  useEffect(() => {
    // Calcular posición después del mount
    setPosition({ x: window.innerWidth - 200, y: window.innerHeight - 100 });
  }, []);

  return (
    <FloatingPanel
      id="last-update-panel"
      initialPosition={position}
      className="px-3 py-1.5"
    >
      <div className="text-xs text-gray-400">
        <span className="font-medium text-gray-300">Last Update: </span>
        <span>--:--:--</span>
      </div>
    </FloatingPanel>
  );
};

