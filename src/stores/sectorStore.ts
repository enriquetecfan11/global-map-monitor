/**
 * Store de Zustand para gestión de scores de sectores.
 * Basado en docs/features/NewsDrivenSectorHeatmap.md
 * 
 * Lee feedStore, clasifica noticias y calcula scores narrativos por sector.
 * Se actualiza automáticamente cuando feedStore cambia.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Sector, SectorScore, SectorStoreState } from '../types/sector.types';
import { useFeedStore } from './feedStore';
import { classifyNewsItems } from '../utils/sectorClassifier';
import { calculateAllSectorScores } from '../utils/sectorScoringService';

interface SectorStore extends SectorStoreState {
  updateScores: () => void;
}

/**
 * Sectores en orden de visualización.
 */
const ALL_SECTORS: Sector[] = [
  'Technology',
  'Finance',
  'Healthcare',
  'Energy',
  'Consumer',
  'Industrial',
  'Materials',
  'Utilities',
];

/**
 * Crea un score inicial neutro para un sector.
 */
const createInitialScore = (sector: Sector): SectorScore => ({
  sector,
  score: 0,
  newsCount: 0,
  positiveCount: 0,
  negativeCount: 0,
  neutralCount: 0,
  topNews: [],
  lastUpdate: new Date(),
});

/**
 * Estado inicial del store.
 */
const initialState: SectorStoreState = {
  scores: ALL_SECTORS.reduce((acc, sector) => {
    acc[sector] = createInitialScore(sector);
    return acc;
  }, {} as Record<Sector, SectorScore>),
  loading: false,
  lastUpdate: null,
};

/**
 * Store de sectores.
 * Se suscribe automáticamente a cambios en feedStore.
 */
export const useSectorStore = create<SectorStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    /**
     * Actualiza los scores de todos los sectores basándose en los feeds actuales.
     */
    updateScores: () => {
      set({ loading: true });

      try {
        // Obtener todos los feeds del feedStore
        const feedStore = useFeedStore.getState();
        const allFeeds = feedStore.feeds;

        // Combinar todos los items de todas las categorías
        const allFeedItems: typeof feedStore.feeds.world = [];
        Object.values(allFeeds).forEach(categoryItems => {
          allFeedItems.push(...categoryItems);
        });

        // Si no hay noticias, mantener scores neutros
        if (allFeedItems.length === 0) {
          set({
            scores: initialState.scores,
            loading: false,
            lastUpdate: new Date(),
          });
          return;
        }

        // Clasificar todas las noticias
        const classifications = classifyNewsItems(allFeedItems);

        // Calcular scores para todos los sectores
        const scores = calculateAllSectorScores(classifications);

        set({
          scores,
          loading: false,
          lastUpdate: new Date(),
        });
      } catch (error) {
        console.error('Error updating sector scores:', error);
        set({
          loading: false,
          // Mantener scores anteriores en caso de error
        });
      }
    },
  }))
);

/**
 * Suscripción automática a cambios en feedStore.
 * Cuando feedStore se actualiza, recalcular scores de sectores.
 */
useFeedStore.subscribe(
  state => {
    // Cuando feeds cambian o lastFetch se actualiza, recalcular scores
    if (state.lastFetch !== null) {
      useSectorStore.getState().updateScores();
    }
  },
  state => ({ feeds: state.feeds, lastFetch: state.lastFetch })
);

/**
 * Inicializar scores al montar el store.
 * Si feedStore ya tiene datos, calcular scores inmediatamente.
 */
const feedStoreState = useFeedStore.getState();
if (feedStoreState.lastFetch !== null || Object.values(feedStoreState.feeds).some(items => items.length > 0)) {
  // Si ya hay datos, calcular scores
  useSectorStore.getState().updateScores();
}

