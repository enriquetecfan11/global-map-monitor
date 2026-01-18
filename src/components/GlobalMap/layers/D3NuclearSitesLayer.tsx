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
import nuclearSitesData from '../../../data/nuclear-sites.json';

interface D3NuclearSitesLayerProps {
  enabled: boolean;
  zIndex: number;
  projection?: GeoProjection;
}

export const D3NuclearSitesLayer: React.FC<D3NuclearSitesLayerProps> = React.memo(
  ({ enabled, zIndex: _zIndex, projection }) => {
    const [hoveredSite, setHoveredSite] = useState<StrategicInfrastructureData | null>(null);
    const [clickedSite, setClickedSite] = useState<StrategicInfrastructureData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([0, 0]);
    const sitesGroupRef = useRef<SVGGElement>(null);
    const sites = useMemo(() => nuclearSitesData as StrategicInfrastructureData[], []);

    useEffect(() => {
      if (!enabled || !sitesGroupRef.current || !projection) {
        return;
      }

      const group = d3.select(sitesGroupRef.current);
      group.selectAll('*').remove();

      sites.forEach((site, index) => {
        const [x, y] = latLonToXY(projection, site.lat, site.lon);

        const circle = group
          .append('circle')
          .attr('class', `nuclear-site-${index}`)
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 12)
          .attr('fill', '#F59E0B') // amber-500
          .attr('fill-opacity', 0.8)
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseover', function (event) {
            setHoveredSite(site);
            const [tx, ty] = d3.pointer(event);
            setTooltipPosition([tx, ty]);
          })
          .on('mouseout', function () {
            setHoveredSite(null);
          })
          .on('click', function (event) {
            setClickedSite(site);
            const [tx, ty] = d3.pointer(event);
            setTooltipPosition([tx, ty]);
          });
      });

      return () => {
        group.selectAll('*').remove();
      };
    }, [enabled, sites, projection]);

    const tooltipPayload = useMemo(() => {
      if (!hoveredSite) return null;
      const base = buildTooltipForStrategicInfra(hoveredSite, 'Nuclear Site');
      const localTime = getLocalTimeFromLongitude(hoveredSite.lon);
      const contextLines = buildContextLines(localTime);
      return {
        ...base,
        lines: [...base.lines, ...contextLines],
      };
    }, [hoveredSite]);

    const popupPayload = useMemo(() => {
      if (!clickedSite) return null;
      const base = buildTooltipForStrategicInfra(clickedSite, 'Nuclear Site');
      const localTime = getLocalTimeFromLongitude(clickedSite.lon);
      const contextLines = buildContextLines(localTime);
      return {
        ...base,
        lines: [...base.lines, ...contextLines],
      };
    }, [clickedSite]);

    if (!enabled) {
      return null;
    }

    return (
      <>
        <g ref={sitesGroupRef} className="nuclear-sites-layer" />
        {tooltipPayload && (
          <D3Tooltip
            payload={tooltipPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!hoveredSite}
          />
        )}
        {popupPayload && clickedSite && (
          <D3Popup
            payload={popupPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!clickedSite}
            onClose={() => setClickedSite(null)}
          />
        )}
      </>
    );
  }
);

D3NuclearSitesLayer.displayName = 'D3NuclearSitesLayer';

