import * as d3 from 'd3';
import { geoEqualEarth } from 'd3-geo';
import type { GeoJSON } from 'geojson';

export interface MapProjection {
  projection: d3.GeoProjection;
  path: d3.GeoPath<any, d3.GeoPermissibleObjects>;
}

/**
 * Crea una proyección geoEqualEarth configurada para el tamaño del contenedor.
 */
export const createProjection = (
  width: number,
  height: number,
  center: [number, number] = [20, 0]
): MapProjection => {
  const projection = geoEqualEarth()
    .center(center)
    .scale(1)
    .translate([width / 2, height / 2]);

  // Ajustar escala para que el mundo quepa en el contenedor
  const path = d3.geoPath().projection(projection);
  const bounds = path.bounds({ type: 'Sphere' } as unknown as GeoJSON);
  const scale = 0.95 / Math.max(
    (bounds[1][0] - bounds[0][0]) / width,
    (bounds[1][1] - bounds[0][1]) / height
  );
  const translate: [number, number] = [
    width / 2 - scale * (bounds[0][0] + bounds[1][0]) / 2,
    height / 2 - scale * (bounds[0][1] + bounds[1][1]) / 2,
  ];

  projection.scale(scale).translate(translate);

  return {
    projection,
    path: d3.geoPath().projection(projection),
  };
};

/**
 * Actualiza la proyección con un nuevo zoom (escala).
 */
export const updateProjectionScale = (
  projection: d3.GeoProjection,
  _width: number,
  _height: number,
  scale: number
): void => {
  const currentTranslate = projection.translate();
  projection.scale(scale).translate(currentTranslate);
};

/**
 * Convierte coordenadas [lat, lon] a coordenadas de pantalla [x, y].
 */
export const latLonToXY = (
  projection: d3.GeoProjection,
  lat: number,
  lon: number
): [number, number] => {
  const coords = projection([lon, lat]);
  return coords ? [coords[0], coords[1]] : [0, 0];
};

/**
 * Convierte coordenadas de pantalla [x, y] a coordenadas [lat, lon].
 */
export const xyToLatLon = (
  projection: d3.GeoProjection,
  x: number,
  y: number
): [number, number] | null => {
  const coords = projection.invert?.([x, y]);
  return coords ? [coords[1], coords[0]] : null;
};

/**
 * Calcula el zoom level basado en la escala de la proyección.
 */
export const scaleToZoomLevel = (scale: number, baseScale: number): number => {
  // Aproximación: zoom level basado en la relación de escalas
  // Ajustar según sea necesario
  const ratio = scale / baseScale;
  if (ratio <= 1) return 2;
  if (ratio <= 1.5) return 3;
  if (ratio <= 2) return 4;
  return 4;
};

/**
 * Calcula la escala basada en el zoom level.
 */
export const zoomLevelToScale = (zoomLevel: number, baseScale: number): number => {
  // Aproximación inversa
  switch (zoomLevel) {
    case 2:
      return baseScale;
    case 3:
      return baseScale * 1.5;
    case 4:
      return baseScale * 2;
    default:
      return baseScale;
  }
};

