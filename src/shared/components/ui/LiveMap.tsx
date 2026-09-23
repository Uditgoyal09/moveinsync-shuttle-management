import { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export type MapMarkerData = {
  id: string;
  type: 'shuttle' | 'stop' | 'pin';
  lat: number;
  lng: number;
  name: string;
  color?: string;
  isActive?: boolean;
};

// Custom SVG Icons using L.divIcon
const createShuttleIcon = (color: string = '#3867FF') => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 12px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; position: relative; z-index: 100;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 14h16"/><path d="M4 6h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M6 18h.01"/><path d="M18 18h.01"/><path d="M8 10h8"/>
        </svg>
        <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid white;"></div>
        <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 6px solid ${color};"></div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

const createStopIcon = (isActive: boolean = false, color: string = '#19A974') => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        ${isActive ? `<div style="position: absolute; width: 48px; height: 48px; background-color: ${color}; border-radius: 50%; opacity: 0.3; animation: pulse 2s infinite;"></div>` : ''}
        <div style="width: 20px; height: 20px; background-color: ${isActive ? color : '#0F172A'}; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10; cursor: pointer; transition: transform 0.2s;"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const createPinIcon = (color: string = '#F59E0B') => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translateY(-50%);">
        <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: -2px 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: grab;">
          <div style="width: 12px; height: 12px; background-color: white; border-radius: 50%;"></div>
        </div>
        <div style="width: 14px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(2px); margin-top: 4px;"></div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

// Component to dynamically change map view
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center[0], center[1], zoom, map]);
  return null;
}

function MapEventsHandler({ onMapClick }: { onMapClick?: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng);
    }
  });
  return null;
}

function DraggableMarker({ marker, onMarkerClick, onMarkerDragEnd }: { marker: MapMarkerData, onMarkerClick?: (m: MapMarkerData) => void, onMarkerDragEnd?: (m: MapMarkerData, l: {lat: number, lng: number}) => void }) {
  const [position, setPosition] = useState<[number, number]>([marker.lat, marker.lng]);
  const markerRef = useRef<L.Marker>(null);

  // Sync if parent explicitly changes coords, but not during re-renders if coords are same
  useEffect(() => {
    setPosition([marker.lat, marker.lng]);
  }, [marker.lat, marker.lng]);

  const callbacks = useRef({ onMarkerClick, onMarkerDragEnd, marker });
  useEffect(() => {
    callbacks.current = { onMarkerClick, onMarkerDragEnd, marker };
  }, [onMarkerClick, onMarkerDragEnd, marker]);

  const eventHandlers = useMemo(
    () => ({
      click: () => {
        const { onMarkerClick, marker } = callbacks.current;
        if (onMarkerClick) onMarkerClick(marker);
      },
      dragend: () => {
        const m = markerRef.current;
        if (m != null) {
          const newLatLng = m.getLatLng();
          setPosition([newLatLng.lat, newLatLng.lng]);
          const { onMarkerDragEnd, marker } = callbacks.current;
          if (onMarkerDragEnd) {
            onMarkerDragEnd(marker, { lat: newLatLng.lat, lng: newLatLng.lng });
          }
        }
      },
    }),
    []
  );

  const icon = useMemo(() => {
    return marker.type === 'shuttle' 
      ? createShuttleIcon(marker.color) 
      : (marker.type === 'pin' ? createPinIcon(marker.color) : createStopIcon(marker.isActive, marker.color));
  }, [marker.type, marker.color, marker.isActive]);

  return (
    <Marker 
      ref={markerRef}
      position={position}
      icon={icon}
      draggable={marker.type === 'stop' || marker.type === 'pin'}
      eventHandlers={eventHandlers}
    >
      <Popup className="custom-popup">
        <div className="font-bold text-[14px]">{marker.name}</div>
        <div className="text-[12px] text-slate-500 capitalize">{marker.type}</div>
      </Popup>
    </Marker>
  );
}

interface LiveMapProps {
  markers: MapMarkerData[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  hideControls?: boolean;
  routeLine?: [number, number][]; // Kept for backwards compatibility if needed
  routes?: { id: string, color: string, path: [number, number][] }[];
  activeDrawingRoute?: [number, number][];
  activeDrawingColor?: string;
  onMarkerClick?: (marker: MapMarkerData) => void;
  onMapClick?: (latlng: { lat: number, lng: number }) => void;
  onMarkerDragEnd?: (marker: MapMarkerData, newLatLng: { lat: number, lng: number }) => void;
}

export function LiveMap({ 
  markers, 
  center = [31.2560, 75.7051], // LPU Campus Default
  zoom = 15,
  className = "w-full h-full",
  hideControls = false,
  routeLine,
  routes = [],
  activeDrawingRoute = [],
  activeDrawingColor = '#F59E0B',
  onMarkerClick,
  onMapClick,
  onMarkerDragEnd
}: LiveMapProps) {
  
  return (
    <div className={className} style={{ isolation: 'isolate' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={!hideControls}
        zoomControl={false} // Removed to fix duplicate +- icons
        dragging={!hideControls}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <MapUpdater center={center} zoom={zoom} />
        <MapEventsHandler onMapClick={onMapClick} />
        
        {/* OpenStreetMap Tiles (Free, No API Key) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />

        {/* Existing single routeLine if any */}
        {routeLine && routeLine.length > 0 && (
          <Polyline 
            positions={routeLine} 
            color="#2457E6" 
            weight={4} 
            opacity={0.8} 
            dashArray="10, 10" 
            className="animate-[dash_1s_linear_infinite]"
          />
        )}

        {/* Saved Routes */}
        {routes.map(r => (
          <Polyline 
            key={r.id}
            positions={r.path} 
            color={r.color} 
            weight={4} 
            opacity={0.8} 
          />
        ))}

        {/* Active Drawing Route */}
        {activeDrawingRoute.length > 0 && (
          <Polyline 
            positions={activeDrawingRoute} 
            color={activeDrawingColor} 
            weight={6} 
            opacity={0.9} 
            lineCap="round"
            lineJoin="round"
          />
        )}

        {markers.map(marker => (
          <DraggableMarker 
            key={marker.id} 
            marker={marker} 
            onMarkerClick={onMarkerClick} 
            onMarkerDragEnd={onMarkerDragEnd} 
          />
        ))}
      </MapContainer>

      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          font-family: inherit;
        }
        .map-tiles {
          filter: grayscale(0.2) contrast(1.1) brightness(0.9);
        }
        .dark .map-tiles {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        @keyframes pulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
      `}} />
    </div>
  );
}
