import React, { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import * as L from 'leaflet';
import type { RssCountryData } from '../../../types/feed.types';
import { useFeedStore } from '../../../stores/feedStore';
import { buildTooltipForRssCountry } from '../tooltips/tooltipBuilder';
import { EnrichedTooltip } from '../tooltips/EnrichedTooltip';
import { EnrichedPopup } from '../tooltips/EnrichedPopup';

interface RssCountriesLayerProps {
  enabled: boolean;
  zIndex: number;
}

/**
 * Obtiene el color basado en el número de menciones.
 * Verde (pocas) → Amarillo → Rojo (muchas)
 */
const getColorForMentions = (mentionCount: number): string => {
  if (mentionCount === 1) {
    return '#10B981'; // green-500
  } else if (mentionCount <= 3) {
    return '#F59E0B'; // amber-500
  } else if (mentionCount <= 5) {
    return '#F97316'; // orange-500
  } else {
    return '#EF4444'; // red-500
  }
};

/**
 * Obtiene el tamaño del marcador basado en el número de menciones.
 */
const getSizeForMentions = (mentionCount: number): number => {
  if (mentionCount === 1) {
    return 8;
  } else if (mentionCount <= 3) {
    return 10;
  } else if (mentionCount <= 5) {
    return 12;
  } else {
    return 14;
  }
};

/**
 * Crea un icono cuadrado personalizado para Leaflet.
 */
const createSquareIcon = (color: string, size: number): L.DivIcon => {
  return L.divIcon({
    className: 'rss-country-marker',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 2px solid #FFFFFF;
      border-radius: 2px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export const RssCountriesLayer: React.FC<RssCountriesLayerProps> = React.memo(
  ({ enabled, zIndex }) => {
    const rssCountries = useFeedStore((state) => state.rssCountries);

    const markers = useMemo(() => {
      if (!enabled || !rssCountries || rssCountries.length === 0) {
        return null;
      }

      return rssCountries.map((country, index) => {
        const color = getColorForMentions(country.mentionCount);
        const size = getSizeForMentions(country.mentionCount);
        const icon = createSquareIcon(color, size);
        const tooltipPayload = buildTooltipForRssCountry(country);

        return (
          <Marker
            key={`rss-country-${index}-${country.name}`}
            position={[country.lat, country.lon]}
            icon={icon}
            zIndexOffset={zIndex}
          >
            <EnrichedTooltip
              baseContent={tooltipPayload}
              lat={country.lat}
              lon={country.lon}
            />
            <EnrichedPopup
              baseContent={tooltipPayload}
              lat={country.lat}
              lon={country.lon}
            />
          </Marker>
        );
      });
    }, [enabled, rssCountries, zIndex]);

    if (!enabled || !markers) {
      return null;
    }

    return <>{markers}</>;
  }
);

RssCountriesLayer.displayName = 'RssCountriesLayer';

