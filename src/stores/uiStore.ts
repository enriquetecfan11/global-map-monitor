import { create } from 'zustand';
import type { UIStore } from '../types/ui.types';

const MIN_PANEL_WIDTH = 200;
const MAX_PANEL_WIDTH = 500;
const DEFAULT_PANEL_WIDTH = 300;

export const useUIStore = create<UIStore>((set, get) => ({
  // Panel state
  collapsed: false,
  width: DEFAULT_PANEL_WIDTH,

  // UI state
  loading: false,
  error: null,
  empty: false,
  systemState: 'idle' as const,
  maxZIndex: 1000,

  // Mentions panel state
  mentionsPanel: {
    isOpen: false,
    countryName: null,
    mentionCount: 0,
  },

  // Actions
  togglePanel: () => set((state) => ({ collapsed: !state.collapsed })),
  
  setPanelWidth: (width: number) =>
    set({
      width: Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, width)),
    }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),

  setEmpty: (empty: boolean) => set({ empty }),

  setSystemState: (systemState) => set({ systemState }),

  incrementZIndex: () => {
    const newZIndex = get().maxZIndex + 1;
    set({ maxZIndex: newZIndex });
    return newZIndex;
  },

  openMentionsPanel: (countryName: string, mentionCount: number) =>
    set({
      mentionsPanel: {
        isOpen: true,
        countryName,
        mentionCount,
      },
    }),

  closeMentionsPanel: () =>
    set({
      mentionsPanel: {
        isOpen: false,
        countryName: null,
        mentionCount: 0,
      },
    }),
}));

