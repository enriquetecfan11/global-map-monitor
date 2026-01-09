import React from 'react';

interface EmptyStateProps {
  message?: string;
  suggestion?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No hay elementos para mostrar',
  suggestion,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 p-8 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="text-gray-500 text-4xl" aria-hidden="true">
        📭
      </div>
      <p className="text-gray-300 text-base font-medium">{message}</p>
      {suggestion && (
        <p className="text-gray-500 text-sm">{suggestion}</p>
      )}
    </div>
  );
};

