/**
 * Servicio para construir la situación de un país.
 * Centraliza la lógica de agregación de datos para reutilización en:
 * - Popups de países
 * - Paneles laterales (futuro)
 * - Correlation Engine (futuro)
 * - Narrative Tracker (futuro)
 */

import type { CountrySituation, ActivityLevel, RelevantEvent, GeographicSignals } from '../types/map.types';
import type { FeedItem } from '../types/feed.types';
import type { HotspotData, ConflictZoneData, StrategicInfrastructureData } from '../types/map.types';
import type { Feature } from 'geojson';
import { getLocalTimeFromLongitude } from './geoUtils';
import { extractCountriesFromFeeds } from './countryExtractor';
import topCountriesData from '../data/top-countries.json';
import hotspotsData from '../data/hotspots.json';
import conflictZonesData from '../data/conflict-zones.json';
import cableLandingsData from '../data/cable-landings.json';
import nuclearSitesData from '../data/nuclear-sites.json';
import militaryBasesData from '../data/military-bases.json';

interface CountryDefinition {
  name: string;
  lat: number;
  lon: number;
  variants: string[];
}

const topCountries = topCountriesData as CountryDefinition[];

const hotspots = hotspotsData as HotspotData[];
const conflictZones = conflictZonesData as ConflictZoneData[];
const cableLandings = cableLandingsData as StrategicInfrastructureData[];
const nuclearSites = nuclearSitesData as StrategicInfrastructureData[];
const militaryBases = militaryBasesData as StrategicInfrastructureData[];

/**
 * Mapeos conocidos de hotspots/infraestructura a países.
 * Usado para matching aproximado cuando el nombre no es directo.
 */
const HOTSPOT_COUNTRY_MAP: Record<string, string[]> = {
  'Strait of Hormuz': ['Iran', 'Oman', 'United Arab Emirates'],
  'Suez Canal': ['Egypt'],
  'Panama Canal': ['Panama'],
  'Taiwan Strait': ['Taiwan', 'China'],
  'South China Sea': ['China', 'Vietnam', 'Philippines', 'Malaysia'],
  'Bering Strait': ['United States', 'Russia'],
  'Strait of Malacca': ['Malaysia', 'Singapore', 'Indonesia'],
  'Bab el-Mandeb': ['Yemen', 'Djibouti', 'Eritrea'],
  'English Channel': ['United Kingdom', 'France'],
  'Bosphorus Strait': ['Turkey'],
};

const INFRASTRUCTURE_COUNTRY_MAP: Record<string, string[]> = {
  'NYC': ['United States'],
  'Cornwall': ['United Kingdom'],
  'Marseille': ['France'],
  'Mumbai': ['India'],
  'Singapore': ['Singapore'],
  'Hong Kong': ['China', 'Hong Kong'],
  'Tokyo': ['Japan'],
  'Sydney': ['Australia'],
  'LA': ['United States'],
  'Miami': ['United States'],
  'Ramstein': ['Germany'],
  'Diego Garcia': ['United Kingdom'],
  'Okinawa': ['Japan'],
  'Guam': ['United States'],
  'Djibouti': ['Djibouti'],
  'Qatar': ['Qatar'],
  'Kaliningrad': ['Russia'],
  'Sevastopol': ['Ukraine', 'Russia'],
  'Hainan': ['China'],
  'Natanz': ['Iran'],
  'Yongbyon': ['North Korea'],
  'Dimona': ['Israel'],
  'Bushehr': ['Iran'],
  'Zaporizhzhia': ['Ukraine'],
  'Chernobyl': ['Ukraine'],
  'Fukushima': ['Japan'],
};

/**
 * Normaliza un nombre de país para comparación.
 */
const normalizeCountryName = (name: string): string => {
  return name.toLowerCase().trim();
};

/**
 * Verifica si un hotspot está relacionado con un país.
 */
const isHotspotInCountry = (hotspot: HotspotData, countryName: string): boolean => {
  const normalizedCountry = normalizeCountryName(countryName);
  
  // Verificar mapeo conocido
  const mappedCountries = HOTSPOT_COUNTRY_MAP[hotspot.name];
  if (mappedCountries) {
    return mappedCountries.some(c => normalizeCountryName(c) === normalizedCountry);
  }
  
  // Matching aproximado: verificar si el nombre del país aparece en la descripción
  const desc = hotspot.desc.toLowerCase();
  return desc.includes(normalizedCountry);
};

/**
 * Verifica si una zona de conflicto está relacionada con un país.
 */
