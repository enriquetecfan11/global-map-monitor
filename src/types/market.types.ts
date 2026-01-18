/**
 * Tipos para el sistema de mercados financieros
 * Basado en docs/features/FinanceApis.md
 */

export interface MarketItem {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface MarketStoreState {
  items: MarketItem[];
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}
