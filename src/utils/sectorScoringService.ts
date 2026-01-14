/**
 * Servicio para calcular scores narrativos por sector.
 * Basado en docs/features/NewsDrivenSectorHeatmap.md
 * 
 * Agrega noticias clasificadas por sector y calcula un score normalizado
 * basado en impacto ponderado y sentimiento.
 */

import type { Sector, SectorClassification, SectorScore, SectorScoringConfig } from '../types/sector.types';
import type { FeedItem } from '../types/feed.types';

/**
 * Configuración por defecto para scoring.
 */
const DEFAULT_CONFIG: SectorScoringConfig = {
  timeWindowHours: 12,
  impactMultipliers: {
    low: 1,
    medium: 2,
    high: 3,
  },
  recencyDecay: {
    recent: 1.0, // < 2h
    medium: 0.8, // 2-6h
    old: 0.6, // 6-12h
  },
  maxTopNews: 10,
};

/**
 * Calcula el decay de recencia para una noticia.
 */
const calculateRecencyDecay = (item: FeedItem, config: SectorScoringConfig): number => {
  const now = new Date();
  const hoursAgo = (now.getTime() - item.pubDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursAgo < 2) {
    return config.recencyDecay.recent;
  }
  if (hoursAgo < 6) {
    return config.recencyDecay.medium;
  }
  if (hoursAgo < config.timeWindowHours) {
    return config.recencyDecay.old;
  }
  
  // Fuera de la ventana de tiempo
  return 0;
};

/**
 * Calcula el impacto ponderado de una clasificación.
 */
const calculateWeightedImpact = (
  classification: SectorClassification,
  config: SectorScoringConfig
): number => {
  const impactMultiplier = config.impactMultipliers[classification.impact];
  const recencyDecay = calculateRecencyDecay(classification.feedItem, config);
  
  // Si está fuera de la ventana de tiempo, retornar 0
  if (recencyDecay === 0) {
    return 0;
  }
  
  return impactMultiplier * recencyDecay * classification.confidence;
};

/**
 * Obtiene la dirección del sentimiento (positivo=+1, negativo=-1, neutro=0).
 */
const getSentimentDirection = (sentiment: SectorClassification['sentiment']): number => {
  switch (sentiment) {
    case 'positive':
      return 1;
    case 'negative':
      return -1;
    case 'neutral':
      return 0;
  }
};

/**
 * Filtra clasificaciones dentro de la ventana de tiempo.
 */
const filterByTimeWindow = (
  classifications: SectorClassification[],
  config: SectorScoringConfig
): SectorClassification[] => {
  const now = new Date();
  const timeWindowMs = config.timeWindowHours * 60 * 60 * 1000;
  const cutoffTime = new Date(now.getTime() - timeWindowMs);
  
  return classifications.filter(
    classification => classification.feedItem.pubDate >= cutoffTime
  );
};

/**
 * Calcula el score crudo para un sector.
 */
const calculateRawScore = (
  classifications: SectorClassification[],
  config: SectorScoringConfig
): number => {
  let rawScore = 0;
  
  classifications.forEach(classification => {
    const weightedImpact = calculateWeightedImpact(classification, config);
    const sentimentDirection = getSentimentDirection(classification.sentiment);
    
    rawScore += weightedImpact * sentimentDirection;
  });
  
  return rawScore;
};

/**
 * Calcula el score máximo posible para normalización.
 * Asume todas las noticias con impacto alto, recencia máxima y confianza 1.0.
 */
const calculateMaxPossibleScore = (
  classificationCount: number,
  config: SectorScoringConfig
): number => {
  const maxImpact = config.impactMultipliers.high;
  const maxRecency = config.recencyDecay.recent;
  const maxConfidence = 1.0;
  
  // Score máximo si todas fueran positivas
  return classificationCount * maxImpact * maxRecency * maxConfidence;
};

/**
 * Normaliza un score al rango -100 a +100.
 */
