import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';

interface LeafletMapProps {
  center?: LatLngExpression;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  children?: React.ReactNode;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center = [20, 0],
  zoom = 2,
  minZoom = 1,
  maxZoom = 10,
  children,
}) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={minZoom}
      maxZoom={maxZoom}
      style={{ height: '100%', width: '100%', backgroundColor: '#1F2937' }}
      zoomControl={false}
      className="leaflet-container-dark"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      {children}
    </MapContainer>
  );
};
