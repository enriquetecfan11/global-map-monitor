import React, { useEffect, useState, useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { GeoJSON as GeoJSONType, Feature } from 'geojson';
import { buildTooltipForCountry, renderTooltip } from '../tooltips/tooltipBuilder';
import { CountrySituationPopup } from '../tooltips/CountrySituationPopup';
import { createRoot } from 'react-dom/client';

interface CountriesLayerProps {
  enabled: boolean;
  zIndex: number;
}

export const CountriesLayer: React.FC<CountriesLayerProps> = React.memo(
  ({ enabled, zIndex: _zIndex }) => {
    const [geoData, setGeoData] = useState<GeoJSONType | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchGeoData = async () => {
        try {
          // Intentar cargar desde fuente remota pública
          const response = await fetch(
            'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
          );
          if (!response.ok) {
            throw new Error('Failed to fetch GeoJSON');
          }
          const data = await response.json();
          setGeoData(data);
          setError(null);
        } catch (err) {
          console.warn('Failed to load countries GeoJSON from remote source:', err);
          setError('Could not load countries data');
          // En producción, aquí se podría intentar cargar un archivo local como fallback
        }
      };

      if (enabled) {
        fetchGeoData();
      }
    }, [enabled]);

    const style = useMemo(
      () => (_feature?: Feature) => {
        return {
          fillColor: '#1F2937', // gray-800
          fillOpacity: 0.3,
          color: '#4B5563', // gray-600
          weight: 0.5,
          opacity: 0.8,
        };
      },
      []
    );

    const onEachFeature = useMemo(
      () => (feature: Feature, layer: L.Layer) => {
        const tooltipPayload = buildTooltipForCountry(feature);
        const tooltipContent = renderTooltip(tooltipPayload);
        const countryName = feature.properties?.name || feature.properties?.NAME || 'Unknown Country';

        // Tooltip para hover (solo hover, no click)
        layer.bindTooltip(tooltipContent, {
          permanent: false,
          direction: 'top',
          className: 'custom-tooltip',
          interactive: false,
        });

        // Popup para click - crear dinámicamente cuando se hace click
        layer.bindPopup(() => {
          const popupContainer = document.createElement('div');
          const reactRoot = createRoot(popupContainer);
          
          // Renderizar componente React en el contenedor
          reactRoot.render(
            React.createElement(CountrySituationPopup, {
              countryName,
              countryFeature: feature,
              contentOnly: true,
            })
          );
          
          return popupContainer;
        }, {
          className: 'custom-popup',
          maxWidth: 400,
          closeButton: true,
        });

        // Highlight on hover
        layer.on({
          mouseover: (e) => {
            const layer = e.target;
            layer.setStyle({
              color: '#6B7280', // gray-500
              weight: 1.5,
              opacity: 1,
            });
          },
          mouseout: (e) => {
            const layer = e.target;
            layer.setStyle({
              color: '#4B5563', // gray-600
              weight: 0.5,
              opacity: 0.8,
            });
          },
        });
      },
      []
    );

    if (!enabled || error) {
      return null;
    }

    if (!geoData) {
      return null; // Silently wait for data to load
    }

    return (
      <GeoJSON
        data={geoData}
        style={style}
        onEachFeature={onEachFeature}
      />
    );
  }
);

CountriesLayer.displayName = 'CountriesLayer';

