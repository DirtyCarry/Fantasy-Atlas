import React, { useEffect, useRef } from 'react';
import { MapContainer, ImageOverlay, Marker, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationData } from '../types';

const MAP_WIDTH = 2000;
const MAP_HEIGHT = 1500;
const BOUNDS: L.LatLngBoundsExpression = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];
const DEFAULT_MAP = 'https://media.wizards.com/2015/images/dnd/resources/Sword-Coast-Map_HighRes.jpg';

interface MapAreaProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onMarkerClick: (location: LocationData) => void;
  onMarkerDragEnd: (id: string, lat: number, lng: number) => void;
  onMapClick: (lat: number, lng: number) => void;
  isEditable: boolean;
  mapUrl: string;
}

const createFantasyIcon = (isSelected: boolean, size: number = 25) => {
  const primaryColor = isSelected ? '#f59e0b' : '#0f172a';
  const fillColor = isSelected ? '#ffffff' : '#f1f5f9';
  
  const svgHtml = `
    <svg width="${size}" height="${size * 1.6}" viewBox="0 0 32 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="transition: transform 0.2s ease-out; transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};">
      ${isSelected ? `
        <circle cx="16" cy="42" r="2" stroke="${primaryColor}" stroke-width="2" opacity="0">
          <animate attributeName="r" from="2" to="20" dur="0.4s" repeatCount="1" />
          <animate attributeName="opacity" from="0.6" to="0" dur="0.4s" repeatCount="1" />
        </circle>
      ` : ''}
      <path d="M16 2 L30 32 L19 32 L19 40 L16 48 L13 40 L13 32 L2 32 Z" fill="${fillColor}" stroke="${primaryColor}" stroke-width="3" stroke-linejoin="round" />
      <path d="M16 32 L20 38 L16 44 L12 38 Z" fill="${primaryColor}" />
    </svg>
  `;

  return L.divIcon({
    className: 'bg-transparent border-none outline-none flex items-center justify-center', 
    html: svgHtml,
    iconSize: [size * 1.5, size * 2.5],
    iconAnchor: [size * 0.75, size * 2.4],
  });
};

/**
 * Robust component to handle map resizing.
 * Listens to container size changes and uses a 'heartbeat' invalidation pattern
 * to ensure the map renders correctly even in complex flex layouts.
 */
const MapResizer = () => {
  const map = useMap();
  
  useEffect(() => {
    // Sequence of invalidations to catch browser layout settling
    const intervals = [50, 200, 500, 1000, 2000];
    const timers = intervals.map(ms => setTimeout(() => map.invalidateSize(), ms));

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    const container = map.getContainer();
    if (container) {
      observer.observe(container);
    }

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
    };
  }, [map]);

  return null;
};

const MapClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void, isEditable: boolean }> = ({ onClick, isEditable }) => {
  useMapEvents({
    click(e) {
      if (isEditable) {
        setTimeout(() => {
          onClick(e.latlng.lat, e.latlng.lng);
        }, 100);
      }
    },
  });
  return null;
};

const MapController: React.FC<{ selectedLocation: LocationData | null }> = ({ selectedLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.y, selectedLocation.x], 2, { animate: true, duration: 1.5 });
    }
  }, [selectedLocation, map]);
  return null;
}

const BoundsFitter = ({ mapUrl }: { mapUrl: string }) => {
    const map = useMap();
    useEffect(() => { 
      map.invalidateSize();
      map.fitBounds(BOUNDS); 
    }, [map, mapUrl]);
    return null;
}

const MapArea: React.FC<MapAreaProps> = ({ 
  locations,
  selectedLocation, 
  onMarkerClick, 
  onMarkerDragEnd, 
  onMapClick,
  isEditable,
  mapUrl
}) => {
  const activeUrl = mapUrl || DEFAULT_MAP;

  return (
    <div className="absolute inset-0 bg-slate-950 z-0">
      <MapContainer
        key={activeUrl}
        crs={L.CRS.Simple}
        center={[MAP_HEIGHT / 2, MAP_WIDTH / 2]}
        zoom={0}
        minZoom={-1}
        maxZoom={3}
        scrollWheelZoom={true}
        className="h-full w-full outline-none"
        style={{ background: '#020617', height: '100%', width: '100%' }}
      >
        <ImageOverlay key={activeUrl} url={activeUrl} bounds={BOUNDS} />
        <MapResizer />
        <BoundsFitter mapUrl={activeUrl} />
        <MapController selectedLocation={selectedLocation} />
        <MapClickHandler onClick={onMapClick} isEditable={isEditable} />
        {locations.map((loc) => {
          const isSelected = selectedLocation?.id === loc.id;
          return (
            <Marker
              key={`${loc.id}-${isSelected}`} 
              position={[loc.y, loc.x]}
              draggable={isEditable}
              icon={createFantasyIcon(isSelected, 25)}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{
                click: () => onMarkerClick(loc),
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  onMarkerDragEnd(loc.id, position.lat, position.lng);
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -40]} opacity={1}>
                <div className="bg-slate-900 border border-amber-900/50 px-2 py-1 rounded shadow-xl">
                  <span className="font-serif font-bold text-[10px] uppercase text-amber-100 tracking-widest">{loc.name}</span>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 z-[900] bg-slate-900/80 p-3 rounded border border-amber-900/50 text-slate-300 text-[10px] uppercase tracking-widest backdrop-blur-sm pointer-events-none font-serif">
         <p className="mb-1">Scroll to Zoom • Drag to Pan</p>
         {isEditable && <p className="text-amber-500 font-bold animate-pulse">Forge Access: Map Sigils Modifiable</p>}
      </div>
    </div>
  );
};

export default MapArea;