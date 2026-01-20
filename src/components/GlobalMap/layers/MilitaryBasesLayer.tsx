import React, { useMemo } from 'react';
import { CircleMarker } from 'react-leaflet';
import type { StrategicInfrastructureData } from '../../../types/map.types';
import { buildTooltipForStrategicInfra } from '../tooltips/tooltipBuilder';
import { EnrichedTooltip } from '../tooltips/EnrichedTooltip';
import { EnrichedPopup } from '../tooltips/EnrichedPopup';
import militaryBasesData from '../../../data/military-bases.json';

interface MilitaryBasesLayerProps {
  enabled: boolean;
  zIndex: number;
}

export const MilitaryBasesLayer: React.FC<MilitaryBasesLayerProps> = React.memo(
  ({ enabled, zIndex }) => {
    const militaryBases = useMemo(() => militaryBasesData as StrategicInfrastructureData[], []);

    if (!enabled) {
      return null;
    }

    return (
      <>
        {militaryBases.map((base, index) => {
          const tooltipPayload = buildTooltipForStrategicInfra(base, 'Military Base');

          return (
            <CircleMarker
              key={`military-${index}-${base.name}`}
              center={[base.lat, base.lon]}
              radius={11}
              pathOptions={{
                fillColor: '#8B5CF6', // violet-500
                fillOpacity: 0.8,
                color: '#FFFFFF',
                weight: 2,
                opacity: 1,
              }}
            >
              <EnrichedTooltip
                baseContent={tooltipPayload}
                lat={base.lat}
                lon={base.lon}
              />
              <EnrichedPopup
                baseContent={tooltipPayload}
                lat={base.lat}
                lon={base.lon}
              />
            </CircleMarker>
          );
        })}
      </>
    );
  }
);

MilitaryBasesLayer.displayName = 'MilitaryBasesLayer';

