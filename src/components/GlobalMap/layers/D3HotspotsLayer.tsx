import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { GeoProjection } from 'd3-geo';
import type { HotspotData } from '../../../types/map.types';
import { buildTooltipForHotspot } from '../tooltips/tooltipBuilder';
import { D3Tooltip } from '../tooltips/D3Tooltip';
import { D3Popup } from '../tooltips/D3Popup';
import { latLonToXY } from '../../../utils/d3MapUtils';
import { buildContextLines } from '../tooltips/tooltipBuilder';
import { getLocalTimeFromLongitude } from '../../../utils/geoUtils';
import hotspotsData from '../../../data/hotspots.json';

interface D3HotspotsLayerProps {
  enabled: boolean;
  zIndex: number;
  projection?: GeoProjection;
}

const getColorForLevel = (level: HotspotData['level']): string => {
  switch (level) {
    case 'low':
      return '#10B981'; // green-500
    case 'elevated':
      return '#F59E0B'; // amber-500
    case 'high':
      return '#EF4444'; // red-500
    default:
      return '#6B7280'; // gray-500
  }
};

const getRadiusForLevel = (level: HotspotData['level']): number => {
  switch (level) {
    case 'low':
      return 8;
    case 'elevated':
      return 12;
    case 'high':
      return 16;
    default:
      return 10;
  }
};

export const D3HotspotsLayer: React.FC<D3HotspotsLayerProps> = React.memo(
  ({ enabled, zIndex: _zIndex, projection }) => {
    const [hoveredHotspot, setHoveredHotspot] = useState<HotspotData | null>(null);
    const [clickedHotspot, setClickedHotspot] = useState<HotspotData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([0, 0]);
    const hotspotsGroupRef = useRef<SVGGElement>(null);
    const hotspots = useMemo(() => hotspotsData as HotspotData[], []);

    useEffect(() => {
      if (!enabled || !hotspotsGroupRef.current || !projection) {
        return;
      }

      const group = d3.select(hotspotsGroupRef.current);
      group.selectAll('*').remove();

      hotspots.forEach((hotspot, index) => {
        const [x, y] = latLonToXY(projection, hotspot.lat, hotspot.lon);
        const color = getColorForLevel(hotspot.level);
        const radius = getRadiusForLevel(hotspot.level);

        const circle = group
          .append('circle')
          .attr('class', `hotspot-${index}`)
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', radius)
          .attr('fill', color)
          .attr('fill-opacity', 0.8)
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseover', function (event) {
            setHoveredHotspot(hotspot);
            const [tx, ty] = d3.pointer(event);
            setTooltipPosition([tx, ty]);
          })
          .on('mouseout', function () {
            setHoveredHotspot(null);
          })
          .on('click', function (event) {
            setClickedHotspot(hotspot);
            const [tx, ty] = d3.pointer(event);
            setTooltipPosition([tx, ty]);
          });
      });

      return () => {
        group.selectAll('*').remove();
      };
    }, [enabled, hotspots, projection]);

    const tooltipPayload = useMemo(() => {
      if (!hoveredHotspot) return null;
      const base = buildTooltipForHotspot(hoveredHotspot);
      const localTime = getLocalTimeFromLongitude(hoveredHotspot.lon);
      const contextLines = buildContextLines(localTime);
      return {
        ...base,
        lines: [...base.lines, ...contextLines],
      };
    }, [hoveredHotspot]);

    const popupPayload = useMemo(() => {
      if (!clickedHotspot) return null;
      const base = buildTooltipForHotspot(clickedHotspot);
      const localTime = getLocalTimeFromLongitude(clickedHotspot.lon);
      const contextLines = buildContextLines(localTime);
      return {
        ...base,
        lines: [...base.lines, ...contextLines],
      };
    }, [clickedHotspot]);

    if (!enabled) {
      return null;
    }

    return (
      <>
        <g ref={hotspotsGroupRef} className="hotspots-layer" />
        {tooltipPayload && (
          <D3Tooltip
            payload={tooltipPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!hoveredHotspot}
          />
        )}
        {popupPayload && clickedHotspot && (
          <D3Popup
            payload={popupPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!clickedHotspot}
            onClose={() => setClickedHotspot(null)}
          />
        )}
      </>
    );
  }
);

D3HotspotsLayer.displayName = 'D3HotspotsLayer';

