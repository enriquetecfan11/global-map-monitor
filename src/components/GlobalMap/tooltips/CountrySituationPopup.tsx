import React, { useEffect, useState } from 'react';
import type { CountrySituation } from '../../../types/map.types';
import type { FeedItem } from '../../../types/feed.types';
import type { Feature } from 'geojson';
import { buildCountrySituation } from '../../../utils/countrySituationService';
import { useFeedStore } from '../../../stores/feedStore';
import { useUIStore } from '../../../stores/uiStore';
import { getMentionCountForCountry } from '../../../utils/mentionsService';

interface CountrySituationPopupProps {
  countryName: string;
  countryFeature?: Feature;
  contentOnly?: boolean; // Si es true, solo renderiza el contenido sin el wrapper Popup
}

/**
 * Componente de popup que muestra la situación completa de un país.
 * Renderiza secciones: header, actividad reciente, eventos relevantes, señales geográficas.
 */
export const CountrySituationPopup: React.FC<CountrySituationPopupProps> = ({
  countryName,
  countryFeature,
  contentOnly = false,
}) => {
  const [situation, setSituation] = useState<CountrySituation | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Obtener todos los feeds del store
  const feeds = useFeedStore((state) => state.feeds);
  const { openMentionsPanel } = useUIStore();
  const allFeedItems: FeedItem[] = [];
  Object.values(feeds).forEach((categoryItems) => {
    allFeedItems.push(...categoryItems);
  });

  useEffect(() => {
    const loadSituation = async () => {
      setLoading(true);
      try {
        const countrySituation = await buildCountrySituation(
          countryName,
          countryFeature,
          allFeedItems
        );
        setSituation(countrySituation);
      } catch (error) {
        console.error('Error building country situation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSituation();
  }, [countryName, countryFeature, allFeedItems.length]);

  const getActivityBadgeColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return '🚨';
      case 'conflict':
        return '⚔️';
      case 'infrastructure':
        return '🏗️';
      case 'news':
      default:
        return '📰';
    }
  };

  const getInfrastructureIcon = (type: string) => {
    switch (type) {
      case 'cable':
        return '🔌';
      case 'nuclear':
        return '⚛️';
      case 'military':
        return '🎖️';
      default:
        return '📍';
    }
  };

  const content = (
    <div className="text-sm text-gray-100 min-w-[320px] max-w-[400px]">
        {loading ? (
          <div className="space-y-4 p-2">
            <div className="h-6 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded animate-pulse w-5/6" />
          </div>
        ) : situation ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="border-b border-gray-700 pb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">{situation.countryName}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getActivityBadgeColor(
                    situation.activityLevel
                  )}`}
                >
                  {situation.activityLevel.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span>🕐</span>
                <span>{situation.localTime}</span>
              </div>
            </div>

            {/* Recent Activity */}
            {situation.recentActivity.totalEvents > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Recent Activity ({situation.recentActivity.lastHours}h)
                </h4>
                <div className="bg-gray-800/50 rounded p-3 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-300 font-medium">
                      {situation.recentActivity.totalEvents}
                    </span>
                    <span className="text-gray-500 ml-1">events detected</span>
                  </div>
                  {(situation.recentActivity.byType.news > 0 ||
                    situation.recentActivity.byType.conflict > 0 ||
                    situation.recentActivity.byType.infrastructure > 0) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {situation.recentActivity.byType.news > 0 && (
                        <span className="text-gray-400">
                          📰 {situation.recentActivity.byType.news} news
                        </span>
                      )}
                      {situation.recentActivity.byType.conflict > 0 && (
                        <span className="text-gray-400">
                          ⚔️ {situation.recentActivity.byType.conflict} conflict
                        </span>
                      )}
                      {situation.recentActivity.byType.infrastructure > 0 && (
                        <span className="text-gray-400">
                          🏗️ {situation.recentActivity.byType.infrastructure} infrastructure
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const totalMentions = getMentionCountForCountry(allFeedItems, countryName);
                      openMentionsPanel(countryName, totalMentions);
                    }}
                    className="w-full mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    Ver todas las menciones ({getMentionCountForCountry(allFeedItems, countryName)})
                  </button>
                </div>
              </div>
            )}

            {/* Relevant Events */}
            {situation.relevantEvents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Relevant Events
                </h4>
                <div className="space-y-2">
                  {situation.relevantEvents.map((event, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded p-2 border-l-2 border-gray-600"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base">{getEventIcon(event.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-300 line-clamp-2">
                            {event.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span>{event.timeAgo}</span>
                            {event.source && (
                              <>
                                <span>•</span>
                                <span>{event.source}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Geographic Signals */}
            {(situation.geographicSignals.hotspots.length > 0 ||
              situation.geographicSignals.conflictZones.length > 0 ||
              situation.geographicSignals.infrastructure.length > 0) && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Key Locations
                </h4>
                <div className="bg-gray-800/50 rounded p-3 space-y-2">
                  {situation.geographicSignals.hotspots.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Hotspots:</div>
                      <div className="space-y-1">
                        {situation.geographicSignals.hotspots.map((hotspot, index) => (
                          <div key={index} className="text-xs text-gray-300 flex items-center gap-2">
                            <span className="text-red-400">●</span>
                            <span>{hotspot.name}</span>
                            {hotspot.level && (
                              <span className="text-gray-500 text-[10px]">({hotspot.level})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {situation.geographicSignals.conflictZones.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Conflict Zones:</div>
                      <div className="space-y-1">
                        {situation.geographicSignals.conflictZones.map((zone, index) => (
                          <div key={index} className="text-xs text-gray-300 flex items-center gap-2">
                            <span className="text-red-500">■</span>
                            <span>{zone.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {situation.geographicSignals.infrastructure.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Infrastructure:</div>
                      <div className="space-y-1">
                        {situation.geographicSignals.infrastructure.map((infra, index) => (
                          <div key={index} className="text-xs text-gray-300 flex items-center gap-2">
                            <span>{getInfrastructureIcon(infra.type || '')}</span>
                            <span>{infra.name}</span>
                            {infra.type && (
                              <span className="text-gray-500 text-[10px]">({infra.type})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {situation.recentActivity.totalEvents === 0 &&
              situation.relevantEvents.length === 0 &&
              situation.geographicSignals.hotspots.length === 0 &&
              situation.geographicSignals.conflictZones.length === 0 &&
              situation.geographicSignals.infrastructure.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-xs">
                  No recent activity detected
                </div>
              )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-xs">
            Unable to load country situation
          </div>
        )}
      </div>
  );

  // Siempre retornar solo el contenido (contentOnly es true cuando se usa desde D3)
  return content;
};

