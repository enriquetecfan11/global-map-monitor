import React, { useMemo } from 'react';
import { CircleMarker } from 'react-leaflet';
import type { StrategicInfrastructureData } from '../../../types/map.types';
import { buildTooltipForStrategicInfra } from '../tooltips/tooltipBuilder';
import { EnrichedTooltip } from '../tooltips/EnrichedTooltip';
import { EnrichedPopup } from '../tooltips/EnrichedPopup';
import cableLandingsData from '../../../data/cable-landings.json';

interface CableLandingsLayerProps {
  enabled: boolean;
  zIndex: number;
}

export const CableLandingsLayer: React.FC<CableLandingsLayerProps> = React.memo(
  ({ enabled, zIndex: _zIndex }) => {
    const cableLandings = useMemo(() => cableLandingsData as StrategicInfrastructureData[], []);

    if (!enabled) {
      return null;
    }

    return (
      <>
        {cableLandings.map((cable, index) => {
          const tooltipPayload = buildTooltipForStrategicInfra(cable, 'Cable Landing');

          const marker = (
            <CircleMarker
              key={`cable-${index}-${cable.name}`}
              center={[cable.lat, cable.lon]}
              radius={10}
              pathOptions={{
                fillColor: '#3B82F6', // blue-500
                fillOpacity: 0.8,
                color: '#FFFFFF',
                weight: 2,
                opacity: 1,
              }}
            >
              <EnrichedTooltip
                baseContent={tooltipPayload}
                lat={cable.lat}
                lon={cable.lon}
              />
              <EnrichedPopup
                baseContent={tooltipPayload}
                lat={cable.lat}
                lon={cable.lon}
              />
            </CircleMarker>
          );
          return marker;
        })}
      </>
    );
  }
);

CableLandingsLayer.displayName = 'CableLandingsLayer';

