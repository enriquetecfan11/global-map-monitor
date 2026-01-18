import React from 'react';
import { useMapStore } from '../../stores/mapStore';
import { useUIStore } from '../../stores/uiStore';
import { LayerToggles } from './LayerToggles';
import { MapLegend } from './MapLegend';
import { LeafletMap } from './LeafletMap';
import { LeafletMapControls } from './LeafletMapControls';
import { MentionsPanel } from './MentionsPanel';
import {
  CountriesLayer,
  HotspotsLayer,
  ConflictZonesLayer,
  CableLandingsLayer,
  NuclearSitesLayer,
  MilitaryBasesLayer,
  RssCountriesLayer,
} from './layers';

export const GlobalMapSection: React.FC = () => {
  const { layers } = useMapStore();
  const { mentionsPanel, closeMentionsPanel } = useUIStore();
  const fixedCenter: [number, number] = [20, 0];
  const initialZoom = 2;
  const minZoom = 1;
  const maxZoom = 10;

  return (
    <section
      className="w-full h-[45vh] border-b border-gray-700 bg-gray-800"
      aria-label="Global Map"
    >
      <div className="flex h-full">
        <aside className="w-[240px] h-full flex-shrink-0">
          <MapLegend />
        </aside>
        <main className="flex-1 h-full relative">
          <LeafletMap
            center={fixedCenter}
            zoom={initialZoom}
            minZoom={minZoom}
            maxZoom={maxZoom}
          >
            <CountriesLayer
              enabled={layers.countries.enabled}
              zIndex={layers.countries.zIndex}
            />
            <ConflictZonesLayer
              enabled={layers.conflicts.enabled}
              zIndex={layers.conflicts.zIndex}
            />
            <HotspotsLayer
              enabled={layers.hotspots.enabled}
              zIndex={layers.hotspots.zIndex}
            />
            <CableLandingsLayer
              enabled={layers.cables.enabled}
              zIndex={layers.cables.zIndex}
            />
            <NuclearSitesLayer
              enabled={layers.nuclear.enabled}
              zIndex={layers.nuclear.zIndex}
            />
            <MilitaryBasesLayer
              enabled={layers.military.enabled}
              zIndex={layers.military.zIndex}
            />
            <RssCountriesLayer
              enabled={layers.rssCountries.enabled}
              zIndex={layers.rssCountries.zIndex}
            />
            <LeafletMapControls
              initialZoom={initialZoom}
              minZoom={minZoom}
              maxZoom={maxZoom}
            />
          </LeafletMap>
        </main>
        <aside className="w-[200px] h-full flex-shrink-0">
          <LayerToggles />
        </aside>
      </div>
      
      {/* Panel de menciones */}
      <MentionsPanel
        isOpen={mentionsPanel.isOpen}
        countryName={mentionsPanel.countryName}
        onClose={closeMentionsPanel}
      />
    </section>
  );
};
