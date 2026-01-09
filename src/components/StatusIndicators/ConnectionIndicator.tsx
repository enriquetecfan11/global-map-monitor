import React from 'react';

interface ConnectionIndicatorProps {
  isOnline?: boolean;
  className?: string;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  isOnline = true,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'Conectado' : 'Desconectado'}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}
        aria-hidden="true"
      />
      <span className="text-sm text-gray-400 sr-only">
        {isOnline ? 'Conectado' : 'Desconectado'}
      </span>
    </div>
  );
};

