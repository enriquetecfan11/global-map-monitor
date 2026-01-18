import React, { useEffect, useMemo, useState, useRef } from 'react';
import type { FeedItem, FeedCategory } from '../../types/feed.types';
import { useFeedStore } from '../../stores/feedStore';
import { useUIStore } from '../../stores/uiStore';
import { getMentionsForCountry, type TimeRange, type MentionsFilters } from '../../utils/mentionsService';

interface MentionsPanelProps {
  isOpen: boolean;
  countryName: string | null;
  onClose: () => void;
}

/**
 * Formatea una fecha a texto relativo (ej: "2h ago", "1d ago").
 */
const formatTimeAgo = (date: Date): string => {
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
 * Obtiene el label de una categoría.
 */
const getCategoryLabel = (category: FeedCategory | 'all'): string => {
  const labels: Record<FeedCategory | 'all', string> = {
    world: 'World',
    geopolitical: 'Geopolitical',
    technology: 'Technology',
    ai: 'AI',
    finance: 'Finance',
    all: 'All Categories',
  };
  return labels[category] || category;
};

/**
 * Panel lateral (drawer) que muestra las menciones de un país.
 */
export const MentionsPanel: React.FC<MentionsPanelProps> = ({
  isOpen,
  countryName,
  onClose,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [category, setCategory] = useState<FeedCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Obtener feeds del store
  const feeds = useFeedStore((state) => state.feeds);
  const allFeedItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];
    Object.values(feeds).forEach((categoryItems) => {
      items.push(...categoryItems);
    });
    return items;
  }, [feeds]);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Obtener menciones filtradas
  const mentions = useMemo(() => {
    if (!countryName) {
      return [];
    }

    const filters: MentionsFilters = {
      timeRange,
      category: category === 'all' ? undefined : category,
      searchQuery: debouncedSearchQuery || undefined,
    };

    return getMentionsForCountry(allFeedItems, countryName, filters);
  }, [allFeedItems, countryName, timeRange, category, debouncedSearchQuery]);

  // Focus trap y cerrar con ESC
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus en el input de búsqueda al abrir
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !countryName) {
    return null;
  }

  const mentionCount = mentions.length;

  return (
    <>
      {/* Overlay semitransparente */}
      <div
        className="fixed inset-0 bg-black/50 z-[1998]"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-labelledby="mentions-panel-title"
        aria-modal="true"
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-gray-800 border-l border-gray-700 shadow-2xl z-[1999] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h2 id="mentions-panel-title" className="text-lg font-semibold text-white">
              Menciones: {countryName}
            </h2>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded border border-blue-500/50">
              {mentionCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            aria-label="Cerrar panel de menciones"
            title="Cerrar (ESC)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        {/* Filtros */}
        <div className="p-4 border-b border-gray-700 space-y-3 bg-gray-800/50">
          {/* Selector de tiempo */}
          <div>
            <label htmlFor="time-range" className="block text-xs text-gray-400 mb-1">
              Rango temporal
            </label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="all">Todo</option>
            </select>
          </div>

          {/* Selector de categoría */}
          <div>
            <label htmlFor="category" className="block text-xs text-gray-400 mb-1">
              Categoría
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedCategory | 'all')}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="world">World</option>
              <option value="geopolitical">Geopolitical</option>
              <option value="technology">Technology</option>
              <option value="ai">AI</option>
              <option value="finance">Finance</option>
            </select>
          </div>

          {/* Búsqueda */}
          <div>
            <label htmlFor="search" className="block text-xs text-gray-400 mb-1">
              Buscar
            </label>
            <input
              ref={searchInputRef}
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en títulos..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Lista de menciones */}
        <div className="flex-1 overflow-y-auto">
          {mentionCount === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 text-sm mb-4">
                {searchQuery || category !== 'all' || timeRange !== 'all' ? (
                  <>
                    No se encontraron menciones con los filtros aplicados.
                    <br />
                    <button
                      onClick={() => {
                        setTimeRange('all');
                        setCategory('all');
                        setSearchQuery('');
                      }}
                      className="mt-2 text-blue-400 hover:text-blue-300 underline"
                    >
                      Limpiar filtros
                    </button>
                  </>
                ) : (
                  <>
                    No hay menciones disponibles para este país.
                    <br />
                    <button
                      onClick={() => {
                        onClose();
                        // Scroll a FeedsSection (se implementará después)
                      }}
                      className="mt-2 text-blue-400 hover:text-blue-300 underline"
                    >
                      Ver feeds
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {mentions.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  {/* Header del item */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-gray-400 uppercase">
                        {item.source}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {getCategoryLabel(item.category)}
                      </span>
                      {item.isAlert && (
                        <>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded border border-yellow-500/50">
                            ALERT
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTimeAgo(item.pubDate)}
                    </span>
                  </div>

                  {/* Título (clicable) */}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-medium text-blue-400 hover:text-blue-300 mb-2 line-clamp-2"
                  >
                    {item.title}
                  </a>

                  {/* Snippet/descripción */}
                  {item.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con última actualización */}
        <div className="p-3 border-t border-gray-700 bg-gray-800/50">
          <div className="text-xs text-gray-500 text-center">
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </div>
        </div>
      </div>
    </>
  );
};
