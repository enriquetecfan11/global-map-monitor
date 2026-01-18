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
import militaryBasesData from '../../../data/military-bases.json';

interface D3MilitaryBasesLayerProps {
  enabled: boolean;
  zIndex: number;
  projection?: GeoProjection;
}

export const D3MilitaryBasesLayer: React.FC<D3MilitaryBasesLayerProps> = React.memo(
  ({ enabled, zIndex: _zIndex, projection }) => {
    const [hoveredBase, setHoveredBase] = useState<StrategicInfrastructureData | null>(null);
    const [clickedBase, setClickedBase] = useState<StrategicInfrastructureData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([0, 0]);
    const basesGroupRef = useRef<SVGGElement>(null);
    const bases = useMemo(() => militaryBasesData as StrategicInfrastructureData[], []);

    useEffect(() => {
      if (!enabled || !basesGroupRef.current || !projection) {
        return;
      }

      const group = d3.select(basesGroupRef.current);
      group.selectAll('*').remove();

      bases.forEach((base, index) => {
        const [x, y] = latLonToXY(projection, base.lat, base.lon);

        const circle = group
          .append('circle')
          .attr('class', `military-base-${index}`)
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 11)
          .attr('fill', '#8B5CF6') // violet-500
          .attr('fill-opacity', 0.8)
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseover', function (event) {
            setHoveredBase(base);
            const [tx, ty] = d3.pointer(event);
            setTooltipPosition([tx, ty]);
          })
          .on('mouseout', function () {
            setHoveredBase(null);
          })
          .on('click', function (event) {
            setClickedBase(base);
            const [tx, ty] = d3.pointer(event);
            setTooltipPosition([tx, ty]);
          });
      });

      return () => {
        group.selectAll('*').remove();
      };
    }, [enabled, bases, projection]);

    const tooltipPayload = useMemo(() => {
      if (!hoveredBase) return null;
      const base = buildTooltipForStrategicInfra(hoveredBase, 'Military Base');
      const localTime = getLocalTimeFromLongitude(hoveredBase.lon);
      const contextLines = buildContextLines(localTime);
      return {
        ...base,
        lines: [...base.lines, ...contextLines],
      };
    }, [hoveredBase]);

    const popupPayload = useMemo(() => {
      if (!clickedBase) return null;
      const base = buildTooltipForStrategicInfra(clickedBase, 'Military Base');
      const localTime = getLocalTimeFromLongitude(clickedBase.lon);
      const contextLines = buildContextLines(localTime);
      return {
        ...base,
        lines: [...base.lines, ...contextLines],
      };
    }, [clickedBase]);

    if (!enabled) {
      return null;
    }

    return (
      <>
        <g ref={basesGroupRef} className="military-bases-layer" />
        {tooltipPayload && (
          <D3Tooltip
            payload={tooltipPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!hoveredBase}
          />
        )}
        {popupPayload && clickedBase && (
          <D3Popup
            payload={popupPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!clickedBase}
            onClose={() => setClickedBase(null)}
          />
        )}
      </>
    );
  }
);

D3MilitaryBasesLayer.displayName = 'D3MilitaryBasesLayer';