const isConflictZoneInCountry = (zone: ConflictZoneData, countryName: string): boolean => {
  const normalizedCountry = normalizeCountryName(countryName);
  const normalizedZone = normalizeCountryName(zone.name);
  
  // Matching directo por nombre
  return normalizedZone === normalizedCountry || normalizedZone.includes(normalizedCountry) || normalizedCountry.includes(normalizedZone);
};

/**
 * Verifica si una infraestructura está relacionada con un país.
 */
const isInfrastructureInCountry = (infra: StrategicInfrastructureData, countryName: string): boolean => {
  const normalizedCountry = normalizeCountryName(countryName);
  
  // Verificar mapeo conocido
  const mappedCountries = INFRASTRUCTURE_COUNTRY_MAP[infra.name];
  if (mappedCountries) {
    return mappedCountries.some(c => normalizeCountryName(c) === normalizedCountry);
  }
  
  // Matching aproximado: verificar si el nombre del país aparece en la descripción
  const desc = infra.desc.toLowerCase();
  return desc.includes(normalizedCountry);
};

/**
 * Encuentra señales geográficas relacionadas con un país.
 */
const findGeographicSignals = (countryName: string): GeographicSignals => {
  const hotspotsInCountry = hotspots
    .filter(h => isHotspotInCountry(h, countryName))
    .map(h => ({ name: h.name, level: h.level }));
  
  const conflictZonesInCountry = conflictZones
    .filter(z => isConflictZoneInCountry(z, countryName))
    .map(z => ({ name: z.name }));
  
  const infrastructureInCountry = [
    ...cableLandings.filter(i => isInfrastructureInCountry(i, countryName)).map(i => ({ name: i.name, type: 'cable' })),
    ...nuclearSites.filter(i => isInfrastructureInCountry(i, countryName)).map(i => ({ name: i.name, type: 'nuclear' })),
    ...militaryBases.filter(i => isInfrastructureInCountry(i, countryName)).map(i => ({ name: i.name, type: 'military' })),
  ];
  
  return {
    hotspots: hotspotsInCountry,
    conflictZones: conflictZonesInCountry,
    infrastructure: infrastructureInCountry,
  };
};

/**
 * Calcula el nivel de actividad basado en menciones y eventos recientes.
 */
export const getActivityLevel = (mentionCount: number, recentEvents: number): ActivityLevel => {
  if (mentionCount >= 6 || recentEvents >= 5) {
    return 'high';
  }
  if (mentionCount >= 3 || recentEvents >= 2) {
    return 'medium';
  }
  return 'low';
};

/**
 * Calcula tiempo relativo desde una fecha.
 */
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
};

/**
 * Normaliza un título para deduplicación.
 */
const normalizeTitle = (title: string): string => {
  return title.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');
};

/**
 * Determina el tipo de evento basado en el contenido.
 */
const getEventType = (item: FeedItem): 'news' | 'conflict' | 'infrastructure' | 'alert' => {
  if (item.isAlert) {
    return 'alert';
  }
  
  const titleLower = item.title.toLowerCase();
  const descLower = (item.description || '').toLowerCase();
  const text = `${titleLower} ${descLower}`;
  
  const conflictKeywords = ['conflict', 'war', 'attack', 'strike', 'military', 'battle', 'fighting'];
  const infrastructureKeywords = ['infrastructure', 'cable', 'nuclear', 'base', 'facility', 'power plant'];
  
  if (conflictKeywords.some(k => text.includes(k))) {
    return 'conflict';
  }
  if (infrastructureKeywords.some(k => text.includes(k))) {
    return 'infrastructure';
  }
  
  return 'news';
};

/**
 * Filtra y procesa eventos relevantes de feeds RSS para un país.
 */
