/**
 * Tipos para el sistema de News-Driven Sector Heatmap.
 * Basado en docs/features/NewsDrivenSectorHeatmap.md
 */

import type { FeedItem } from './feed.types';

export type Sector = 
  | 'Technology' 
  | 'Finance' 
  | 'Healthcare' 
  | 'Energy' 
  | 'Consumer' 
  | 'Industrial' 
  | 'Materials' 
  | 'Utilities';

export type Sentiment = 'positive' | 'negative' | 'neutral';

export type ImpactLevel = 'low' | 'medium' | 'high';

/**
 * Clasificación de una noticia por sector, sentimiento e impacto.
 * Una noticia puede tener múltiples clasificaciones (multi-sector).
 */
export interface SectorClassification {
  /** Sector primario al que afecta la noticia */
  primarySector: Sector;
  /** Subsector opcional (ej: "Semiconductors" dentro de Technology) */
  subsector?: string;
  /** Sentimiento detectado en la noticia */
  sentiment: Sentiment;
  /** Nivel de impacto de la noticia */
  impact: ImpactLevel;
  /** Confianza en la clasificación (0-1) */
  confidence: number;
  /** Noticia original */
  feedItem: FeedItem;
}

/**
 * Score narrativo agregado para un sector.
 * Representa el impacto narrativo de todas las noticias relevantes.
 */
export interface SectorScore {
  /** Sector al que pertenece el score */
  sector: Sector;
  /** Score normalizado de -100 a +100 */
  score: number;
  /** Número total de noticias que afectan este sector */
  newsCount: number;
  /** Número de noticias con sentimiento positivo */
  positiveCount: number;
  /** Número de noticias con sentimiento negativo */
  negativeCount: number;
  /** Número de noticias con sentimiento neutro */
  neutralCount: number;
  /** Top 5-10 noticias más relevantes para este sector */
  topNews: FeedItem[];
  /** Fecha de última actualización */
  lastUpdate: Date;
}

/**
 * Estado del store de sectores.
 */
export interface SectorStoreState {
  /** Scores por sector */
  scores: Record<Sector, SectorScore>;
  /** Indica si se está calculando/actualizando */
  loading: boolean;
  /** Fecha de última actualización global */
  lastUpdate: Date | null;
}

/**
 * Configuración para el cálculo de scores.
 */
export interface SectorScoringConfig {
  /** Ventana de tiempo en horas (por defecto: 12) */
  timeWindowHours: number;
  /** Multiplicadores de impacto */
  impactMultipliers: {
    low: number;
    medium: number;
    high: number;
  };
  /** Decay de recencia por rango de horas */
  recencyDecay: {
    recent: number; // < 2h
    medium: number; // 2-6h
    old: number; // 6-12h
  };
  /** Máximo de noticias top por sector */
  maxTopNews: number;
}

