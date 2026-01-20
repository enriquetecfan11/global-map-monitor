import React, { useMemo } from 'react';
import { CircleMarker } from 'react-leaflet';
import type { HotspotData } from '../../../types/map.types';
import { buildTooltipForHotspot } from '../tooltips/tooltipBuilder';
import { EnrichedTooltip } from '../tooltips/EnrichedTooltip';
import { EnrichedPopup } from '../tooltips/EnrichedPopup';
import hotspotsData from '../../../data/hotspots.json';

interface HotspotsLayerProps {
  enabled: boolean;
  zIndex: number;
}

const getColorForLevel = (level: HotspotData['level']): string => {
  switch (level) {
    case 'low':
      return '#10B981'; // green-500
    case 'elevated':
      return '#F59E0B'; // amber-500
    case 'high':
      return '#EF4444'; // red-500
    default:
      return '#6B7280'; // gray-500
  }
};

const getRadiusForLevel = (level: HotspotData['level']): number => {
  switch (level) {
    case 'low':
      return 8;
    case 'elevated':
      return 12;
    case 'high':
      return 16;
    default:
      return 10;
  }
};

export const HotspotsLayer: React.FC<HotspotsLayerProps> = React.memo(
  ({ enabled, zIndex }) => {
    const hotspots = useMemo(() => hotspotsData as HotspotData[], []);

    if (!enabled) {
      return null;
    }

    return (
      <>
        {hotspots.map((hotspot, index) => {
          const tooltipPayload = buildTooltipForHotspot(hotspot);

          return (
            <CircleMarker
              key={`hotspot-${index}-${hotspot.name}`}
              center={[hotspot.lat, hotspot.lon]}
              radius={getRadiusForLevel(hotspot.level)}
              pathOptions={{
                fillColor: getColorForLevel(hotspot.level),
                fillOpacity: 0.8,
                color: '#FFFFFF',
                weight: 2,
                opacity: 1,
              }}
            >
              <EnrichedTooltip
                baseContent={tooltipPayload}
                lat={hotspot.lat}
                lon={hotspot.lon}
              />
              <EnrichedPopup
                baseContent={tooltipPayload}
                lat={hotspot.lat}
                lon={hotspot.lon}
              />
            </CircleMarker>
          );
        })}
      </>
    );
  }
);

HotspotsLayer.displayName = 'HotspotsLayer';

