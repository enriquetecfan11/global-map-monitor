export type SystemState = 'idle' | 'monitoring' | 'loading' | 'error';

export interface UIState {
  loading: boolean;
  error: string | null;
  empty: boolean;
  systemState: SystemState;
}

export interface PanelState {
  collapsed: boolean;
  width: number;
}

export interface MentionsPanelState {
  isOpen: boolean;
  countryName: string | null;
  mentionCount: number;
}

export interface UIStore extends UIState, PanelState {
  maxZIndex: number;
  mentionsPanel: MentionsPanelState;
  togglePanel: () => void;
  setPanelWidth: (width: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEmpty: (empty: boolean) => void;
  setSystemState: (state: SystemState) => void;
  incrementZIndex: () => number;
  openMentionsPanel: (countryName: string, mentionCount: number) => void;
  closeMentionsPanel: () => void;
}

