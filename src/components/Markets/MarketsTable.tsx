import React, { useEffect } from 'react';
import { useMarketStore } from '../../stores/marketStore';
import type { MarketItem } from '../../types/market.types';

/**
 * Formatea un número como precio con separadores de miles
 */
const formatPrice = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Formatea un cambio con signo + o -
 */
const formatChange = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
};

/**
 * Formatea un cambio porcentual con signo + o -
 */
const formatChangePercent = (changePercent: number): string => {
  const sign = changePercent >= 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(2)}%`;
};

export const MarketsTable: React.FC = () => {
  const { items, loading, error, fetchMarkets } = useMarketStore();

  useEffect(() => {
    // Cargar datos al montar el componente
    if (items.length === 0 && !loading) {
      fetchMarkets();
    }
  }, [items.length, loading, fetchMarkets]);

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  // Mostrar estado de carga
  if (loading && items.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden p-8">
        <div className="text-center text-gray-400">Loading market data...</div>
      </div>
    );
  }

  // Mostrar error si hay y no hay datos
  if (error && items.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden p-8">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (items.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden p-8">
        <div className="text-center text-gray-400">No market data available</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-gray-300 font-medium">Symbol</th>
              <th className="px-4 py-3 text-left text-gray-300 font-medium">Name</th>
              <th className="px-4 py-3 text-right text-gray-300 font-medium">Value</th>
              <th className="px-4 py-3 text-right text-gray-300 font-medium">Change</th>
              <th className="px-4 py-3 text-right text-gray-300 font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {items.map((market, index) => (
              <tr
                key={market.symbol}
                className={`border-b border-gray-700 ${
                  index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'
                } hover:bg-gray-700 transition-colors`}
              >
                <td className="px-4 py-3 text-gray-100 font-medium">{market.symbol}</td>
                <td className="px-4 py-3 text-gray-300">{market.name}</td>
                <td className="px-4 py-3 text-right text-gray-100">{formatPrice(market.value)}</td>
                <td className={`px-4 py-3 text-right font-medium ${getChangeColor(market.change)}`}>
                  {formatChange(market.change)}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${getChangeColor(market.changePercent)}`}>
                  {formatChangePercent(market.changePercent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