const getRelevantEvents = (feedItems: FeedItem[], countryName: string, lastHours: number = 24): RelevantEvent[] => {
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - lastHours * 60 * 60 * 1000);
  
  // Filtrar feeds que mencionen el país y sean recientes
  const countryFeeds = extractCountriesFromFeeds(feedItems);
  const countryData = countryFeeds.find(c => normalizeCountryName(c.name) === normalizeCountryName(countryName));
  
  if (!countryData) {
    return [];
  }
  
  // Filtrar items que mencionen el país y estén en la ventana temporal
  const normalizedCountry = normalizeCountryName(countryName);
  const relevantItems = feedItems
    .filter(item => {
      const titleLower = item.title.toLowerCase();
      const descLower = (item.description || '').toLowerCase();
      const text = `${titleLower} ${descLower}`;
      
      // Verificar si el país está mencionado (matching aproximado)
      const countryVariants = [
        normalizedCountry,
        normalizedCountry.replace(/\s+/g, ''),
        normalizedCountry.replace(/\s+/g, '-'),
      ];
      
      const isMentioned = countryVariants.some(variant => {
        // Word boundary matching para evitar falsos positivos
        const regex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(text);
      });
      
      return isMentioned && item.pubDate >= cutoffTime;
    })
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  
  // Deduplicar títulos similares
  const seen = new Set<string>();
  const uniqueItems: FeedItem[] = [];
  
  for (const item of relevantItems) {
    const normalized = normalizeTitle(item.title);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueItems.push(item);
    }
  }
  
  // Limitar a 5 ítems y convertir a RelevantEvent
  return uniqueItems.slice(0, 5).map(item => ({
    type: getEventType(item),
    title: item.title,
    timestamp: item.pubDate,
    timeAgo: getTimeAgo(item.pubDate),
    source: item.source,
  }));
};

/**
 * Calcula actividad reciente agregada.
 */
const calculateRecentActivity = (feedItems: FeedItem[], countryName: string, lastHours: number = 24): CountrySituation['recentActivity'] => {
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - lastHours * 60 * 60 * 1000);
  
  const normalizedCountry = normalizeCountryName(countryName);
  const recentItems = feedItems.filter(item => {
    const titleLower = item.title.toLowerCase();
    const descLower = (item.description || '').toLowerCase();
    const text = `${titleLower} ${descLower}`;
    
    const countryVariants = [
      normalizedCountry,
      normalizedCountry.replace(/\s+/g, ''),
      normalizedCountry.replace(/\s+/g, '-'),
    ];
    
    const isMentioned = countryVariants.some(variant => {
      const regex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(text);
    });
    
    return isMentioned && item.pubDate >= cutoffTime;
  });
  
  const byType = {
    news: 0,
    conflict: 0,
    infrastructure: 0,
    other: 0,
  };
  
  recentItems.forEach(item => {
    const type = getEventType(item);
    if (type === 'news') byType.news++;
    else if (type === 'conflict') byType.conflict++;
    else if (type === 'infrastructure') byType.infrastructure++;
    else byType.other++;
  });
  
  return {
    totalEvents: recentItems.length,
    lastHours,
    byType,
  };
};

/**
 * Construye el payload completo de situación de un país.
 */
export const buildCountrySituation = async (
  countryName: string,
  _countryFeature?: Feature,
  feedItems: FeedItem[] = []
): Promise<CountrySituation> => {
  // Calcular hora local
  let localTime = '';
  
  // Buscar el país en top-countries.json para obtener coordenadas
  const countryMatch = topCountries.find(c => {
    const normalized = normalizeCountryName(c.name);
    const normalizedTarget = normalizeCountryName(countryName);
    return normalized === normalizedTarget || 
           c.variants.some(v => normalizeCountryName(v) === normalizedTarget);
  });
  
  if (countryMatch) {
    localTime = getLocalTimeFromLongitude(countryMatch.lon);
  } else {
    // Fallback: intentar obtener desde feeds RSS
    const countryFeeds = extractCountriesFromFeeds(feedItems);
    const countryData = countryFeeds.find(c => normalizeCountryName(c.name) === normalizeCountryName(countryName));
    if (countryData) {
      localTime = getLocalTimeFromLongitude(countryData.lon);
    } else {
      // Default: usar longitud 0 (Greenwich)
      localTime = getLocalTimeFromLongitude(0);
    }
  }
  
  // Calcular actividad reciente
  const recentActivity = calculateRecentActivity(feedItems, countryName, 24);
  
  // Obtener eventos relevantes
  const relevantEvents = getRelevantEvents(feedItems, countryName, 24);
  
  // Encontrar señales geográficas
  const geographicSignals = findGeographicSignals(countryName);
  
  // Calcular nivel de actividad
  const countryFeeds = extractCountriesFromFeeds(feedItems);
  const countryData = countryFeeds.find(c => normalizeCountryName(c.name) === normalizeCountryName(countryName));
  const mentionCount = countryData?.mentionCount || 0;
  const activityLevel = getActivityLevel(mentionCount, recentActivity.totalEvents);
  
  return {
    countryName,
    localTime,
    activityLevel,
    recentActivity,
    relevantEvents,
    geographicSignals,
  };
};

