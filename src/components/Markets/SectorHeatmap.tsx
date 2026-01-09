import React from 'react';

interface SectorData {
  sector: string;
  value: number; // 0-100 for heatmap intensity
}

const placeholderSectors: SectorData[] = [
  { sector: 'Technology', value: 75 },
  { sector: 'Finance', value: 60 },
  { sector: 'Healthcare', value: 45 },
  { sector: 'Energy', value: 30 },
  { sector: 'Consumer', value: 55 },
  { sector: 'Industrial', value: 40 },
  { sector: 'Materials', value: 35 },
  { sector: 'Utilities', value: 25 },
];

const getHeatmapColor = (value: number): string => {
  if (value >= 70) return 'bg-red-600';
  if (value >= 50) return 'bg-yellow-500';
  if (value >= 30) return 'bg-yellow-300';
  return 'bg-green-400';
};

const getTextColor = (value: number): string => {
  return value >= 50 ? 'text-gray-900' : 'text-gray-100';
};

export const SectorHeatmap: React.FC = () => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-300 mb-4">Sector Performance</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {placeholderSectors.map((sector) => (
          <div
            key={sector.sector}
            className={`${getHeatmapColor(sector.value)} ${getTextColor(sector.value)} rounded-lg p-4 text-center transition-transform hover:scale-105`}
          >
            <div className="font-medium text-sm mb-1">{sector.sector}</div>
            <div className="text-xs opacity-90">{sector.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

