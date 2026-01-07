import React, { useEffect } from 'react';
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

const createFantasyIcon = (isSelected: boolean, size: number = 32) => {
  const primaryColor = isSelected ? '#fbbf24' : '#d97706'; // amber-400 vs amber-600
  const secondaryColor = isSelected ? '#fef3c7' : '#92400e'; // amber-100 vs amber-800
  const glowColor = isSelected ? 'rgba(251, 191, 36, 0.6)' : 'rgba(217, 119, 6, 0.2)';
  
  const svgHtml = `
    <svg width="${size}" height="${size * 1.5}" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 4px ${glowColor}); transition: all 0.3s ease;">
      <!-- Outer Decorative Shield -->
      <path d="M16 44 L4 32 C2 28 2 12 2 12 L16 4 L30 12 C30 12 30 28 28 32 L16 44Z" 
            fill="#0f172a" 
            stroke="${primaryColor}" 
            stroke-width="2" />
            
      <!-- Inner Sigil Pattern -->
      <path d="M16 8 L24 14 L24 28 L16 34 L8 28 L8 14 Z" 
            fill="${secondaryColor}" 
            fill-opacity="0.2"
            stroke="${primaryColor}" 
            stroke-width="1" 
            stroke-dasharray="2 1" />
            
      <!-- Central Arcane Gem -->
      <circle cx="16" cy="21" r="5" fill="${primaryColor}">
        ${isSelected ? `<animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />` : ''}
      </circle>
      <circle cx="16" cy="21" r="2" fill="white" fill-opacity="0.5" />
      
      <!-- Selection Ring -->
      ${isSelected ? `
        <circle cx="16" cy="21" r="12" stroke="${primaryColor}" stroke-width="1" opacity="0.5">
          <animate attributeName="stroke-dasharray" from="0, 100" to="100, 0" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
      ` : ''}
    </svg>
  `;

  return L.divIcon({
    className: 'bg-transparent border-none outline-none flex items-center justify-center', 
    html: svgHtml,
    iconSize: [size, size * 1.5],
    iconAnchor: [size / 2, size * 1.4],
  });
};

/**
 * Robust component to handle map resizing.
 */
const MapResizer = () => {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
    const intervals = [50, 200, 500, 1000, 2000];
    const timers = intervals.map(ms => setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(BOUNDS);
    }, ms));

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
        style={{ 
          background: '#020617', 
          height: '100%', 
          width: '100%',
          minHeight: '100%'
        }}
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
              icon={createFantasyIcon(isSelected, loc.size || 32)}
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
              <Tooltip direction="top" offset={[0, -(loc.size || 32) * 1.4]} opacity={1}>
                <div className="bg-slate-900 border border-amber-900/50 px-3 py-1.5 rounded shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <span className="font-serif font-bold text-[11px] uppercase text-amber-100 tracking-[0.15em]">{loc.name}</span>
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