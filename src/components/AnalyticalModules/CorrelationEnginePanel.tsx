import React from 'react';

type ModuleState = 'scanning' | 'running' | 'idle';

interface CorrelationEnginePanelProps {
  state?: ModuleState;
}

export const CorrelationEnginePanel: React.FC<CorrelationEnginePanelProps> = ({
  state = 'running',
}) => {
  const getStateColor = (state: ModuleState): string => {
    switch (state) {
      case 'scanning':
        return 'bg-yellow-500';
      case 'running':
        return 'bg-green-500';
      case 'idle':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStateLabel = (state: ModuleState): string => {
    switch (state) {
      case 'scanning':
        return 'Scanning...';
      case 'running':
        return 'Running';
      case 'idle':
        return 'Idle';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-100">Correlation Engine</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStateColor(state)} animate-pulse`} />
          <span className="text-sm text-gray-300">{getStateLabel(state)}</span>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-400">
        <p>Analyzing cross-market correlations...</p>
        <p className="text-xs text-gray-500">
          Last update: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

