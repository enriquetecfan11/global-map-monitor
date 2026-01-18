import React from 'react';

interface LegendItemProps {
  symbol: React.ReactNode;
  label: string;
  description: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ symbol, label, description }) => {
  return (
    <div className="flex items-start gap-2 py-1">
      <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
        {symbol}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-200">{label}</div>
        <div className="text-xs text-gray-400 leading-tight">{description}</div>
      </div>
    </div>
  );
};

interface LegendSectionProps {
  title: string;
  children: React.ReactNode;
}

const LegendSection: React.FC<LegendSectionProps> = ({ title, children }) => {
  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5">
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
};

export const MapLegend: React.FC = () => {
  return (
    <div
      className="h-full bg-gray-800/95 backdrop-blur-sm border-r border-gray-700 p-3 flex flex-col"
      role="region"
      aria-label="Map legend"
    >
      <h2 className="text-xs font-semibold text-gray-200 uppercase tracking-wide mb-3 pb-2 border-b border-gray-700 flex-shrink-0">
        Map Legend
      </h2>

      <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin">
        {/* Hotspots */}
        <LegendSection title="Hotspots">
          <LegendItem
            symbol={
              <div
                className="rounded-full border-2 border-white"
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#EF4444',
                  opacity: 0.8,
                }}
              />
            }
            label="High Threat"
            description="Critical geopolitical hotspot"
          />
          <LegendItem
            symbol={
              <div
                className="rounded-full border-2 border-white"
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#F59E0B',
                  opacity: 0.8,
                }}
              />
            }
            label="Elevated"
            description="Moderate risk area"
          />
          <LegendItem
            symbol={
              <div
                className="rounded-full border-2 border-white"
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10B981',
                  opacity: 0.8,
                }}
              />
            }
            label="Low Threat"
            description="Monitored region"
          />
        </LegendSection>

        {/* Conflict Zones */}
        <LegendSection title="Conflict Zones">
          <LegendItem
            symbol={
              <div
                className="border"
                style={{
                  width: '16px',
                  height: '12px',
                  backgroundColor: '#DC2626',
                  opacity: 0.2,
                  borderColor: '#991B1B',
                  borderWidth: '1.5px',
                }}
              />
            }
            label="Active Conflict"
            description="Ongoing conflict region"
          />
        </LegendSection>

        {/* Infrastructure */}
        <LegendSection title="Infrastructure">
          <LegendItem
            symbol={
              <div
                className="rounded-full border-2 border-white"
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#3B82F6',
                  opacity: 0.8,
                }}
              />
            }
            label="Cable Landings"
            description="Submarine cable hubs"
          />
          <LegendItem
            symbol={
              <div
                className="rounded-full border-2 border-white"
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#F59E0B',
                  opacity: 0.8,
                }}
              />
            }
            label="Nuclear Sites"
            description="Nuclear facilities"
          />
          <LegendItem
            symbol={
              <div
                className="rounded-full border-2 border-white"
                style={{
                  width: '11px',
                  height: '11px',
                  backgroundColor: '#8B5CF6',
                  opacity: 0.8,
                }}
              />
            }
            label="Military Bases"
            description="Strategic military installations"
          />
        </LegendSection>

        {/* RSS / Countries */}
        <LegendSection title="RSS / Countries">
          <LegendItem
            symbol={
              <div className="flex items-center gap-1">
                <div
                  className="border-2 border-white"
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#10B981',
                    borderRadius: '2px',
                  }}
                />
                <div
                  className="border-2 border-white"
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#F59E0B',
                    borderRadius: '2px',
                  }}
                />
                <div
                  className="border-2 border-white"
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#F97316',
                    borderRadius: '2px',
                  }}
                />
                <div
                  className="border-2 border-white"
                  style={{
                    width: '14px',
                    height: '14px',
                    backgroundColor: '#EF4444',
                    borderRadius: '2px',
                  }}
                />
              </div>
            }
            label="News Activity"
            description="RSS mentions (1→6+)"
          />
        </LegendSection>
      </div>
    </div>
  );
};

