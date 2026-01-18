/**
 * Servicio para obtener y filtrar menciones de países desde feeds RSS.
 * Reutiliza lógica de countrySituationService.ts pero sin límite de items.
 */

import type { FeedItem, FeedCategory } from '../types/feed.types';
import { extractCountriesFromFeeds } from './countryExtractor';

export type TimeRange = '24h' | '7d' | '30d' | 'all';

export interface MentionsFilters {
  timeRange?: TimeRange;
  category?: FeedCategory | 'all';
  searchQuery?: string;
}

/**
 * Cache en memoria para menciones por país.
 * Key: `${countryName}-${JSON.stringify(filters)}`
 * Value: FeedItem[]
 */
const mentionsCache = new Map<string, FeedItem[]>();

/**
 * Genera una clave de cache para un país y sus filtros.
 */
const getCacheKey = (countryName: string, filters: MentionsFilters): string => {
  const normalizedCountry = normalizeCountryName(countryName);
  const filtersKey = JSON.stringify({
    timeRange: filters.timeRange || 'all',
    category: filters.category || 'all',
    searchQuery: filters.searchQuery || '',
  });
  return `${normalizedCountry}-${filtersKey}`;
};

/**
 * Limpia el cache de menciones.
 * Útil cuando se actualizan los feeds.
 */
export const clearMentionsCache = (): void => {
  mentionsCache.clear();
};

/**
 * Normaliza un nombre de país para comparación.
 */
const normalizeCountryName = (name: string): string => {
  return name.toLowerCase().trim();
};

/**
 * Verifica si un país está mencionado en un FeedItem.
 * Usa la misma lógica que extractCountriesFromFeeds para consistencia.
 */
const isCountryMentioned = (item: FeedItem, countryName: string): boolean => {
  // Usar extractCountriesFromFeeds para obtener todos los países mencionados en este item
  // y verificar si el país está en la lista
  const countriesInItem = extractCountriesFromFeeds([item]);
  const normalizedCountry = normalizeCountryName(countryName);
  
  return countriesInItem.some(country => 
    normalizeCountryName(country.name) === normalizedCountry
  );
};

/**
 * Aplica filtro de rango temporal.
 */
const applyTimeFilter = (items: FeedItem[], timeRange: TimeRange): FeedItem[] => {
  if (timeRange === 'all') {
    return items;
  }
  
  const now = new Date();
  let cutoffTime: Date;
  
  switch (timeRange) {
    case '24h':
      cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return items;
  }
  
  return items.filter(item => item.pubDate >= cutoffTime);
};

/**
 * Aplica filtro de categoría.
 */
const applyCategoryFilter = (items: FeedItem[], category: FeedCategory | 'all'): FeedItem[] => {
  if (category === 'all') {
    return items;
  }
  
  return items.filter(item => item.category === category);
};

/**
 * Aplica filtro de búsqueda en título y descripción.
 */
const applySearchFilter = (items: FeedItem[], searchQuery: string): FeedItem[] => {
  if (!searchQuery || searchQuery.trim() === '') {
    return items;
  }
  
  const query = searchQuery.toLowerCase().trim();
  
  return items.filter(item => {
    const titleLower = item.title.toLowerCase();
    const descLower = (item.description || '').toLowerCase();
    const text = `${titleLower} ${descLower}`;
    
    return text.includes(query);
  });
};

/**
 * Obtiene todas las menciones de un país desde los feeds RSS.
 * Aplica filtros opcionales y ordena por fecha (más recientes primero).
 * Usa cache en memoria para mejorar el rendimiento.
 * 
 * @param feedItems - Array de todos los FeedItem disponibles
 * @param countryName - Nombre del país
 * @param filters - Filtros opcionales (tiempo, categoría, búsqueda)
 * @param useCache - Si es true, usa cache (por defecto: true)
 * @returns Array de FeedItem que mencionan el país, filtrados y ordenados
 */
export const getMentionsForCountry = (
  feedItems: FeedItem[],
  countryName: string,
  filters: MentionsFilters = {},
  useCache: boolean = true
): FeedItem[] => {
  // Verificar cache (solo si no hay búsqueda, ya que la búsqueda es dinámica)
  if (useCache && !filters.searchQuery) {
    const cacheKey = getCacheKey(countryName, filters);
    const cached = mentionsCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  // 1. Filtrar por país
  let mentions = feedItems.filter(item => isCountryMentioned(item, countryName));
  
  // 2. Aplicar filtro de tiempo
  if (filters.timeRange) {
    mentions = applyTimeFilter(mentions, filters.timeRange);
  }
  
  // 3. Aplicar filtro de categoría
  if (filters.category) {
    mentions = applyCategoryFilter(mentions, filters.category);
  }
  
  // 4. Aplicar filtro de búsqueda
  if (filters.searchQuery) {
    mentions = applySearchFilter(mentions, filters.searchQuery);
  }
  
  // 5. Ordenar por fecha (más recientes primero)
  mentions.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  
  // Guardar en cache (solo si no hay búsqueda)
  if (useCache && !filters.searchQuery) {
    const cacheKey = getCacheKey(countryName, filters);
    mentionsCache.set(cacheKey, mentions);
  }
  
  return mentions;
};

/**
 * Obtiene el número total de menciones para un país (sin filtros).
 * Útil para mostrar el contador en el popup.
 */
export const getMentionCountForCountry = (
  feedItems: FeedItem[],
  countryName: string
): number => {
  return feedItems.filter(item => isCountryMentioned(item, countryName)).length;
};
