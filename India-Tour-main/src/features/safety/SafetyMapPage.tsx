import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polygon, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchRiskZones, type RiskZone } from '../../services/safetyApi';

const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Position {
  lat: number;
  lng: number;
}

const RecenterOnUser: React.FC<{ position: Position }> = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([position.lat, position.lng], 13);
  }, [map, position]);

  return null;
};

const SafetyMapPage: React.FC = () => {
  const [position, setPosition] = useState<Position | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(5);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoError(null);
      },
      (err) => {
        console.error('Geolocation error', err);
        setGeoError('Unable to access your location. Please allow location permission in your browser.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const MapZoomWatcher: React.FC<{ onZoomChange: (z: number) => void }> = ({ onZoomChange }) => {
    const map = useMap();

    useEffect(() => {
      onZoomChange(map.getZoom());
      const handler = () => onZoomChange(map.getZoom());
      map.on('zoomend', handler);
      return () => {
        map.off('zoomend', handler);
      };
    }, [map, onZoomChange]);

    return null;
  };

  const defaultCenter: Position = { lat: 22.9734, lng: 78.6569 }; // Center of India
  
  // Load active risk zones from the safety API
  useEffect(() => {
    let cancelled = false;
    fetchRiskZones()
      .then((zones) => {
        if (!cancelled) {
          setRiskZones(zones);
          setZonesError(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load risk zones', err);
        if (!cancelled) {
          setZonesError('Unable to load safety zones right now. Showing map without risk overlays.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Safety Map</h1>
            <p className="text-sm text-gray-600 mt-1">
              View your live location and stay aware of safety hot-spots across India.
            </p>
          </div>
        </div>

        {geoError && (
          <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {geoError}
          </div>
        )}

        {zonesError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {zonesError}
          </div>
        )}

        <div className="h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <MapContainer
            center={position ? [position.lat, position.lng] : [defaultCenter.lat, defaultCenter.lng]}
            zoom={position ? 13 : 5}
            scrollWheelZoom
            className="w-full h-full"
          >
            <MapZoomWatcher onZoomChange={setZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Safety Zones from backend RiskZone records (geom.bbox rectangles) */}
            {riskZones.map((zone) => {
              const bbox = zone.geom?.bbox as [number, number, number, number] | undefined;
              if (!bbox || bbox.length !== 4) return null;
              const [minLng, minLat, maxLng, maxLat] = bbox;
              const positions: [number, number][] = [
                [minLat, minLng],
                [minLat, maxLng],
                [maxLat, maxLng],
                [maxLat, minLng],
              ];

              const risk = zone.risk_level.toLowerCase();
              const isHigh = risk === 'high' || risk === 'critical';
              const isMedium = risk === 'medium';

              // When zoomed out, only show high/critical zones; reveal medium zones as user zooms in
              if (zoom < 6 && !isHigh) {
                return null;
              }
              if (zoom < 8 && isMedium) {
                return null;
              }

              const color = isHigh ? '#dc2626' : '#ea580c';
              const fill = isHigh ? '#ef4444' : '#f97316';

              return (
                <Polygon
                  key={zone.id}
                  positions={positions}
                  pathOptions={{ color, fillColor: fill, fillOpacity: isHigh ? 0.25 : 0.18 }}
                >
                  <Tooltip sticky direction="top">
                    <div className="text-xs">
                      <div className="font-semibold text-gray-900 mb-0.5">{zone.name}</div>
                      <div className="mb-0.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isHigh
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {zone.risk_level.toUpperCase()} RISK
                        </span>
                      </div>
                      {zone.city && (
                        <div className="text-[10px] text-gray-600">City: {zone.city}</div>
                      )}
                      {zone.description && (
                        <div className="mt-0.5 text-[10px] text-gray-600 max-w-[180px]">
                          {zone.description}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </Polygon>
              );
            })}

            {position && (
              <>
                <RecenterOnUser position={position} />
                <Marker position={[position.lat, position.lng]} icon={userIcon} />
                <Circle
                  center={[position.lat, position.lng]}
                  radius={200}
                  pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.15 }}
                />
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default SafetyMapPage;
