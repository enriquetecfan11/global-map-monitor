import React from 'react';
import { ConnectionIndicator, LoadingIndicator } from '../StatusIndicators';
import { SystemStatusBanner } from '../SystemStatus';
import { useUIStore } from '../../stores/uiStore';
import { useFeedStore } from '../../stores/feedStore';
import { clearRssCache } from '../../utils/rssService';

export const Header: React.FC = () => {
  const { loading } = useUIStore();
  const { fetchAllFeeds, loading: feedsLoading } = useFeedStore();

  const handleRefresh = async () => {
    // Limpiar cache para forzar recarga completa
    clearRssCache();
    // Refrescar todos los feeds
    await fetchAllFeeds();
  };

  return (
    <header
      className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0 sticky top-0 z-40"
      role="banner"
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-100">map-monitor</h1>
        <SystemStatusBanner />
      </div>

      <div className="flex items-center gap-4">
        {loading && (
          <LoadingIndicator size="sm" label="Sincronizando datos..." />
        )}
        <ConnectionIndicator isOnline={true} />
        <button
          onClick={handleRefresh}
          disabled={loading || feedsLoading}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-100 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Actualizar feeds RSS"
          title="Actualizar feeds RSS"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

