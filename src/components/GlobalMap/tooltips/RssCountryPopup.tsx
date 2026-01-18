import React, { useEffect } from 'react';
import { Popup } from 'react-leaflet';
import type { RssCountryData } from '../../../types/feed.types';
import { getLocalTimeFromLongitude } from '../../../utils/geoUtils';
import { useUIStore } from '../../../stores/uiStore';

interface RssCountryPopupProps {
  country: RssCountryData;
  lat: number;
  lon: number;
}

/**
 * Popup personalizado para países RSS con botón "Ver menciones".
 */
export const RssCountryPopup: React.FC<RssCountryPopupProps> = ({
  country,
  lat,
  lon,
}) => {
  const { openMentionsPanel } = useUIStore();
  const localTime = getLocalTimeFromLongitude(lon);
  
  const mentionText = country.mentionCount === 1 
    ? '1 mention' 
    : `${country.mentionCount} mentions`;
  
  const latestDate = new Date(country.latestMention);
  const timeAgo = getTimeAgo(latestDate);

  const handleViewMentions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openMentionsPanel(country.name, country.mentionCount);
  };

  // Aplicar estilos oscuros directamente al popup de Leaflet cuando se crea
  useEffect(() => {
    const applyDarkTheme = () => {
      // Buscar el popup wrapper de Leaflet (puede haber múltiples, tomar el último)
      const popups = document.querySelectorAll('.leaflet-popup-content-wrapper');
      const popupWrapper = popups[popups.length - 1] as HTMLElement;
      const popupTip = document.querySelector('.leaflet-popup-tip') as HTMLElement;
      const closeButton = document.querySelector('.leaflet-popup-close-button') as HTMLElement;
      
      if (popupWrapper) {
        popupWrapper.style.backgroundColor = 'rgb(31, 41, 55)'; // gray-800
        popupWrapper.style.color = 'rgb(243, 244, 246)'; // gray-100
        popupWrapper.style.border = '1px solid rgb(55, 65, 81)'; // gray-700
        popupWrapper.style.borderRadius = '0.5rem';
      }
      
      if (popupTip) {
        popupTip.style.backgroundColor = 'rgb(31, 41, 55)'; // gray-800
        popupTip.style.border = '1px solid rgb(55, 65, 81)'; // gray-700
      }
      
      if (closeButton) {
        closeButton.style.color = 'rgb(156, 163, 175)'; // gray-400
        closeButton.style.opacity = '1';
      }
    };

    // Usar MutationObserver para detectar cuando se crea el popup
    const observer = new MutationObserver(() => {
      applyDarkTheme();
    });

    // Observar cambios en el body para detectar cuando Leaflet añade el popup
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Aplicar inmediatamente y con delays para asegurar que se aplique
    applyDarkTheme();
    const timers = [
      setTimeout(applyDarkTheme, 10),
      setTimeout(applyDarkTheme, 50),
      setTimeout(applyDarkTheme, 100),
      setTimeout(applyDarkTheme, 200),
    ];
    
    return () => {
      observer.disconnect();
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <Popup className="custom-popup" maxWidth={400} closeButton={true}>
      <div className="text-sm text-gray-100 min-w-[280px]">
        {/* Header */}
        <div className="mb-3 pb-3 border-b border-gray-700">
          <h3 className="text-base font-semibold text-white mb-2">{country.name}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>🕐</span>
            <span>{localTime}</span>
          </div>
        </div>

        {/* Menciones - clickeable */}
        {country.mentionCount > 0 ? (
          <div className="space-y-2">
            <button
              onClick={handleViewMentions}
              className="group w-full flex items-center justify-between p-2 -mx-2 -my-1 hover:bg-gray-700/50 rounded transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Menciones:</span>
                <span className="text-sm font-semibold text-blue-400 group-hover:text-blue-300">
                  {country.mentionCount}
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500 pl-2">
              <span>Última:</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            No hay menciones disponibles
          </div>
        )}
      </div>
    </Popup>
  );
};

/**
 * Calcula tiempo relativo desde una fecha (ej: "2h", "1d", "5m").
 */
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else {
    return `${diffDays}d`;
  }
};
