/**
 * Sección de Feeds Globales.
 * 
 * Consume feeds RSS reales desde Google News según docs/reference/RssFeedsStrategy.md.
 * Usa componente FeedCard unificado para todas las categorías.
 * 
 * Layout de columnas según diseño de referencia:
 * - WORLD / GEOPOLITICAL
 * - TECHNOLOGY / AI
 * - FINANCIAL
 * - ALERTS (derivado de otras categorías)
 */

import React, { useEffect } from 'react';
import { useFeedStore } from '../../stores/feedStore';
import { FeedCard } from './FeedCard';
import type { FeedGroup, FeedItem } from '../../types/feed.types';

interface FeedGroupConfig {
  group: FeedGroup;
  label: string;
  getItems: (feeds: ReturnType<typeof useFeedStore>['feeds'], alerts: FeedItem[]) => FeedItem[];
}

const feedGroups: FeedGroupConfig[] = [
  {
    group: 'world-geopolitical',
    label: 'WORLD / GEOPOLITICAL',
    getItems: (feeds) => [...feeds.world, ...feeds.geopolitical],
  },
  {
    group: 'technology-ai',
    label: 'TECHNOLOGY / AI',
    getItems: (feeds) => [...feeds.technology, ...feeds.ai],
  },
  {
    group: 'finance',
    label: 'FINANCIAL',
    getItems: (feeds) => feeds.finance,
  },
  {
    group: 'alerts',
    label: 'ALERTS',
    getItems: (feeds, alerts) => alerts,
  },
];

export const FeedsSection: React.FC = () => {
  const { feeds, alerts, loading, fetchAllFeeds } = useFeedStore();

  useEffect(() => {
    // Cargar feeds al montar el componente
    fetchAllFeeds();
  }, [fetchAllFeeds]);

  // Preparar grupos de feeds y ordenar por fecha (más recientes primero)
  const feedGroupsData = feedGroups.map((config) => {
    const items = config.getItems(feeds, alerts);
    // Ordenar por fecha (más recientes primero)
    const sortedItems = [...items].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    return {
      ...config,
      items: sortedItems,
    };
  });

  return (
    <section
      className="w-full border-b border-gray-700 bg-gray-900 py-6 px-6"
      aria-label="Feeds Section"
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Feeds</h2>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading feeds...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feedGroupsData.map(({ group, label, items }) => (
            <div
              key={group}
              className="flex flex-col border-r border-gray-700 last:border-r-0 pr-4 last:pr-0"
            >
              {/* Header con contador */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    {label}
                  </h3>
                  {items.length > 0 && (
                    <span className="text-xs text-gray-500">{items.length}</span>
                  )}
                </div>
                <div className="border-b border-gray-700"></div>
              </div>

              {/* Feed Cards */}
              <div className="flex-1 overflow-y-auto max-h-[600px]">
                {items.length === 0 ? (
                  <div className="text-xs text-gray-500 py-4 text-center">
                    No items available
                  </div>
                ) : (
                  items.map((item, index) => (
                    <FeedCard key={`${group}-${item.id}-${index}`} item={item} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado de error global (si todos los feeds fallan) */}
      {!loading && feedGroupsData.every((g) => g.items.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">Unable to load feeds</p>
          <p className="text-xs text-gray-500">
            This may be due to CORS restrictions or network issues.
          </p>
        </div>
      )}
    </section>
  );
};
