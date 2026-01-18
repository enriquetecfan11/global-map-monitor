import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { createProjection, updateProjectionScale, scaleToZoomLevel, zoomLevelToScale } from '../../utils/d3MapUtils';
import type { MapProjection } from '../../utils/d3MapUtils';

interface D3MapProps {
  width: number;
  height: number;
  center?: [number, number];
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number) => void;
  children?: React.ReactNode;
}

export const D3Map: React.FC<D3MapProps> = ({
  width,
  height,
  center = [20, 0],
  initialZoom = 2,
  minZoom = 2,
  maxZoom = 4,
  onZoomChange,
  children,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);
  const [projectionState, setProjectionState] = useState<MapProjection | null>(null);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const baseScaleRef = useRef<number>(1);

  // Crear proyección inicial
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/16151a97-7214-463f-9d16-c6ece5f7560f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'D3Map.tsx:34',message:'Creating projection effect',data:{width,height,center},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (width > 0 && height > 0) {
      const { projection, path } = createProjection(width, height, center);
      baseScaleRef.current = projection.scale();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/16151a97-7214-463f-9d16-c6ece5f7560f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'D3Map.tsx:38',message:'Projection created successfully',data:{baseScale:baseScaleRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setProjectionState({ projection, path });
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/16151a97-7214-463f-9d16-c6ece5f7560f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'D3Map.tsx:42',message:'Projection NOT created - invalid dimensions',data:{width,height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
  }, [width, height, center]);

  // Configurar zoom de D3 (sin pan)
  useEffect(() => {
    if (!svgRef.current || !mapGroupRef.current || !projectionState) {
      return;
    }

    const svg = d3.select(svgRef.current);
    const mapGroup = d3.select(mapGroupRef.current);

    // Calcular escalas mínimas y máximas basadas en zoom levels
    const minScale = zoomLevelToScale(minZoom, baseScaleRef.current);
    const maxScale = zoomLevelToScale(maxZoom, baseScaleRef.current);
    const initialScale = zoomLevelToScale(initialZoom, baseScaleRef.current);
    
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([minScale / baseScaleRef.current, maxScale / baseScaleRef.current])
      .on('zoom', (event) => {
        const { transform } = event;
        const newScale = baseScaleRef.current * transform.k;
        
        // Actualizar proyección con nueva escala
        updateProjectionScale(projectionState.projection, width, height, newScale);
        
        // Aplicar transformación al grupo del mapa (solo escala, sin translate)
        mapGroup.attr('transform', `scale(${transform.k})`);
        
        // Calcular zoom level
        const zoomLevel = scaleToZoomLevel(newScale, baseScaleRef.current);
        setCurrentZoom(zoomLevel);
        onZoomChange?.(zoomLevel);
      });

    // Configurar zoom inicial
    const initialTransform = d3.zoomIdentity.scale(initialScale / baseScaleRef.current);
    svg.call(zoom.transform, initialTransform);

    // Aplicar zoom al SVG
    svg.call(zoom);

    // Deshabilitar pan: interceptar eventos de arrastre
    svg.on('mousedown.zoom', null);
    svg.on('touchstart.zoom', null);
    svg.on('touchmove.zoom', null);
    svg.on('touchend.zoom', null);

    return () => {
      svg.on('.zoom', null);
    };
  }, [svgRef, mapGroupRef, projectionState, width, height, initialZoom, minZoom, maxZoom, onZoomChange]);

  // Función para cambiar zoom programáticamente
  const setZoom = useCallback(
    (zoomLevel: number) => {
      if (!svgRef.current || !mapGroupRef.current || !projectionState) {
        return;
      }

      const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel));
      const newScale = zoomLevelToScale(clampedZoom, baseScaleRef.current);
      const scaleRatio = newScale / baseScaleRef.current;

      updateProjectionScale(projectionState.projection, width, height, newScale);

      const svg = d3.select(svgRef.current);
      const mapGroup = d3.select(mapGroupRef.current);
      mapGroup.attr('transform', `scale(${scaleRatio})`);

      // Actualizar el estado del zoom de D3
      const zoom = d3.zoom<SVGSVGElement, unknown>();
      const transform = d3.zoomIdentity.scale(scaleRatio);
      svg.call(zoom.transform, transform);

      setCurrentZoom(clampedZoom);
      onZoomChange?.(clampedZoom);
    },
    [projectionState, width, height, minZoom, maxZoom, onZoomChange]
  );

  // Exponer setZoom a través de ref para acceso externo
  const setZoomRef = useRef<((zoom: number) => void) | null>(null);
  setZoomRef.current = setZoom;

  useEffect(() => {
    if (svgRef.current) {
      (svgRef.current as any).__d3MapSetZoom = setZoom;
    }
  }, [setZoom]);

  if (!projectionState) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/16151a97-7214-463f-9d16-c6ece5f7560f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'D3Map.tsx:131',message:'No projection state - showing loading',data:{width,height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <div className="text-gray-400">Cargando mapa...</div>
      </div>
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/16151a97-7214-463f-9d16-c6ece5f7560f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'D3Map.tsx:139',message:'Rendering SVG',data:{width,height,hasProjection:!!projectionState,childrenCount:React.Children.count(children)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  return (
    <div className="relative w-full h-full bg-gray-800">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ cursor: 'default', backgroundColor: '#1F2937' }}
      >
        <g ref={mapGroupRef}>
          {projectionState &&
            React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                // #region agent log
                const childTypeName = typeof child.type === 'function' ? (child.type as any).name || 'function' : String(child.type);
                fetch('http://127.0.0.1:7242/ingest/16151a97-7214-463f-9d16-c6ece5f7560f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'D3Map.tsx:152',message:'Cloning child with projection',data:{childType:childTypeName,hasProjection:!!projectionState.projection,hasPath:!!projectionState.path,childProps:Object.keys(child.props||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                return React.cloneElement(child as React.ReactElement<any>, {
                  projection: projectionState.projection,
                  path: projectionState.path,
                  currentZoom,
                  setZoom,
                });
              }
              return child;
            })}
        </g>
      </svg>
    </div>
  );
};

// Hook para acceder a la función setZoom desde componentes hijos
export const useD3MapZoom = (): ((zoom: number) => void) | null => {
  const [setZoom, setSetZoom] = useState<((zoom: number) => void) | null>(null);

  useEffect(() => {
    const svg = document.querySelector('svg[class*="w-full"]');
    if (svg && (svg as any).__d3MapSetZoom) {
      setSetZoom(() => (svg as any).__d3MapSetZoom);
    }
  }, []);

  return setZoom;
};

