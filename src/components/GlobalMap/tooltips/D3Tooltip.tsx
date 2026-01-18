import React, { useEffect, useRef } from 'react';
import type { TooltipPayload } from '../../../types/map.types';
import { renderTooltip } from './tooltipBuilder';

interface D3TooltipProps {
  payload: TooltipPayload;
  x: number;
  y: number;
  visible: boolean;
}

export const D3Tooltip: React.FC<D3TooltipProps> = ({ payload, x, y, visible }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tooltipRef.current && visible) {
      tooltipRef.current.style.left = `${x}px`;
      tooltipRef.current.style.top = `${y - 10}px`;
      tooltipRef.current.style.transform = 'translate(-50%, -100%)';
    }
  }, [x, y, visible]);

  if (!visible) {
    return null;
  }

  const tooltipHtml = renderTooltip(payload);

  return (
    <div
      ref={tooltipRef}
      className="custom-tooltip absolute z-[2000] pointer-events-none bg-gray-800 text-gray-100 px-3 py-2 rounded-md shadow-lg border border-gray-700 text-sm max-w-xs"
      style={{
        left: `${x}px`,
        top: `${y - 10}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: tooltipHtml }} />
    </div>
  );
};

