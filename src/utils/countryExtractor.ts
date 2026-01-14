/**
 * Servicio para extraer países mencionados en feeds RSS.
 * Filtra solo países de la lista prioritaria y cuenta menciones.
 */

import type { FeedItem } from '../types/feed.types';
import type { RssCountryData } from '../types/feed.types';
import topCountriesData from '../data/top-countries.json';

interface CountryDefinition {
  name: string;
  lat: number;
  lon: number;
  variants: string[];
}

const countries: CountryDefinition[] = topCountriesData as CountryDefinition[];

/**
 * Crea un mapa de todas las variantes de nombres de países para búsqueda rápida.
 * Key: nombre normalizado (lowercase), Value: CountryDefinition
 */
const buildCountryMap = (): Map<string, CountryDefinition> => {
  const countryMap = new Map<string, CountryDefinition>();
  
  countries.forEach((country) => {
    // Añadir todas las variantes al mapa
    country.variants.forEach((variant) => {
      const normalized = variant.toLowerCase().trim();
      // Solo añadir si no existe ya (prioridad al primero encontrado)
      if (!countryMap.has(normalized)) {
        countryMap.set(normalized, country);
      }
    });
  });
  
  return countryMap;
};

const countryMap = buildCountryMap();

/**
 * Normaliza texto para búsqueda: lowercase, elimina puntuación al final de palabras.
 */
const normalizeText = (text: string): string => {
  return text.toLowerCase().trim();
};

/**
 * Extrae países mencionados en un texto.
 * Usa word boundaries para evitar falsos positivos (ej: "Turkey" como país vs "turkey" como animal).
 */
const extractCountriesFromText = (text: string): Set<CountryDefinition> => {
  const found = new Set<CountryDefinition>();
  const normalizedText = normalizeText(text);
  
  // Buscar cada variante de país en el texto
  countryMap.forEach((country, variant) => {
    // Crear regex con word boundaries para evitar matches parciales
    // Ej: "Turkey" debe matchear pero no "turkey" (animal) a menos que esté al inicio de palabra
    const regex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    
    if (regex.test(normalizedText)) {
      found.add(country);
    }
  });
  
  return found;
};

/**
 * Extrae países mencionados en todos los feeds RSS.
 * Retorna array de países únicos con contador de menciones y última fecha de mención.
 */
export const extractCountriesFromFeeds = (feedItems: FeedItem[]): RssCountryData[] => {
  // Mapa para acumular menciones: key = nombre país, value = { count, latestDate, country }
  const countryMentions = new Map<string, {
    count: number;
    latestDate: Date;
    country: CountryDefinition;
  }>();
  
  // Procesar cada feed item
  feedItems.forEach((item) => {
    // Combinar título y descripción para búsqueda
    const searchText = `${item.title} ${item.description || ''}`;
    const foundCountries = extractCountriesFromText(searchText);
    
    // Actualizar contadores para cada país encontrado
    foundCountries.forEach((country) => {
      const existing = countryMentions.get(country.name);
      
      if (existing) {
        // Incrementar contador y actualizar fecha si es más reciente
        existing.count += 1;
        if (item.pubDate > existing.latestDate) {
          existing.latestDate = item.pubDate;
        }
      } else {
        // Primera mención
        countryMentions.set(country.name, {
          count: 1,
          latestDate: item.pubDate,
          country,
        });
      }
    });
  });
  
  // Convertir mapa a array de RssCountryData
  const result: RssCountryData[] = Array.from(countryMentions.values()).map((mention) => ({
    name: mention.country.name,
    lat: mention.country.lat,
    lon: mention.country.lon,
    mentionCount: mention.count,
    latestMention: mention.latestDate,
  }));
  
  // Ordenar por número de menciones (descendente)
  result.sort((a, b) => b.mentionCount - a.mentionCount);
  
  return result;
};

