import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shelter } from '@/types/shelter';

interface LeafletMapProps {
  shelters: Shelter[];
  selectedShelter: Shelter | null;
  onShelterSelect: (shelter: Shelter) => void;
  userLocation?: { lat: number; lng: number } | null;
  showRoute?: boolean;
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

export default function LeafletMap({
  shelters,
  selectedShelter,
  onShelterSelect,
  userLocation,
  showRoute = false,
}: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.CircleMarker[]>([]);
  const userMarker = useRef<L.CircleMarker | null>(null);
  const routeLine = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Center on Delhi, India (where government school shelters are located)
    const center: [number, number] = [28.6129, 77.2295];

    map.current = L.map(mapContainer.current, {
      center,
      zoom: 12,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles (completely free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add shelter markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    shelters.forEach((shelter) => {
      const marker = L.circleMarker([shelter.coordinates.lat, shelter.coordinates.lng], {
        radius: 14,
        fillColor: statusColors[shelter.status],
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(map.current!);

      // Add popup
      marker.bindPopup(`
        <div style="padding: 4px; min-width: 150px;">
          <h3 style="margin: 0 0 4px; font-weight: 600; font-size: 14px;">${shelter.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${shelter.availableBeds}/${shelter.totalBeds} beds available</p>
        </div>
      `);

      // Add tooltip with bed count
      marker.bindTooltip(shelter.availableBeds.toString(), {
        permanent: true,
        direction: 'center',
        className: 'bed-count-tooltip',
      });

      marker.on('click', () => {
        onShelterSelect(shelter);
      });

      markers.current.push(marker);
    });
  }, [shelters, onShelterSelect]);

  // Update selected marker style
  useEffect(() => {
    markers.current.forEach((marker, index) => {
      const shelter = shelters[index];
      if (shelter?.id === selectedShelter?.id) {
        marker.setRadius(18);
        marker.setStyle({ weight: 4 });
      } else {
        marker.setRadius(14);
        marker.setStyle({ weight: 3 });
      }
    });
  }, [selectedShelter, shelters]);

  // Fly to selected shelter
  useEffect(() => {
    if (!map.current || !selectedShelter) return;

    map.current.flyTo(
      [selectedShelter.coordinates.lat, selectedShelter.coordinates.lng],
      15,
      { duration: 1 }
    );
  }, [selectedShelter]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    userMarker.current?.remove();

    userMarker.current = L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 10,
      fillColor: '#3b82f6',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 1,
    }).addTo(map.current);

    userMarker.current.bindPopup('Your Location');
  }, [userLocation]);

  // Draw route to selected shelter
  useEffect(() => {
    if (!map.current) return;

    // Remove existing route
    routeLine.current?.remove();
    routeLine.current = null;

    if (!showRoute || !userLocation || !selectedShelter) return;

    // Draw a simple straight line (for a free routing alternative, 
    // you could use OSRM API which is also free)
    const start: [number, number] = [userLocation.lat, userLocation.lng];
    const end: [number, number] = [selectedShelter.coordinates.lat, selectedShelter.coordinates.lng];

    // Fetch route from OSRM (free routing service)
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/walking/${userLocation.lng},${userLocation.lat};${selectedShelter.coordinates.lng},${selectedShelter.coordinates.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const coordinates = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );

          routeLine.current = L.polyline(coordinates, {
            color: '#6366f1',
            weight: 5,
            opacity: 0.8,
          }).addTo(map.current!);

          // Fit map to show both points
          map.current?.fitBounds(L.latLngBounds([start, end]).pad(0.2));
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback to straight line
        routeLine.current = L.polyline([start, end], {
          color: '#6366f1',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 10',
        }).addTo(map.current!);
      }
    };

    fetchRoute();

    return () => {
      routeLine.current?.remove();
    };
  }, [showRoute, userLocation, selectedShelter]);

  return (
    <>
      <style>{`
        .bed-count-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: white !important;
          font-weight: bold !important;
          font-size: 11px !important;
        }
        .bed-count-tooltip::before {
          display: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>
      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />
    </>
  );
}
