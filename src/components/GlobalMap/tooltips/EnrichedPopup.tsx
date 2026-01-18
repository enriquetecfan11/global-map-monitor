import React, { useState } from 'react';
import { Popup } from 'react-leaflet';
import type { TooltipPayload } from '../../../types/map.types';
import { renderTooltip, buildContextLines } from './tooltipBuilder';
import { getLocalTimeFromLongitude } from '../../../utils/geoUtils';

interface EnrichedPopupProps {
  baseContent: TooltipPayload;
  lat: number;
  lon: number;
}

export const EnrichedPopup: React.FC<EnrichedPopupProps> = ({
  baseContent,
  lat,
  lon,
}) => {
  const [localTime] = useState(() => getLocalTimeFromLongitude(lon));

  // Construir contenido completo del popup
  const contextLines = buildContextLines(localTime);
  const enrichedContent: TooltipPayload = {
    ...baseContent,
    lines: [...baseContent.lines, ...contextLines],
  };

  const popupHtml = renderTooltip(enrichedContent);

  return (
    <Popup className="custom-popup" maxWidth={400} closeButton={true}>
      <div dangerouslySetInnerHTML={{ __html: popupHtml }} />
    </Popup>
  );
};

