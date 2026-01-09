import React from 'react';

interface MarketItem {
  symbol: string;
  name: string;
  value: string;
  change: string;
  changePercent: string;
}

const placeholderMarkets: MarketItem[] = [
  { symbol: 'SPX', name: 'S&P 500', value: '4,567.89', change: '+12.34', changePercent: '+0.27%' },
  { symbol: 'DJI', name: 'Dow Jones', value: '34,567.12', change: '+89.45', changePercent: '+0.26%' },
  { symbol: 'IXIC', name: 'NASDAQ', value: '14,234.56', change: '+45.67', changePercent: '+0.32%' },
  { symbol: 'AAPL', name: 'Apple Inc.', value: '178.45', change: '+2.34', changePercent: '+1.33%' },
  { symbol: 'MSFT', name: 'Microsoft', value: '378.90', change: '+5.67', changePercent: '+1.52%' },
  { symbol: 'GOOGL', name: 'Alphabet', value: '142.56', change: '+1.23', changePercent: '+0.87%' },
  { symbol: 'BTC', name: 'Bitcoin', value: '43,567.89', change: '+234.56', changePercent: '+0.54%' },
  { symbol: 'ETH', name: 'Ethereum', value: '2,345.67', change: '+12.34', changePercent: '+0.53%' },
];

export const MarketsTable: React.FC = () => {
  const getChangeColor = (change: string) => {
    return change.startsWith('+') ? 'text-green-400' : 'text-red-400';
  };

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
            {placeholderMarkets.map((market, index) => (
              <tr
                key={market.symbol}
                className={`border-b border-gray-700 ${
                  index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'
                } hover:bg-gray-700 transition-colors`}
              >
                <td className="px-4 py-3 text-gray-100 font-medium">{market.symbol}</td>
                <td className="px-4 py-3 text-gray-300">{market.name}</td>
                <td className="px-4 py-3 text-right text-gray-100">{market.value}</td>
                <td className={`px-4 py-3 text-right font-medium ${getChangeColor(market.change)}`}>
                  {market.change}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${getChangeColor(market.changePercent)}`}>
                  {market.changePercent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

