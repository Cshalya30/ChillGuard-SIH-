import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Shipment } from '../../types';
import { useStore } from '../../store/useStore';

interface ShipmentMapProps {
  shipments: Shipment[];
  selectedShipmentId?: string | null;
  height?: string;
}

// Custom Leaflet Icons using status color SVGs
const createCustomIcon = (status: string, isSelected: boolean) => {
  let color = '#16A34A'; // green safe
  let isBreach = false;

  if (status === 'at_risk' || status === 'at risk') color = '#D97706';
  else if (status === 'breach') {
    color = '#DC2626';
    isBreach = true;
  } else if (status === 'offline') color = '#6B7280';

  const size = isSelected ? 34 : 26;

  const html = `
    <div class="${isBreach ? 'marker-breach-pulse' : ''}" style="width: ${size}px; height: ${size}px; background-color: ${color}; border: 2.5px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25); transition: transform 0.2s;">
      <div style="width: ${size / 3.5}px; height: ${size / 3.5}px; background-color: white; border-radius: 50%;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const MapBoundsController: React.FC<{ shipments: Shipment[] }> = ({ shipments }) => {
  const map = useMap();

  useEffect(() => {
    if (shipments.length > 0) {
      const validPoints = shipments
        .filter((s) => s.latest_latitude && s.latest_longitude)
        .map((s) => [s.latest_latitude!, s.latest_longitude!] as [number, number]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
      }
    }
  }, [map]); // Runs only on mount/initial load per PRD requirement

  return null;
};

export const ShipmentMap: React.FC<ShipmentMapProps> = ({
  shipments,
  selectedShipmentId,
  height = '480px'
}) => {
  const setSelectedShipmentId = useStore((state) => state.setSelectedShipmentId);

  // Center on Karnataka / Southern India
  const center: [number, number] = [12.9716, 77.5946];

  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId);
  const selectedRoutePolyline: [number, number][] = selectedShipment?.readings
    ? selectedShipment.readings
        .filter((r) => r.latitude && r.longitude)
        .map((r) => [r.latitude, r.longitude])
    : [];

  return (
    <div className="bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-card relative" style={{ height }}>
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* OpenStreetMap Tiles - Clean standard tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsController shipments={shipments} />

        {/* GPS trace polyline shown ONLY for selected shipment */}
        {selectedRoutePolyline.length > 1 && (
          <Polyline
            positions={selectedRoutePolyline}
            pathOptions={{ color: '#1D6FA4', weight: 3, opacity: 0.7, dashArray: '8, 6' }}
          />
        )}

        {shipments.map((s) => {
          const lat = s.latest_latitude || (s.id === 'SH-2041' ? 12.7 : 12.97);
          const lng = s.latest_longitude || (s.id === 'SH-2041' ? 77.3 : 77.59);
          const isSelected = s.id === selectedShipmentId;

          return (
            <Marker
              key={s.id}
              position={[lat, lng]}
              icon={createCustomIcon(s.status, isSelected)}
              eventHandlers={{
                click: () => setSelectedShipmentId(s.id)
              }}
            >
              <Popup>
                <div className="p-1 space-y-1.5 font-sans min-w-[160px]">
                  <div className="flex items-center justify-between space-x-3">
                    <span className="font-mono font-bold text-xs text-[#4DA8DA]">{s.id}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      s.risk_score >= 70 ? 'bg-red-500/20 text-red-300' : 
                      s.risk_score >= 31 ? 'bg-amber-500/20 text-amber-300' : 
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      Risk {s.risk_score}
                    </span>
                  </div>
                  <p className="font-semibold text-xs text-white">{s.product_name}</p>
                  <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1.5 border-t border-white/10">
                    <span>Temp: {s.latest_temperature ?? s.setpoint_temp}°C</span>
                    <span className={s.time_to_breach_minutes ? 'text-red-400' : 'text-emerald-400'}>
                      {s.time_to_breach_minutes ? `Breach in ${s.time_to_breach_minutes}m` : 'Safe'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
