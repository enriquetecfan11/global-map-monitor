/**
 * Componente FeedCard unificado.
 * 
 * Este es el ÚNICO componente de card para todas las categorías de feeds.
 * No debe haber variaciones visuales entre categorías.
 * 
 * Basado en el diseño de referencia: fondo oscuro, texto claro,
 * tag ALERT opcional, fecha completa (día y hora).
 */

import React from 'react';
import type { FeedItem } from '../../types/feed.types';

interface FeedCardProps {
  item: FeedItem;
}

/**
 * Formatea una fecha a formato completo en español (ej: "09 Ene 2026, 14:30")
 */
const formatFullDate = (date: Date): string => {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

export const FeedCard: React.FC<FeedCardProps> = ({ item }) => {
  const fullDate = formatFullDate(item.pubDate);

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
      role="article"
      aria-label={`Noticia: ${item.title}`}
    >
      {/* Source y Alert Tag */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
          {item.source}
        </span>
        {item.isAlert && (
          <span
            className="text-[10px] font-semibold text-black bg-yellow-500 px-1.5 py-0.5 rounded uppercase tracking-tight"
            aria-label="Alert"
          >
            ALERT
          </span>
        )}
      </div>

      {/* Headline */}
      <h4 className="text-sm text-gray-100 leading-snug mb-2 line-clamp-3">
        {item.title}
      </h4>

      {/* Fecha completa */}
      <div className="text-xs text-gray-500">{fullDate}</div>
    </a>
  );
};

