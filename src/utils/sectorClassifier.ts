/**
 * Clasificador de noticias por sector, sentimiento e impacto.
 * Basado en docs/features/NewsDrivenSectorHeatmap.md
 * 
 * Utiliza keyword matching sobre título y descripción de noticias.
 */

import type { FeedItem } from '../types/feed.types';
import type { Sector, Sentiment, ImpactLevel, SectorClassification } from '../types/sector.types';

/**
 * Keywords por sector para clasificación.
 */
const SECTOR_KEYWORDS: Record<Sector, string[]> = {
  Technology: [
    'tech', 'technology', 'software', 'semiconductor', 'chip', 'ai', 
    'artificial intelligence', 'cloud', 'computing', 'digital', 'internet', 
    'cyber', 'data', 'algorithm', 'platform', 'app', 'device', 'hardware',
    'software', 'startup', 'tech company', 'innovation', 'digital transformation'
  ],
  Finance: [
    'bank', 'financial', 'finance', 'market', 'trading', 'stock', 'currency',
    'fed', 'federal reserve', 'central bank', 'economy', 'inflation', 
    'interest rate', 'bond', 'investment', 'investor', 'marketplace', 
    'financial market', 'stock market', 'banking', 'monetary', 'fiscal'
  ],
  Healthcare: [
    'health', 'healthcare', 'medical', 'pharma', 'pharmaceutical', 'drug',
    'hospital', 'clinic', 'treatment', 'medicine', 'patient', 'disease',
    'healthcare sector', 'medical device', 'biotech', 'biotechnology',
    'clinical trial', 'health system', 'healthcare provider'
  ],
  Energy: [
    'oil', 'gas', 'energy', 'renewable', 'solar', 'wind', 'nuclear', 'power',
    'electricity', 'fuel', 'petroleum', 'crude', 'energy sector', 'drilling',
    'refinery', 'energy market', 'energy production', 'energy consumption'
  ],
  Consumer: [
    'retail', 'consumer', 'shopping', 'brand', 'store', 'sales', 
    'consumer goods', 'marketplace', 'e-commerce', 'retailer', 
    'consumer spending', 'retail sector', 'consumer market', 'shopping mall'
  ],
  Industrial: [
    'manufacturing', 'industrial', 'factory', 'production', 'manufacturing sector',
    'industrial sector', 'plant', 'manufacturing plant', 'industrial production',
    'factory output', 'manufacturing output'
  ],
  Materials: [
    'steel', 'copper', 'commodity', 'mining', 'metal', 'raw materials',
    'commodities', 'mineral', 'mining sector', 'metals market', 'commodity market',
    'steel production', 'copper price'
  ],
  Utilities: [
    'utility', 'utilities', 'power', 'electricity', 'grid', 'energy grid',
    'public utility', 'power plant', 'electric grid', 'utility sector',
    'power generation', 'electricity generation'
  ],
};

/**
 * Keywords positivos para detección de sentimiento.
 */
const POSITIVE_KEYWORDS = [
  'growth', 'surge', 'gain', 'rise', 'boost', 'breakthrough', 'success',
  'profit', 'increase', 'up', 'positive', 'expansion', 'recovery',
  'improvement', 'advance', 'progress', 'soar', 'jump', 'climb', 'rally',
  'boom', 'thrive', 'flourish', 'prosper', 'excel', 'outperform'
];

/**
 * Keywords negativos para detección de sentimiento.
 */
const NEGATIVE_KEYWORDS = [
  'decline', 'fall', 'crash', 'crisis', 'loss', 'breach', 'attack', 'failure',
  'decrease', 'down', 'negative', 'recession', 'collapse', 'downturn',
  'drop', 'plunge', 'slump', 'dive', 'tumble', 'sink', 'weaken', 'struggle',
  'fail', 'breakdown', 'disruption', 'shortage', 'scarcity'
];

/**
 * Keywords de alta intensidad para clasificación de impacto.
 */
const HIGH_IMPACT_KEYWORDS = [
  'crisis', 'crash', 'breakthrough', 'emergency', 'critical', 'urgent',
  'major', 'significant', 'massive', 'huge', 'enormous', 'devastating',
  'catastrophic', 'revolutionary', 'transformative', 'game-changing'
];

/**
 * Normaliza texto para comparación (lowercase, sin puntuación extra).
 */
const normalizeText = (text: string): string => {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, ' ');
};

