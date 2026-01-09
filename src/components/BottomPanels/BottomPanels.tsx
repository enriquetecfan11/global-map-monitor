import React, { useState } from 'react';
import { BottomPanelTab } from './BottomPanelTab';
import { BottomPanelContent } from './BottomPanelContent';

export type PanelType = 'world' | 'tech' | 'finance' | 'alerts' | 'markets';

interface PanelConfig {
  id: PanelType;
  label: string;
  icon?: string;
}

const PANELS: PanelConfig[] = [
  { id: 'world', label: 'World', icon: '🌍' },
  { id: 'tech', label: 'Tech', icon: '💻' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'alerts', label: 'Alerts', icon: '🔔' },
  { id: 'markets', label: 'Markets', icon: '📊' },
];

export const BottomPanels: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelType>('world');
  const [collapsed, setCollapsed] = useState(false);

  const activePanelConfig = PANELS.find((p) => p.id === activePanel) || PANELS[0];

  return (
    <div
      className={`
        bg-gray-800 border-t border-gray-700 flex flex-col transition-all duration-300
        shadow-lg
        ${collapsed ? 'h-12' : 'h-64'}
      `}
      role="complementary"
      aria-label="Paneles inferiores de información"
    >
      {/* Tabs bar */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 shrink-0">
        <div className="flex items-center overflow-x-auto scrollbar-thin" role="tablist">
          {PANELS.map((panel) => (
            <BottomPanelTab
              key={panel.id}
              label={panel.label}
              icon={panel.icon}
              isActive={activePanel === panel.id}
              onClick={() => setActivePanel(panel.id)}
            />
          ))}
        </div>

        {/* Collapse/Expand button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          aria-label={collapsed ? 'Expandir paneles' : 'Colapsar paneles'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expandir paneles' : 'Colapsar paneles'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Content area */}
      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          <BottomPanelContent
            panelId={activePanelConfig.id}
            label={activePanelConfig.label}
          />
        </div>
      )}
    </div>
  );
};

