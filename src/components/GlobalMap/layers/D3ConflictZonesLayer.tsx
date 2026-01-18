import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { GeoProjection, GeoPath } from 'd3-geo';
import type { ConflictZoneData } from '../../../types/map.types';
import { buildTooltipForConflictZone } from '../tooltips/tooltipBuilder';
import { D3Tooltip } from '../tooltips/D3Tooltip';
import { latLonToXY } from '../../../utils/d3MapUtils';
import conflictZonesData from '../../../data/conflict-zones.json';

interface D3ConflictZonesLayerProps {
  enabled: boolean;
  zIndex: number;
  projection?: GeoProjection;
  path?: GeoPath<any, d3.GeoPermissibleObjects>;
}

export const D3ConflictZonesLayer: React.FC<D3ConflictZonesLayerProps> = React.memo(
  ({ enabled, zIndex: _zIndex, projection, path }) => {
    const [hoveredZone, setHoveredZone] = useState<ConflictZoneData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([0, 0]);
    const zonesGroupRef = useRef<SVGGElement>(null);
    const zones = useMemo(() => conflictZonesData as ConflictZoneData[], []);

    useEffect(() => {
      if (!enabled || !zonesGroupRef.current || !projection || !path) {
        return;
      }

      const group = d3.select(zonesGroupRef.current);
      group.selectAll('*').remove();

      zones.forEach((zone, index) => {
        // Crear polígono desde bounds
        const [[lat1, lon1], [lat2, lon2]] = zone.bounds;
        const polygon = {
          type: 'Polygon' as const,
          coordinates: [[
            [lon1, lat1],
            [lon2, lat1],
            [lon2, lat2],
            [lon1, lat2],
            [lon1, lat1],
          ]],
        };

        const rect = group
          .append('path')
          .attr('class', `conflict-zone-${index}`)
          .attr('d', path(polygon as any))
          .attr('fill', '#DC2626') // red-600
          .attr('fill-opacity', 0.2)
          .attr('stroke', '#991B1B') // red-800
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.8)
          .style('cursor', 'pointer')
          .on('mouseover', function (event) {
            setHoveredZone(zone);
            const [tx, ty] = d3.pointer(event);
            setTooltipPosition([tx, ty]);
          })
          .on('mouseout', function () {
            setHoveredZone(null);
          });
      });

      return () => {
        group.selectAll('*').remove();
      };
    }, [enabled, zones, projection, path]);

    const tooltipPayload = useMemo(() => {
      if (!hoveredZone) return null;
      return buildTooltipForConflictZone(hoveredZone);
    }, [hoveredZone]);

    if (!enabled) {
      return null;
    }

    return (
      <>
        <g ref={zonesGroupRef} className="conflict-zones-layer" />
        {tooltipPayload && (
          <D3Tooltip
            payload={tooltipPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!hoveredZone}
          />
        )}
      </>
    );
  }
);

D3ConflictZonesLayer.displayName = 'D3ConflictZonesLayer';

