import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { GeoJSON as GeoJSONType, Feature } from 'geojson';
import type { GeoProjection, GeoPath } from 'd3-geo';
import { buildTooltipForCountry } from '../tooltips/tooltipBuilder';
import { D3Tooltip } from '../tooltips/D3Tooltip';
import { D3Popup } from '../tooltips/D3Popup';

interface D3CountriesLayerProps {
  enabled: boolean;
  zIndex: number;
  projection?: GeoProjection;
  path?: GeoPath<any, d3.GeoPermissibleObjects>;
}

export const D3CountriesLayer: React.FC<D3CountriesLayerProps> = React.memo(
  ({ enabled, zIndex: _zIndex, projection, path }) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/16151a97-7214-463f-9d16-c6ece5f7560f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'D3CountriesLayer.tsx:15',message:'D3CountriesLayer rendered',data:{enabled,hasProjection:!!projection,hasPath:!!path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const [geoData, setGeoData] = useState<GeoJSONType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hoveredFeature, setHoveredFeature] = useState<Feature | null>(null);
    const [clickedFeature, setClickedFeature] = useState<Feature | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([0, 0]);
    const countriesGroupRef = useRef<SVGGElement>(null);

    useEffect(() => {
      const fetchGeoData = async () => {
        try {
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
        }
      };

      if (enabled) {
        fetchGeoData();
      }
    }, [enabled]);

    // Renderizar países con D3
    useEffect(() => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/16151a97-7214-463f-9d16-c6ece5f7560f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'D3CountriesLayer.tsx:53',message:'Countries render effect',data:{enabled,hasGeoData:!!geoData,hasRef:!!countriesGroupRef.current,hasPath:!!path,hasProjection:!!projection},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      if (!enabled || !geoData || !path || !projection) {
        return;
      }

      // Usar un pequeño delay para asegurar que el ref esté disponible
      const timer = setTimeout(() => {
        if (!countriesGroupRef.current) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/16151a97-7214-463f-9d16-c6ece5f7560f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'D3CountriesLayer.tsx:61',message:'Ref still not available after delay',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          return;
        }

        const group = d3.select(countriesGroupRef.current);
        group.selectAll('*').remove();

        const features = (geoData.type === 'FeatureCollection' ? geoData.features : [geoData as Feature]) || [];

        const countries = group
          .selectAll('path.country')
          .data(features)
          .enter()
          .append('path')
          .attr('class', 'country')
          .attr('d', (d) => path(d as any))
          .attr('fill', '#374151') // gray-700 - más claro para que se vea
          .attr('fill-opacity', 0.5)
          .attr('stroke', '#6B7280') // gray-500 - más claro para que se vea
          .attr('stroke-width', 0.5)
          .attr('stroke-opacity', 1)
          .style('cursor', 'pointer')
          .on('mouseover', function (event, d) {
            const feature = d as Feature;
            setHoveredFeature(feature);
            
            // Calcular posición del tooltip
            const [x, y] = d3.pointer(event);
            setTooltipPosition([x, y]);
            
            // Highlight
            d3.select(this)
              .attr('stroke', '#9CA3AF') // gray-400
              .attr('stroke-width', 1.5)
              .attr('stroke-opacity', 1);
          })
          .on('mouseout', function () {
            setHoveredFeature(null);
            
            // Restaurar estilo
            d3.select(this)
              .attr('stroke', '#6B7280') // gray-500
              .attr('stroke-width', 0.5)
              .attr('stroke-opacity', 1);
          })
          .on('click', function (event, d) {
            const feature = d as Feature;
            setClickedFeature(feature);
            
            // Calcular posición del popup
            const [x, y] = d3.pointer(event);
            setTooltipPosition([x, y]);
          });
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/16151a97-7214-463f-9d16-c6ece5f7560f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'D3CountriesLayer.tsx:114',message:'Countries paths created',data:{featuresCount:features.length,pathsCreated:countries.size()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
      }, 0);

      return () => {
        clearTimeout(timer);
        if (countriesGroupRef.current) {
          const group = d3.select(countriesGroupRef.current);
          group.selectAll('*').remove();
        }
      };
    }, [enabled, geoData, path, projection]);

    const tooltipPayload = useMemo(() => {
      if (!hoveredFeature) return null;
      return buildTooltipForCountry(hoveredFeature);
    }, [hoveredFeature]);

    const popupPayload = useMemo(() => {
      if (!clickedFeature) return null;
      return buildTooltipForCountry(clickedFeature);
    }, [clickedFeature]);

    if (!enabled || error) {
      return null;
    }

    if (!geoData) {
      return null;
    }

    return (
      <>
        <g ref={countriesGroupRef} className="countries-layer" />
        {tooltipPayload && (
          <D3Tooltip
            payload={tooltipPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!hoveredFeature}
          />
        )}
        {popupPayload && clickedFeature && (
          <D3Popup
            payload={popupPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!clickedFeature}
            onClose={() => setClickedFeature(null)}
            countryFeature={clickedFeature}
          />
        )}
      </>
    );
  }
);

D3CountriesLayer.displayName = 'D3CountriesLayer';