const normalizeScore = (
  rawScore: number,
  maxPossibleScore: number
): number => {
  if (maxPossibleScore === 0) {
    return 0;
  }
  
  // Normalizar al rango -100 a +100
  const normalized = (rawScore / maxPossibleScore) * 100;
  
  // Asegurar que esté en el rango
  return Math.max(-100, Math.min(100, normalized));
};

/**
 * Selecciona las top noticias para un sector.
 * Prioriza por impacto, recencia y sentimiento claro.
 */
const selectTopNews = (
  classifications: SectorClassification[],
  config: SectorScoringConfig
): FeedItem[] => {
  // Ordenar por relevancia
  const sorted = [...classifications].sort((a, b) => {
    // Primero por impacto (high > medium > low)
    const impactOrder = { high: 3, medium: 2, low: 1 };
    const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
    if (impactDiff !== 0) return impactDiff;
    
    // Luego por recencia (más reciente primero)
    const recencyA = calculateRecencyDecay(a.feedItem, config);
    const recencyB = calculateRecencyDecay(b.feedItem, config);
    const recencyDiff = recencyB - recencyA;
    if (recencyDiff !== 0) return recencyDiff;
    
    // Finalmente por confianza
    return b.confidence - a.confidence;
  });
  
  // Obtener noticias únicas (por ID)
  const seen = new Set<string>();
  const uniqueNews: FeedItem[] = [];
  
  for (const classification of sorted) {
    if (!seen.has(classification.feedItem.id)) {
      seen.add(classification.feedItem.id);
      uniqueNews.push(classification.feedItem);
      
      if (uniqueNews.length >= config.maxTopNews) {
        break;
      }
    }
  }
  
  return uniqueNews;
};

/**
 * Calcula el score narrativo para un sector específico.
 */
export const calculateSectorScore = (
  sector: Sector,
  classifications: SectorClassification[],
  config: SectorScoringConfig = DEFAULT_CONFIG
): SectorScore => {
  // Filtrar solo clasificaciones de este sector y dentro de la ventana de tiempo
  const sectorClassifications = filterByTimeWindow(
    classifications.filter(c => c.primarySector === sector),
    config
  );
  
  // Si no hay noticias, retornar score neutro
  if (sectorClassifications.length === 0) {
    return {
      sector,
      score: 0,
      newsCount: 0,
      positiveCount: 0,
      negativeCount: 0,
      neutralCount: 0,
      topNews: [],
      lastUpdate: new Date(),
    };
  }
  
  // Contar sentimientos
  const positiveCount = sectorClassifications.filter(c => c.sentiment === 'positive').length;
  const negativeCount = sectorClassifications.filter(c => c.sentiment === 'negative').length;
  const neutralCount = sectorClassifications.filter(c => c.sentiment === 'neutral').length;
  
  // Calcular score crudo
  const rawScore = calculateRawScore(sectorClassifications, config);
  
  // Calcular score máximo posible para normalización
  const maxPossibleScore = calculateMaxPossibleScore(sectorClassifications.length, config);
  
  // Normalizar score
  const normalizedScore = normalizeScore(rawScore, maxPossibleScore);
  
  // Seleccionar top noticias
  const topNews = selectTopNews(sectorClassifications, config);
  
  return {
    sector,
    score: normalizedScore,
    newsCount: sectorClassifications.length,
    positiveCount,
    negativeCount,
    neutralCount,
    topNews,
    lastUpdate: new Date(),
  };
};

/**
 * Calcula scores para todos los sectores.
 */
export const calculateAllSectorScores = (
  classifications: SectorClassification[],
  config: SectorScoringConfig = DEFAULT_CONFIG
): Record<Sector, SectorScore> => {
  const sectors: Sector[] = [
    'Technology',
    'Finance',
    'Healthcare',
    'Energy',
    'Consumer',
    'Industrial',
    'Materials',
    'Utilities',
  ];
  
  const scores: Record<Sector, SectorScore> = {} as Record<Sector, SectorScore>;
  
  sectors.forEach(sector => {
    scores[sector] = calculateSectorScore(sector, classifications, config);
  });
  
  return scores;
};

