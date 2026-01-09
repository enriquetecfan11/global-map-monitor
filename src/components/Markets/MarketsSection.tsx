import React from 'react';
import { MarketsTable } from './MarketsTable';
import { SectorHeatmap } from './SectorHeatmap';

export const MarketsSection: React.FC = () => {
  return (
    <section
      className="w-full border-b border-gray-700 bg-gray-900 py-6 px-6"
      aria-label="Markets Section"
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Markets</h2>
      
      <div className="space-y-6">
        <MarketsTable />
        <SectorHeatmap />
      </div>
    </section>
  );
};