/**
 * Verifica si un texto contiene alguno de los keywords dados.
 */
const containsKeywords = (text: string, keywords: string[]): boolean => {
  const normalized = normalizeText(text);
  return keywords.some(keyword => normalized.includes(keyword.toLowerCase()));
};

/**
 * Calcula la confianza de una clasificación basada en matches.
 */
const calculateConfidence = (matches: number, totalKeywords: number): number => {
  // Confianza basada en proporción de matches
  // Mínimo 0.3, máximo 1.0
  const ratio = matches / totalKeywords;
  return Math.min(1.0, Math.max(0.3, ratio * 2));
};

/**
 * Clasifica una noticia por sector.
 * Retorna todos los sectores que aplican (multi-sector).
 */
const classifySector = (item: FeedItem): Array<{ sector: Sector; confidence: number }> => {
  const text = `${item.title} ${item.description || ''}`;
  const normalized = normalizeText(text);
  
  const matches: Array<{ sector: Sector; confidence: number }> = [];
  
  Object.entries(SECTOR_KEYWORDS).forEach(([sector, keywords]) => {
    const sectorTyped = sector as Sector;
    let matchCount = 0;
    
    keywords.forEach(keyword => {
      if (normalized.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    });
    
    if (matchCount > 0) {
      const confidence = calculateConfidence(matchCount, keywords.length);
      matches.push({ sector: sectorTyped, confidence });
    }
  });
  
  // Si no hay matches, retornar array vacío (no clasificar)
  // Si hay matches, ordenar por confianza descendente
  return matches.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Clasifica el sentimiento de una noticia.
 */
const classifySentiment = (item: FeedItem): Sentiment => {
  const text = `${item.title} ${item.description || ''}`;
  
  const hasPositive = containsKeywords(text, POSITIVE_KEYWORDS);
  const hasNegative = containsKeywords(text, NEGATIVE_KEYWORDS);
  
  // Si tiene ambos, priorizar negativo (más impactante)
  if (hasNegative) return 'negative';
  if (hasPositive) return 'positive';
  return 'neutral';
};

/**
 * Clasifica el nivel de impacto de una noticia.
 */
const classifyImpact = (item: FeedItem): ImpactLevel => {
  // Alta prioridad si es alert
  if (item.isAlert) {
    return 'high';
  }
  
  const text = `${item.title} ${item.description || ''}`;
  
  // Alta prioridad si tiene keywords de alta intensidad
  if (containsKeywords(text, HIGH_IMPACT_KEYWORDS)) {
    return 'high';
  }
  
  // Verificar recencia
  const now = new Date();
  const hoursAgo = (now.getTime() - item.pubDate.getTime()) / (1000 * 60 * 60);
  
  // Muy reciente (< 2 horas) → medium o high
  if (hoursAgo < 2) {
    // Si tiene keywords de intensidad, high; si no, medium
    return containsKeywords(text, HIGH_IMPACT_KEYWORDS) ? 'high' : 'medium';
  }
  
  // Reciente (2-6 horas) → medium
  if (hoursAgo < 6) {
    return 'medium';
  }
  
  // Por defecto → low
  return 'low';
};

/**
 * Clasifica una noticia por sector, sentimiento e impacto.
 * Una noticia puede tener múltiples clasificaciones (multi-sector).
 * 
 * @param item - Noticia a clasificar
 * @returns Array de clasificaciones (puede estar vacío si no aplica ningún sector)
 */
export const classifyNewsItem = (item: FeedItem): SectorClassification[] => {
  const sectorMatches = classifySector(item);
  
  // Si no hay matches de sector, retornar array vacío
  if (sectorMatches.length === 0) {
    return [];
  }
  
  const sentiment = classifySentiment(item);
  const impact = classifyImpact(item);
  
  // Crear una clasificación por cada sector que aplica
  return sectorMatches.map(({ sector, confidence }) => ({
    primarySector: sector,
    sentiment,
    impact,
    confidence,
    feedItem: item,
  }));
};

/**
 * Clasifica múltiples noticias.
 * 
 * @param items - Array de noticias a clasificar
 * @returns Array plano de todas las clasificaciones
 */
export const classifyNewsItems = (items: FeedItem[]): SectorClassification[] => {
  const allClassifications: SectorClassification[] = [];
  
  items.forEach(item => {
    const classifications = classifyNewsItem(item);
    allClassifications.push(...classifications);
  });
  
  return allClassifications;
};

