import React from 'react';
import { useMap } from 'react-leaflet';

interface LeafletMapControlsProps {
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
}

export const LeafletMapControls: React.FC<LeafletMapControlsProps> = ({
  initialZoom,
  minZoom,
  maxZoom,
}) => {
  const map = useMap();
  const currentZoom = map.getZoom();

  const handleZoomIn = () => {
    if (currentZoom < maxZoom) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (currentZoom > minZoom) {
      map.zoomOut();
    }
  };

  const handleReset = () => {
    map.setZoom(initialZoom);
    map.setView([20, 0], initialZoom);
  };

  return (
    <div
      className="absolute top-4 left-4 z-[1000] bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg"
      role="group"
      aria-label="Map zoom controls"
    >
      <div className="flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="min-h-[44px] min-w-[44px] bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-100 rounded-md transition-colors flex items-center justify-center"
          aria-label="Zoom in"
          disabled={currentZoom >= maxZoom}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="min-h-[44px] min-w-[44px] bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-100 rounded-md transition-colors flex items-center justify-center"
          aria-label="Zoom out"
          disabled={currentZoom <= minZoom}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
        <button
          onClick={handleReset}
          className="min-h-[44px] min-w-[44px] bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-md transition-colors flex items-center justify-center"
          aria-label="Reset view"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
