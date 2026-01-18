import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-leaflet';
import type { TooltipPayload } from '../../../types/map.types';
import { renderTooltip, buildContextLines } from './tooltipBuilder';
import { getLocalTimeFromLongitude } from '../../../utils/geoUtils';

interface EnrichedTooltipProps {
  baseContent: TooltipPayload;
  lat: number;
  lon: number;
}

export const EnrichedTooltip: React.FC<EnrichedTooltipProps> = ({
  baseContent,
  lat,
  lon,
}) => {
  const [localTime] = useState(() => getLocalTimeFromLongitude(lon));

  // Construir contenido completo del tooltip
  const contextLines = buildContextLines(localTime);
  const enrichedContent: TooltipPayload = {
    ...baseContent,
    lines: [...baseContent.lines, ...contextLines],
  };

  const tooltipHtml = renderTooltip(enrichedContent);

  // Aplicar estilos oscuros directamente al tooltip de Leaflet cuando se crea
  useEffect(() => {
    const applyDarkTheme = () => {
      const tooltips = document.querySelectorAll('.leaflet-tooltip');
      tooltips.forEach((tooltip) => {
        const tooltipEl = tooltip as HTMLElement;
        tooltipEl.style.backgroundColor = 'rgb(31, 41, 55)'; // gray-800
        tooltipEl.style.color = 'rgb(243, 244, 246)'; // gray-100
        tooltipEl.style.border = '1px solid rgb(55, 65, 81)'; // gray-700
        tooltipEl.style.borderRadius = '0.375rem';
      });
    };

    // Usar MutationObserver para detectar cuando se crea el tooltip
    const observer = new MutationObserver(() => {
      applyDarkTheme();
    });

    // Observar cambios en el body para detectar cuando Leaflet añade el tooltip
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
    <Tooltip permanent={false} direction="top" className="custom-tooltip">
      <div dangerouslySetInnerHTML={{ __html: tooltipHtml }} />
    </Tooltip>
  );
};

