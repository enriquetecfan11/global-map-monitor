import type { TooltipPayload, HotspotData, ConflictZoneData, StrategicInfrastructureData } from '../../../types/map.types';
import type { RssCountryData } from '../../../types/feed.types';
import type { Feature } from 'geojson';

export const buildTooltipForCountry = (country: Feature): TooltipPayload => {
  const name = country.properties?.name || country.properties?.NAME || 'Unknown Country';
  return {
    title: name,
    lines: [],
    meta: { type: 'country', feature: country },
  };
};

export const buildTooltipForHotspot = (hotspot: HotspotData): TooltipPayload => {
  const levelLabel = hotspot.level.charAt(0).toUpperCase() + hotspot.level.slice(1);
  return {
    title: hotspot.name,
    lines: [`[${levelLabel}] ${hotspot.desc}`],
    meta: { type: 'hotspot', level: hotspot.level },
  };
};

export const buildTooltipForConflictZone = (zone: ConflictZoneData): TooltipPayload => {
  return {
    title: zone.name,
    lines: [],
    meta: { type: 'conflict-zone' },
  };
};

export const buildTooltipForStrategicInfra = (
  infra: StrategicInfrastructureData,
  type: string
): TooltipPayload => {
  return {
    title: infra.name,
    lines: [infra.desc],
    meta: { type: 'strategic-infra', infraType: type },
  };
};

export const buildTooltipForRssCountry = (country: RssCountryData): TooltipPayload => {
  const mentionText = country.mentionCount === 1 
    ? '1 mention' 
    : `${country.mentionCount} mentions`;
  
  const latestDate = new Date(country.latestMention);
  const timeAgo = getTimeAgo(latestDate);
  
  return {
    title: country.name,
    lines: [
      mentionText,
      `Latest: ${timeAgo}`,
    ],
    meta: { type: 'rss-country', mentionCount: country.mentionCount },
  };
};

/**
 * Calcula tiempo relativo desde una fecha (ej: "2h", "1d", "5m").
 */
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else {
    return `${diffDays}d`;
  }
};

/**
 * Construye líneas de contexto (hora local) para tooltips enriquecidos.
 * 
 * @param localTime - Hora local formateada
 * @returns Array de líneas de texto para añadir al tooltip
 */
export const buildContextLines = (localTime: string): string[] => {
  const lines: string[] = [];
  
  // Hora local (siempre visible)
  lines.push(`🕐 ${localTime}`);
  
  return lines;
};

export const renderTooltip = (payload: TooltipPayload): string => {
  const parts = [payload.title];
  if (payload.lines.length > 0) {
    parts.push(...payload.lines);
  }
  return parts.join('<br/>');
};

