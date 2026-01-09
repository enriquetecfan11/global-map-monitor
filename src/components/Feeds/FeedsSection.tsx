import React from 'react';

interface FeedItem {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  preview: string;
}

const placeholderFeeds: FeedItem[] = [
  {
    id: '1',
    title: 'Global Economic Summit Updates',
    category: 'World/Geopolitical',
    timestamp: '2 hours ago',
    preview: 'Leaders from major economies discuss trade agreements...',
  },
  {
    id: '2',
    title: 'Regional Security Developments',
    category: 'World/Geopolitical',
    timestamp: '4 hours ago',
    preview: 'New diplomatic initiatives in the Middle East region...',
  },
  {
    id: '3',
    title: 'AI Model Performance Breakthrough',
    category: 'Technology/AI',
    timestamp: '1 hour ago',
    preview: 'Latest language model achieves new benchmarks...',
  },
  {
    id: '4',
    title: 'Quantum Computing Milestone',
    category: 'Technology/AI',
    timestamp: '6 hours ago',
    preview: 'Researchers demonstrate stable quantum operations...',
  },
  {
    id: '5',
    title: 'Market Volatility Analysis',
    category: 'Finance',
    timestamp: '3 hours ago',
    preview: 'Currency fluctuations impact global markets...',
  },
  {
    id: '6',
    title: 'Cryptocurrency Regulatory News',
    category: 'Finance',
    timestamp: '5 hours ago',
    preview: 'New regulations proposed for digital assets...',
  },
  {
    id: '7',
    title: 'Critical System Alert',
    category: 'Alerts',
    timestamp: '30 minutes ago',
    preview: 'High-priority monitoring event detected...',
  },
  {
    id: '8',
    title: 'Data Anomaly Detected',
    category: 'Alerts',
    timestamp: '1 hour ago',
    preview: 'Unusual pattern identified in monitoring feed...',
  },
];

const categoryGroups = [
  'World/Geopolitical',
  'Technology/AI',
  'Finance',
  'Alerts',
] as const;

export const FeedsSection: React.FC = () => {
  const feedsByCategory = categoryGroups.map((category) => ({
    category,
    feeds: placeholderFeeds.filter((feed) => feed.category === category),
  }));

  return (
    <section
      className="w-full border-b border-gray-700 bg-gray-900 py-6 px-6"
      aria-label="Feeds Section"
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Feeds</h2>
      
      <div className="space-y-8">
        {feedsByCategory.map(({ category, feeds }) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feeds.map((feed) => (
                <div
                  key={feed.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-100 line-clamp-2">
                      {feed.title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                    {feed.preview}
                  </p>
                  <div className="text-xs text-gray-500">{feed.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

