import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { GeoProjection } from 'd3-geo';
import type { RssCountryData } from '../../../types/feed.types';
import { buildTooltipForRssCountry } from '../tooltips/tooltipBuilder';
import { D3Tooltip } from '../tooltips/D3Tooltip';
import { D3Popup } from '../tooltips/D3Popup';
import { latLonToXY } from '../../../utils/d3MapUtils';
import { buildContextLines } from '../tooltips/tooltipBuilder';
import { getLocalTimeFromLongitude } from '../../../utils/geoUtils';
import { useFeedStore } from '../../../stores/feedStore';

interface D3RssCountriesLayerProps {
  enabled: boolean;
  zIndex: number;
  projection?: GeoProjection;
}

const getColorForMentions = (mentionCount: number): string => {
  if (mentionCount === 1) {
    return '#10B981'; // green-500
  } else if (mentionCount <= 3) {
    return '#F59E0B'; // amber-500
  } else if (mentionCount <= 5) {
    return '#F97316'; // orange-500
  } else {
    return '#EF4444'; // red-500
  }
};

const getSizeForMentions = (mentionCount: number): number => {
  if (mentionCount === 1) {
    return 8;
  } else if (mentionCount <= 3) {
    return 10;
  } else if (mentionCount <= 5) {
    return 12;
  } else {
    return 14;
  }
};

export const D3RssCountriesLayer: React.FC<D3RssCountriesLayerProps> = React.memo(
  ({ enabled, zIndex: _zIndex, projection }) => {
    const [hoveredCountry, setHoveredCountry] = useState<RssCountryData | null>(null);
    const [clickedCountry, setClickedCountry] = useState<RssCountryData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([0, 0]);
    const countriesGroupRef = useRef<SVGGElement>(null);
    const rssCountries = useFeedStore((state) => state.rssCountries);

    useEffect(() => {
      if (!enabled || !countriesGroupRef.current || !projection || !rssCountries || rssCountries.length === 0) {
        return;
      }

      const group = d3.select(countriesGroupRef.current);
      group.selectAll('*').remove();

      rssCountries.forEach((country, index) => {
        const [x, y] = latLonToXY(projection, country.lat, country.lon);
        const color = getColorForMentions(country.mentionCount);
        const size = getSizeForMentions(country.mentionCount);

        const rect = group
          .append('rect')
          .attr('class', `rss-country-${index}`)
          .attr('x', x - size / 2)
          .attr('y', y - size / 2)
          .attr('width', size)
          .attr('height', size)
          .attr('fill', color)
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 2)
          .attr('rx', 2)
          .style('cursor', 'pointer')
          .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
          .on('mouseover', function (event) {
            setHoveredCountry(country);
            const [tx, ty] = d3.pointer(event);
            setTooltipPosition([tx, ty]);
          })
          .on('mouseout', function () {
            setHoveredCountry(null);
          })
          .on('click', function (event) {
            setClickedCountry(country);
            const [tx, ty] = d3.pointer(event);
            setTooltipPosition([tx, ty]);
          });
      });

      return () => {
        group.selectAll('*').remove();
      };
    }, [enabled, rssCountries, projection]);

    const tooltipPayload = useMemo(() => {
      if (!hoveredCountry) return null;
      const base = buildTooltipForRssCountry(hoveredCountry);
      const localTime = getLocalTimeFromLongitude(hoveredCountry.lon);
      const contextLines = buildContextLines(localTime);
      return {
        ...base,
        lines: [...base.lines, ...contextLines],
      };
    }, [hoveredCountry]);

    const popupPayload = useMemo(() => {
      if (!clickedCountry) return null;
      const base = buildTooltipForRssCountry(clickedCountry);
      const localTime = getLocalTimeFromLongitude(clickedCountry.lon);
      const contextLines = buildContextLines(localTime);
      return {
        ...base,
        lines: [...base.lines, ...contextLines],
      };
    }, [clickedCountry]);

    if (!enabled || !rssCountries || rssCountries.length === 0) {
      return null;
    }

    return (
      <>
        <g ref={countriesGroupRef} className="rss-countries-layer" />
        {tooltipPayload && (
          <D3Tooltip
            payload={tooltipPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!hoveredCountry}
          />
        )}
        {popupPayload && clickedCountry && (
          <D3Popup
            payload={popupPayload}
            x={tooltipPosition[0]}
            y={tooltipPosition[1]}
            visible={!!clickedCountry}
            onClose={() => setClickedCountry(null)}
          />
        )}
      </>
    );
  }
);

D3RssCountriesLayer.displayName = 'D3RssCountriesLayer';

