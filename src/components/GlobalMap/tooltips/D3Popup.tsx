import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { TooltipPayload } from '../../../types/map.types';
import { CountrySituationPopup } from './CountrySituationPopup';
import { renderTooltip } from './tooltipBuilder';
import type { Feature } from 'geojson';

interface D3PopupProps {
  payload: TooltipPayload;
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  countryFeature?: Feature;
}

export const D3Popup: React.FC<D3PopupProps> = ({
  payload,
  x,
  y,
  visible,
  onClose,
  countryFeature,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ReturnType<typeof createRoot> | null>(null);

  useEffect(() => {
    if (popupRef.current && !root) {
      const reactRoot = createRoot(popupRef.current);
      setRoot(reactRoot);
    }
  }, [root]);

  useEffect(() => {
    if (popupRef.current && visible) {
      popupRef.current.style.left = `${x}px`;
      popupRef.current.style.top = `${y}px`;
      popupRef.current.style.transform = 'translate(-50%, -100%)';
    }
  }, [x, y, visible]);

  useEffect(() => {
    if (root && visible && countryFeature) {
      const countryName =
        countryFeature.properties?.name || countryFeature.properties?.NAME || 'Unknown Country';
      root.render(
        React.createElement(CountrySituationPopup, {
          countryName,
          countryFeature,
          contentOnly: true,
        })
      );
    } else if (root && visible && !countryFeature) {
      // Popup simple para otros elementos
      const tooltipHtml = renderTooltip(payload);
      root.render(
        <div
          className="custom-popup bg-gray-800 text-gray-100 p-4 rounded-lg shadow-xl border border-gray-700 max-w-md"
          dangerouslySetInnerHTML={{ __html: tooltipHtml }}
        />
      );
    }
  }, [root, visible, payload, countryFeature]);

  if (!visible) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[1999]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={popupRef}
        className="custom-popup absolute z-[2000] bg-gray-800 text-gray-100 rounded-lg shadow-xl border border-gray-700 max-w-md"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -100%)',
        }}
      />
    </>
  );
};

