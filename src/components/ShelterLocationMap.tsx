import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ShelterLocationMapProps {
  coordinates: { lat: number; lng: number };
  name: string;
  address: string;
}

const statusColors = {
  available: '#22c55e',
  limited: '#f59e0b',
  full: '#ef4444',
};

// Fix default marker icon issue with Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function ShelterLocationMap({ coordinates, name, address }: ShelterLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      center: [coordinates.lat, coordinates.lng],
      zoom: 15,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Add marker for the shelter
    const marker = L.marker([coordinates.lat, coordinates.lng]).addTo(map.current);

    marker.bindPopup(`
      <div style="padding: 4px; min-width: 150px;">
        <h3 style="margin: 0 0 4px; font-weight: 600; font-size: 14px;">${name}</h3>
        <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
      </div>
    `).openPopup();

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [coordinates, name, address]);

  return (
    <>
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>
      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />
    </>
  );
}