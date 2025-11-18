/**
 * MapView component - Displays route on Leaflet map
 */
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, ZoomControl } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import L from 'leaflet';
import type { Stop } from '../types';
import { colors } from '../theme';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  stops: Stop[];
  center?: [number, number];
  zoom?: number;
}

/**
 * Component to recenter map when stops change
 */
function MapRecenter({ stops }: { stops: Stop[] }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map((stop) => stop.location));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [stops, map]);

  return null;
}

/**
 * Create custom numbered markers
 */
function createNumberedIcon(number: number): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${colors.purple[500]};
        color: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${number}
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function MapView({ stops, center, zoom = 12 }: MapViewProps) {
  // Calculate route line coordinates
  const routeCoordinates = stops.map((stop) => stop.location);

  // Use provided center or calculate from stops
  const mapCenter = center || (stops.length > 0 ? stops[0].location : [52.52, 13.405]);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Zoom controls in bottom-left */}
        <ZoomControl position="bottomleft" />

        {/* Route line */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color={colors.purple[500]}
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Markers for each stop */}
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={stop.location}
            icon={createNumberedIcon(index + 1)}
          >
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {index + 1}. {stop.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stop.address}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}

        {/* Recenter when stops change */}
        <MapRecenter stops={stops} />
      </MapContainer>
    </Box>
  );
}
