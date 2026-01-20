/**
 * Store de Zustand para gestión de datos de mercados financieros.
 * Basado en docs/features/FinanceApis.md
 */

import { create } from 'zustand';
import type { MarketStoreState } from '../types/market.types';
import { fetchMarketData } from '../utils/marketService';

interface MarketStore extends MarketStoreState {
  fetchMarkets: () => Promise<void>;
  clearCache: () => void;
}

const initialState: MarketStoreState = {
  items: [],
  loading: false,
  error: null,
  lastFetch: null,
};

export const useMarketStore = create<MarketStore>((set, get) => ({
  ...initialState,

  fetchMarkets: async () => {
    // Evitar múltiples fetches simultáneos
    if (get().loading) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const items = await fetchMarketData();

      set({
        items,
        loading: false,
        lastFetch: new Date(),
        error: null,
      });
    } catch (error) {
      console.error('Error fetching markets:', error);
      set({
        loading: false,
        error: 'Failed to fetch market data',
      });
    }
  },

  clearCache: () => {
    // Limpiar cache del servicio (está en marketService.ts)
    // Resetear el estado
    set(initialState);
  },
}));
