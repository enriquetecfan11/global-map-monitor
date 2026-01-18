import React, { useMemo } from 'react';
import { Rectangle, Tooltip } from 'react-leaflet';
import type { ConflictZoneData } from '../../../types/map.types';
import { buildTooltipForConflictZone, renderTooltip } from '../tooltips/tooltipBuilder';
import conflictZonesData from '../../../data/conflict-zones.json';

interface ConflictZonesLayerProps {
  enabled: boolean;
  zIndex: number;
}

export const ConflictZonesLayer: React.FC<ConflictZonesLayerProps> = React.memo(
  ({ enabled, zIndex }) => {
    const zones = useMemo(() => conflictZonesData as ConflictZoneData[], []);

    if (!enabled) {
      return null;
    }

    return (
      <>
        {zones.map((zone, index) => {
          const tooltipPayload = buildTooltipForConflictZone(zone);
          const tooltipContent = renderTooltip(tooltipPayload);

          return (
            <Rectangle
              key={`conflict-zone-${index}-${zone.name}`}
              bounds={zone.bounds}
              pathOptions={{
                fillColor: '#DC2626', // red-600
                fillOpacity: 0.2,
                color: '#991B1B', // red-800
                weight: 1.5,
                opacity: 0.8,
              }}
              zIndexOffset={zIndex}
            >
              <Tooltip permanent={false} direction="top" className="custom-tooltip">
                <div dangerouslySetInnerHTML={{ __html: tooltipContent }} />
              </Tooltip>
            </Rectangle>
          );
        })}
      </>
    );
  }
);

ConflictZonesLayer.displayName = 'ConflictZonesLayer';

