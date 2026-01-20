import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { GeoProjection } from 'd3-geo';
import type { StrategicInfrastructureData } from '../../../types/map.types';
import { buildTooltipForStrategicInfra } from '../tooltips/tooltipBuilder';
import { D3Tooltip } from '../tooltips/D3Tooltip';
import { D3Popup } from '../tooltips/D3Popup';
import { latLonToXY } from '../../../utils/d3MapUtils';
import { buildContextLines } from '../tooltips/tooltipBuilder';
import { getLocalTimeFromLongitude } from '../../../utils/geoUtils';
import cableLandingsData from '../../../data/cable-landings.json';

interface D3CableLandingsLayerProps {
  enabled: boolean;
  zIndex: number;
  projection?: GeoProjection;
}

export const D3CableLandingsLayer: React.FC<D3CableLandingsLayerProps> = React.memo(
  ({ enabled, zIndex: _zIndex, projection }) => {
    const [hoveredCable, setHoveredCable] = useState<StrategicInfrastructureData | null>(null);
    const [clickedCable, setClickedCable] = useState<StrategicInfrastructureData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([0, 0]);
    const cablesGroupRef = useRef<SVGGElement>(null);
    const cables = useMemo(() => cableLandingsData as StrategicInfrastructureData[], []);

    useEffect(() => {
      if (!enabled || !cablesGroupRef.current || !projection) {
        return;
      }

      const group = d3.select(cablesGroupRef.current);
      group.selectAll('*').remove();

      cables.forEach((cable, index) => {
        const [x, y] = latLonToXY(projection, cable.lat, cable.lon);

        group
          .append('circle')
          .attr('class', `cable-${index}`)
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 10)
          .attr('fill', '#3B82F6') // blue-500
          .attr('fill-opacity', 0.8)
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseover', function (event: MouseEvent) {
            setHoveredCable(cable);
            const [tx, ty] = d3.pointer(event);
            setTooltipPosition([tx, ty]);
          })
          .on('mouseout', function () {
            setHoveredCable(null);
          })
          .on('click', function (event: MouseEvent) {
            setClickedCable(cable);
            const [tx, ty] = d3.pointer(event);
            setTooltipPosition([tx, ty]);
          });
      });

      return () => {
        group.selectAll('*').remove();
      };
    }, [enabled, cables, projection]);

    const tooltipPayload = useMemo(() => {
      if (!hoveredCable) return null;
      const base = buildTooltipForStrategicInfra(hoveredCable, 'Cable Landing');
      const localTime = getLocalTimeFromLongitude(hoveredCable.lon);
      const contextLines = buildContextLines(localTime);
      return {
        ...base,
        lines: [...base.lines, ...contextLines],
      };
    }, [hoveredCable]);

    const popupPayload = useMemo(() => {
      if (!clickedCable) return null;
      const base = buildTooltipForStrategicInfra(clickedCable, 'Cable Landing');
      const localTime = getLocalTimeFromLongitude(clickedCable.lon);
      const contextLines = buildContextLines(localTime);
      return {
        ...base,
        lines: [...base.lines, ...contextLines],
      };
    }, [clickedCable]);

    if (!enabled) {
      return null;
    }

    return (
      <>
        <g ref={cablesGroupRef} className="cables-layer" />
        {tooltipPayload && (
          <D3Tooltip
            payload={tooltipPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!hoveredCable}
          />
        )}
        {popupPayload && clickedCable && (
          <D3Popup
            payload={popupPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!clickedCable}
            onClose={() => setClickedCable(null)}
          />
        )}
      </>
    );
  }
);

D3CableLandingsLayer.displayName = 'D3CableLandingsLayer';

