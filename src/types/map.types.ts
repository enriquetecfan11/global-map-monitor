export type LayerId = 'countries' | 'hotspots' | 'conflicts' | 'cables' | 'nuclear' | 'military' | 'rss-countries';

export type HotspotLevel = 'low' | 'elevated' | 'high';

export interface LayerConfig {
  id: LayerId;
  label: string;
  enabled: boolean;
  zIndex: number;
  order: number;
}

export interface LayersState {
  countries: LayerConfig;
  hotspots: LayerConfig;
  conflicts: LayerConfig;
  cables: LayerConfig;
  nuclear: LayerConfig;
  military: LayerConfig;
  rssCountries: LayerConfig;
}

export interface HotspotData {
  name: string;
  lat: number;
  lon: number;
  level: HotspotLevel;
  desc: string;
}

export interface ConflictZoneData {
  name: string;
  bounds: [[number, number], [number, number]];
  coordinates?: number[][]; // Para polígonos más complejos
}

export interface StrategicInfrastructureData {
  name: string;
  lat: number;
  lon: number;
  desc: string;
}

export interface TooltipPayload {
  title: string;
  lines: string[];
  meta?: Record<string, unknown>;
}

export type ActivityLevel = 'low' | 'medium' | 'high';
export type EventType = 'news' | 'conflict' | 'infrastructure' | 'alert';

export interface RelevantEvent {
  type: EventType;
  title: string;
  timestamp: Date;
  timeAgo: string;
  source?: string;
}

export interface RecentActivity {
  totalEvents: number;
  lastHours: number;
  byType: {
    news: number;
    conflict: number;
    infrastructure: number;
    other: number;
  };
}

export interface GeographicSignal {
  name: string;
  level?: string;
  type?: string;
}

export interface GeographicSignals {
  hotspots: GeographicSignal[];
  conflictZones: GeographicSignal[];
  infrastructure: GeographicSignal[];
}

export interface ContextualSignals {
  weatherExtreme?: boolean;
  activityAnomaly?: boolean;
}

export interface CountrySituation {
  countryName: string;
  localTime: string;
  activityLevel: ActivityLevel;
  recentActivity: RecentActivity;
  relevantEvents: RelevantEvent[];
  geographicSignals: GeographicSignals;
  contextualSignals?: ContextualSignals;
}

