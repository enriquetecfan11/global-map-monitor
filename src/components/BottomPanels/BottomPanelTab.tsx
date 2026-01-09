import React from 'react';

interface BottomPanelTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: string;
}

export const BottomPanelTab: React.FC<BottomPanelTabProps> = ({
  label,
  isActive,
  onClick,
  icon,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]
        border-b-2 border-transparent
        ${
          isActive
            ? 'text-gray-100 border-blue-500 bg-gray-800/50'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
        }
      `}
      aria-label={`${label} tab`}
      aria-selected={isActive}
      role="tab"
    >
      <div className="flex items-center gap-2">
        {icon && <span aria-hidden="true">{icon}</span>}
        <span>{label}</span>
      </div>
    </button>
  );
};

