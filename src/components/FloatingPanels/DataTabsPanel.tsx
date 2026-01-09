import React, { useState, useEffect } from 'react';
import { FloatingPanel } from '../FloatingPanel';
import { BottomPanelContent } from '../BottomPanels/BottomPanelContent';

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

export const DataTabsPanel: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelType>('world');
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 });

  const activePanelConfig = PANELS.find((p) => p.id === activePanel) || PANELS[0];

  useEffect(() => {
    // Calcular posición inicial (centro inferior) después del mount
    const initialX = Math.max(16, (window.innerWidth - 600) / 2);
    const initialY = window.innerHeight - 280;
    setPosition({ x: initialX, y: initialY });
  }, []);

  return (
    <FloatingPanel
      id="data-tabs-panel"
      initialPosition={position}
      className="flex flex-col w-[600px] max-w-[90vw]"
      headerContent={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center overflow-x-auto scrollbar-thin" role="tablist">
            {PANELS.map((panel) => (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]
                  border-b-2 border-transparent
                  ${
                    activePanel === panel.id
                      ? 'text-gray-100 border-blue-500 bg-gray-800/50'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                  }
                `}
                aria-label={`${panel.label} tab`}
                aria-selected={activePanel === panel.id}
                role="tab"
              >
                <div className="flex items-center gap-2">
                  {panel.icon && <span aria-hidden="true">{panel.icon}</span>}
                  <span>{panel.label}</span>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            }}
            className="px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 ml-2"
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
      }
    >
      {!collapsed && (
        <div className="flex-1 overflow-hidden" style={{ maxHeight: '256px' }}>
          <BottomPanelContent
            panelId={activePanelConfig.id}
            label={activePanelConfig.label}
          />
        </div>
      )}
    </FloatingPanel>
  );
};

