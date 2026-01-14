/**
 * Tipos para el sistema de feeds RSS
 * Basado en docs/reference/RssFeedsStrategy.md
 */

export type FeedCategory = 'world' | 'geopolitical' | 'technology' | 'ai' | 'finance';

export type FeedGroup = 'world-geopolitical' | 'technology-ai' | 'finance' | 'alerts';

export interface FeedItem {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: Date;
  category: FeedCategory;
  isAlert?: boolean;
  description?: string;
}

export interface FeedGroupData {
  group: FeedGroup;
  label: string;
  items: FeedItem[];
  count?: number;
}

export interface RssCountryData {
  name: string;
  lat: number;
  lon: number;
  mentionCount: number;
  latestMention: Date;
}

export interface FeedStoreState {
  feeds: Record<FeedCategory, FeedItem[]>;
  alerts: FeedItem[];
  rssCountries: RssCountryData[];
  loading: boolean;
  errors: Record<FeedCategory, string | null>;
  lastFetch: Date | null;
}

