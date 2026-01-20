import React from 'react';
import { useMapStore } from '../../stores/mapStore';
import type { LayerId } from '../../types/map.types';

interface LayerToggleProps {
  layerId: LayerId;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}

const LayerToggle: React.FC<LayerToggleProps> = ({ layerId, label, enabled, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[120px] bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md transition-colors text-left"
      aria-label={`Toggle ${label} layer (${layerId})`}
      aria-pressed={enabled}
    >
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
          enabled
            ? 'bg-green-600 border-green-500'
            : 'bg-gray-700 border-gray-600'
        }`}
      >
        {enabled && (
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-100">{label}</span>
    </button>
  );
};

export const LayerToggles: React.FC = () => {
  const { layers, toggleLayer } = useMapStore();

  return (
    <div
      className="h-full bg-gray-800 border-l border-gray-700 p-2 flex flex-col"
      role="group"
      aria-label="Map layer controls"
    >
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-thin">
        <LayerToggle
          layerId="countries"
          label="Countries"
          enabled={layers.countries.enabled}
          onToggle={() => toggleLayer('countries')}
        />
        <LayerToggle
          layerId="hotspots"
          label="Hotspots"
          enabled={layers.hotspots.enabled}
          onToggle={() => toggleLayer('hotspots')}
        />
        <LayerToggle
          layerId="conflicts"
          label="Conflict Zones"
          enabled={layers.conflicts.enabled}
          onToggle={() => toggleLayer('conflicts')}
        />
        <LayerToggle
          layerId="cables"
          label="Cable Landings"
          enabled={layers.cables.enabled}
          onToggle={() => toggleLayer('cables')}
        />
        <LayerToggle
          layerId="nuclear"
          label="Nuclear Sites"
          enabled={layers.nuclear.enabled}
          onToggle={() => toggleLayer('nuclear')}
        />
        <LayerToggle
          layerId="military"
          label="Military Bases"
          enabled={layers.military.enabled}
          onToggle={() => toggleLayer('military')}
        />
        <LayerToggle
          layerId="rss-countries"
          label="RSS Countries"
          enabled={layers.rssCountries.enabled}
          onToggle={() => toggleLayer('rss-countries')}
        />
      </div>
    </div>
  );
};

