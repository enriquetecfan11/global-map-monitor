import React from 'react';
import { CorrelationEnginePanel } from './CorrelationEnginePanel';
import { NarrativeTrackerPanel } from './NarrativeTrackerPanel';

export const AnalyticalModulesSection: React.FC = () => {
  return (
    <section
      className="w-full border-b border-gray-700 bg-gray-900 py-6 px-6"
      aria-label="Analytical Modules Section"
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Analytical Modules</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CorrelationEnginePanel state="running" />
        <NarrativeTrackerPanel state="scanning" />
      </div>
    </section>
  );
};

