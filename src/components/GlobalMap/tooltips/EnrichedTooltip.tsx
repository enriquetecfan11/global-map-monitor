import React, { useState } from 'react';
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

  return (
    <Tooltip permanent={false} direction="top" className="custom-tooltip">
      <div dangerouslySetInnerHTML={{ __html: tooltipHtml }} />
    </Tooltip>
  );
};

