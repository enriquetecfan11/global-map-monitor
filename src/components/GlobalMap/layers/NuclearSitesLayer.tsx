import React, { useMemo } from 'react';
import { CircleMarker } from 'react-leaflet';
import type { StrategicInfrastructureData } from '../../../types/map.types';
import { buildTooltipForStrategicInfra } from '../tooltips/tooltipBuilder';
import { EnrichedTooltip } from '../tooltips/EnrichedTooltip';
import { EnrichedPopup } from '../tooltips/EnrichedPopup';
import nuclearSitesData from '../../../data/nuclear-sites.json';

interface NuclearSitesLayerProps {
  enabled: boolean;
  zIndex: number;
}

export const NuclearSitesLayer: React.FC<NuclearSitesLayerProps> = React.memo(
  ({ enabled, zIndex }) => {
    const nuclearSites = useMemo(() => nuclearSitesData as StrategicInfrastructureData[], []);

    if (!enabled) {
      return null;
    }

    return (
      <>
        {nuclearSites.map((site, index) => {
          const tooltipPayload = buildTooltipForStrategicInfra(site, 'Nuclear Site');

          return (
            <CircleMarker
              key={`nuclear-${index}-${site.name}`}
              center={[site.lat, site.lon]}
              radius={12}
              pathOptions={{
                fillColor: '#F59E0B', // amber-500
                fillOpacity: 0.8,
                color: '#FFFFFF',
                weight: 2,
                opacity: 1,
              }}
              zIndexOffset={zIndex}
            >
              <EnrichedTooltip
                baseContent={tooltipPayload}
                lat={site.lat}
                lon={site.lon}
              />
              <EnrichedPopup
                baseContent={tooltipPayload}
                lat={site.lat}
                lon={site.lon}
              />
            </CircleMarker>
          );
        })}
      </>
    );
  }
);

NuclearSitesLayer.displayName = 'NuclearSitesLayer';

