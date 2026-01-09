import React from 'react';
import { LoadingIndicator } from '../StatusIndicators';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Cargando datos...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 p-8 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <LoadingIndicator size="lg" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
};

