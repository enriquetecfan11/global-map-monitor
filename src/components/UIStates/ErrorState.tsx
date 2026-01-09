import React from 'react';

interface ErrorStateProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Ha ocurrido un error',
  actionLabel = 'Reintentar',
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 p-8 text-center ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="text-red-500 text-4xl" aria-hidden="true">
        ⚠️
      </div>
      <p className="text-red-400 text-base font-medium">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors min-h-[44px] min-w-[44px]"
          aria-label={actionLabel}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

