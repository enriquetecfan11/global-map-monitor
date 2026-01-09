import React from 'react';
import { FloatingPanel } from '../FloatingPanel';

export const GlobalViewPanel: React.FC = () => {
  return (
    <FloatingPanel
      id="global-view-panel"
      title="Global View"
      initialPosition={{ x: 16, y: 16 }}
      className="px-3 py-1.5"
    >
      <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
        Global View
      </span>
    </FloatingPanel>
  );
};

