/**
 * Modal de detalles de sector.
 * Muestra explicación narrativa y lista de noticias relevantes.
 * Basado en docs/features/NewsDrivenSectorHeatmap.md
 */

import React from 'react';
import type { Sector, SectorScore } from '../../types/sector.types';
import type { FeedItem } from '../../types/feed.types';
import { classifyNewsItem } from '../../utils/sectorClassifier';

interface SectorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: Sector;
  score: SectorScore;
}

/**
 * Formatea una fecha a formato relativo (ej: "2h ago", "1d ago").
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ago`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ago`;
  }
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes}m ago`;
};

/**
 * Genera explicación narrativa basada en el score y noticias.
 */
const generateNarrativeExplanation = (sector: Sector, score: SectorScore): string => {
  const top3News = score.topNews.slice(0, 3);
  
  // Si no hay noticias
  if (score.newsCount === 0) {
    return `The ${sector} sector shows no significant news activity in the last 12 hours. There are no recent news items affecting this sector's narrative.`;
  }

  // Determinar narrativa dominante
  const isPositive = score.score > 0;
  const isNegative = score.score < 0;
  const isNeutral = Math.abs(score.score) < 10;

  // Intensidad
  const intensity = Math.abs(score.score);
  const isHighIntensity = intensity > 50;
  const isMediumIntensity = intensity > 20;

  let explanation = '';

  if (isNeutral) {
    explanation = `The ${sector} sector is experiencing a relatively neutral narrative. `;
  } else if (isPositive) {
    if (isHighIntensity) {
      explanation = `The ${sector} sector is experiencing significant positive narrative momentum. `;
    } else if (isMediumIntensity) {
      explanation = `The ${sector} sector shows positive narrative trends. `;
    } else {
      explanation = `The ${sector} sector has a slightly positive narrative. `;
    }
  } else {
    if (isHighIntensity) {
      explanation = `The ${sector} sector is facing significant negative narrative pressure. `;
    } else if (isMediumIntensity) {
      explanation = `The ${sector} sector shows concerning narrative trends. `;
    } else {
      explanation = `The ${sector} sector has a slightly negative narrative. `;
    }
  }

  // Agregar información sobre noticias
  if (score.positiveCount > score.negativeCount && score.positiveCount > 0) {
    explanation += `Multiple positive news items are driving the narrative, with ${score.positiveCount} positive stories compared to ${score.negativeCount} negative ones. `;
  } else if (score.negativeCount > score.positiveCount && score.negativeCount > 0) {
    explanation += `Multiple negative news items are driving concerns, with ${score.negativeCount} negative stories compared to ${score.positiveCount} positive ones. `;
  } else if (score.newsCount > 0) {
    explanation += `The sector has ${score.newsCount} relevant news items in the last 12 hours. `;
  }

  // Agregar detalles de top noticias si hay
  if (top3News.length > 0) {
    const classifications = top3News.map(item => classifyNewsItem(item)).flat();
    const sectorClassifications = classifications.filter(c => c.primarySector === sector);
    
    if (sectorClassifications.length > 0) {
      const highImpactCount = sectorClassifications.filter(c => c.impact === 'high').length;
      if (highImpactCount > 0) {
        explanation += `Several high-impact news items are contributing to the current narrative. `;
      }
    }
  }

  // Cerrar con contexto general
  if (isPositive) {
    explanation += `Recent developments suggest a favorable outlook for the ${sector} sector.`;
  } else if (isNegative) {
    explanation += `Recent developments suggest challenges ahead for the ${sector} sector.`;
  } else {
    explanation += `The sector remains in a balanced state with mixed signals.`;
  }

  return explanation;
};

/**
 * Obtiene el color del badge de sentimiento.
 */
const getSentimentBadgeColor = (sentiment: 'positive' | 'negative' | 'neutral'): string => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-600 text-white';
    case 'negative':
      return 'bg-red-600 text-white';
    case 'neutral':
      return 'bg-gray-600 text-white';
  }
};

