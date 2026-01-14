/**
 * Store de Zustand para gestión de feeds RSS.
 * Basado en docs/reference/RssFeedsStrategy.md
 */

import { create } from 'zustand';
import type { FeedItem, FeedCategory, FeedStoreState } from '../types/feed.types';
import { fetchAllRssFeeds } from '../utils/rssService';
import { extractCountriesFromFeeds } from '../utils/countryExtractor';

interface FeedStore extends FeedStoreState {
  fetchAllFeeds: () => Promise<void>;
  refreshFeed: (category: FeedCategory) => Promise<void>;
  clearCache: () => void;
}

/**
 * Keywords de alta prioridad para detectar alerts.
 * Items con estos keywords en el título se marcan como alerts.
 */
const ALERT_KEYWORDS = [
  'alert',
  'breaking',
  'crisis',
  'conflict',
  'emergency',
  'urgent',
  'critical',
  'attack',
  'strike',
  'sanctions',
  'war',
  'military action',
];

/**
 * Detecta si un item debe ser marcado como alert.
 * Basado en keywords de alta prioridad y timestamp reciente.
 */
const isAlertItem = (item: FeedItem): boolean => {
  const titleLower = item.title.toLowerCase();
  
  // Verificar keywords
  const hasAlertKeyword = ALERT_KEYWORDS.some((keyword) =>
    titleLower.includes(keyword)
  );
  
  // Verificar si es muy reciente (< 2 horas)
  const now = new Date();
  const hoursAgo = (now.getTime() - item.pubDate.getTime()) / (1000 * 60 * 60);
  const isRecent = hoursAgo < 2;
  
  return hasAlertKeyword || isRecent;
};

/**
 * Deriva items de alerta desde todas las categorías.
 */
const deriveAlerts = (feeds: Record<FeedCategory, FeedItem[]>): FeedItem[] => {
  const allItems: FeedItem[] = [];
  
  // Recopilar todos los items de todas las categorías
  Object.values(feeds).forEach((categoryItems) => {
    allItems.push(...categoryItems);
  });
  
  // Filtrar y marcar items como alerts
  const alerts = allItems
    .filter(isAlertItem)
    .map((item) => ({ ...item, isAlert: true }))
    // Ordenar por fecha (más recientes primero)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    // Limitar a los 20 más relevantes
    .slice(0, 20);
  
  return alerts;
};

const initialState: FeedStoreState = {
  feeds: {
    world: [],
    geopolitical: [],
    technology: [],
    ai: [],
    finance: [],
  },
  alerts: [],
  rssCountries: [],
  loading: false,
  errors: {
    world: null,
    geopolitical: null,
    technology: null,
    ai: null,
    finance: null,
  },
  lastFetch: null,
};

export const useFeedStore = create<FeedStore>((set, get) => ({
  ...initialState,

  fetchAllFeeds: async () => {
    // Evitar múltiples fetches simultáneos
    if (get().loading) {
      return;
    }

    set({ loading: true, errors: initialState.errors });

    try {
      const feeds = await fetchAllRssFeeds();
      const alerts = deriveAlerts(feeds);
      
      // Extraer países mencionados en todos los feeds
      const allFeedItems: FeedItem[] = [];
      Object.values(feeds).forEach((categoryItems) => {
        allFeedItems.push(...categoryItems);
      });
      const rssCountries = extractCountriesFromFeeds(allFeedItems);

      set({
        feeds,
        alerts,
        rssCountries,
        loading: false,
        lastFetch: new Date(),
        errors: initialState.errors,
      });
    } catch (error) {
      console.error('Error fetching feeds:', error);
      set({
        loading: false,
        errors: {
          world: 'Failed to fetch',
          geopolitical: 'Failed to fetch',
          technology: 'Failed to fetch',
          ai: 'Failed to fetch',
          finance: 'Failed to fetch',
        },
      });
    }
  },

  refreshFeed: async (category: FeedCategory) => {
    // Para refresh individual, por ahora recargamos todos
    // En el futuro se podría optimizar para solo una categoría
    await get().fetchAllFeeds();
  },

  clearCache: () => {
    // Limpiar cache del servicio RSS
    // Nota: el cache está en rssService.ts, pero podemos resetear el estado
    set(initialState);
  },
}));