/**
 * Obtiene el color del badge de impacto.
 */
const getImpactBadgeColor = (impact: 'low' | 'medium' | 'high'): string => {
  switch (impact) {
    case 'high':
      return 'bg-yellow-500 text-black';
    case 'medium':
      return 'bg-yellow-300 text-black';
    case 'low':
      return 'bg-gray-500 text-white';
  }
};

/**
 * Obtiene el color del badge de score.
 */
const getScoreBadgeColor = (score: number): string => {
  if (score >= 50) return 'bg-green-400 text-gray-900';
  if (score >= 20) return 'bg-yellow-300 text-gray-900';
  if (score >= -20) return 'bg-yellow-500 text-gray-900';
  if (score >= -50) return 'bg-yellow-500 text-gray-900';
  return 'bg-red-600 text-white';
};

/**
 * Renderiza una noticia en la lista.
 */
const NewsItem: React.FC<{ item: FeedItem; sector: Sector }> = ({ item, sector }) => {
  const classifications = classifyNewsItem(item);
  const sectorClassification = classifications.find(c => c.primarySector === sector);
  
  const sentiment = sectorClassification?.sentiment || 'neutral';
  const impact = sectorClassification?.impact || 'low';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (item.link) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <a
      href={item.link}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className="block border-b border-gray-700 py-3 px-2 hover:bg-gray-800/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
          {item.source}
        </span>
        <div className="flex gap-1.5">
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${getSentimentBadgeColor(sentiment)}`}
          >
            {sentiment}
          </span>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${getImpactBadgeColor(impact)}`}
          >
            {impact}
          </span>
        </div>
      </div>
      <h4 className="text-sm text-gray-100 leading-snug mb-2 line-clamp-2">
        {item.title}
      </h4>
      <div className="text-xs text-gray-500">{formatRelativeTime(item.pubDate)}</div>
    </a>
  );
};

export const SectorDetailsModal: React.FC<SectorDetailsModalProps> = ({
  isOpen,
  onClose,
  sector,
  score,
}) => {
  if (!isOpen) return null;

  const explanation = generateNarrativeExplanation(sector, score);
  const scoreRounded = Math.round(score.score);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-100">
              {sector} Sector
            </h2>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${getScoreBadgeColor(score.score)}`}
            >
              {scoreRounded > 0 ? '+' : ''}{scoreRounded}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Explicación Narrativa */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
            Narrative Analysis
          </h3>
          <p className="text-sm text-gray-200 leading-relaxed">{explanation}</p>
        </div>

        {/* Estadísticas */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="bg-gray-700/50 rounded p-3">
            <div className="text-xs text-gray-400 mb-1">Total News</div>
            <div className="text-lg font-semibold text-gray-100">{score.newsCount}</div>
          </div>
          <div className="bg-gray-700/50 rounded p-3">
            <div className="text-xs text-gray-400 mb-1">Positive</div>
            <div className="text-lg font-semibold text-green-400">{score.positiveCount}</div>
          </div>
          <div className="bg-gray-700/50 rounded p-3">
            <div className="text-xs text-gray-400 mb-1">Negative</div>
            <div className="text-lg font-semibold text-red-400">{score.negativeCount}</div>
          </div>
          <div className="bg-gray-700/50 rounded p-3">
            <div className="text-xs text-gray-400 mb-1">Neutral</div>
            <div className="text-lg font-semibold text-gray-300">{score.neutralCount}</div>
          </div>
        </div>

        {/* Lista de Noticias */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
            Top News Items
          </h3>
          {score.topNews.length === 0 ? (
            <div className="text-sm text-gray-400 py-4 text-center">
              No recent news items for this sector
            </div>
          ) : (
            <div className="space-y-0">
              {score.topNews.map((item) => (
                <NewsItem key={item.id} item={item} sector={sector} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

