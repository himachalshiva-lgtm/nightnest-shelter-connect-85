import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Shelter } from '@/types/shelter';
import { calculateDistance, formatDistance } from '@/lib/geoUtils';

interface MapboxMapProps {
  shelters: Shelter[];
  selectedShelter: Shelter | null;
  onShelterSelect: (shelter: Shelter) => void;
  mapboxToken: string;
  userLocation?: { lat: number; lng: number } | null;
  showRoute?: boolean;
}

const statusColors = {
  available: '#22c55e',
  limited: '#f59e0b',
  full: '#ef4444',
};

export default function MapboxMap({
  shelters,
  selectedShelter,
  onShelterSelect,
  mapboxToken,
  userLocation,
  showRoute = false,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    // Center on NYC area (where mock shelters are located)
    const center: [number, number] = [-73.95, 40.73];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom: 11,
      pitch: 30,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    return () => {
      markers.current.forEach((m) => m.remove());
      userMarker.current?.remove();
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add shelter markers
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    shelters.forEach((shelter) => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'shelter-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: ${statusColors[shelter.status]};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: transform 0.2s ease;
      `;

      // Add bed count
      const bedCount = document.createElement('span');
      bedCount.textContent = shelter.availableBeds.toString();
      bedCount.style.cssText = `
        color: white;
        font-size: 11px;
        font-weight: bold;
      `;
      el.appendChild(bedCount);

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = selectedShelter?.id === shelter.id ? 'scale(1.3)' : 'scale(1)';
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([shelter.coordinates.lng, shelter.coordinates.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
            <div style="padding: 8px; color: #1a1a2e;">
              <h3 style="margin: 0 0 4px; font-weight: 600;">${shelter.name}</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">${shelter.availableBeds}/${shelter.totalBeds} beds available</p>
            </div>
          `)
        )
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onShelterSelect(shelter);
      });

      markers.current.push(marker);
    });
  }, [shelters, isMapLoaded, onShelterSelect]);

  // Update selected marker style
  useEffect(() => {
    markers.current.forEach((marker, index) => {
      const el = marker.getElement();
      if (shelters[index]?.id === selectedShelter?.id) {
        el.style.transform = 'scale(1.3)';
        el.style.zIndex = '10';
      } else {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      }
    });
  }, [selectedShelter, shelters]);

  // Fly to selected shelter
  useEffect(() => {
    if (!map.current || !selectedShelter) return;

    map.current.flyTo({
      center: [selectedShelter.coordinates.lng, selectedShelter.coordinates.lat],
      zoom: 14,
      duration: 1500,
    });
  }, [selectedShelter]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !isMapLoaded || !userLocation) return;

    userMarker.current?.remove();

    const el = document.createElement('div');
    el.style.cssText = `
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    `;

    userMarker.current = new mapboxgl.Marker(el)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
  }, [userLocation, isMapLoaded]);

  // Draw route to selected shelter
  useEffect(() => {
    if (!map.current || !isMapLoaded || !showRoute || !userLocation || !selectedShelter) return;

    const routeId = 'route';

    // Remove existing route
    if (map.current.getSource(routeId)) {
      map.current.removeLayer(routeId);
      map.current.removeSource(routeId);
    }

    // Fetch directions from Mapbox
    const getRoute = async () => {
      const start = `${userLocation.lng},${userLocation.lat}`;
      const end = `${selectedShelter.coordinates.lng},${selectedShelter.coordinates.lat}`;
      
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${start};${end}?geometries=geojson&access_token=${mapboxToken}`
        );
        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          const route = data.routes[0].geometry;
          
          map.current?.addSource(routeId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route,
            },
          });
          
          map.current?.addLayer({
            id: routeId,
            type: 'line',
            source: routeId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#6366f1',
              'line-width': 5,
              'line-opacity': 0.8,
            },
          });

          // Fit map to show both points
          const bounds = new mapboxgl.LngLatBounds()
            .extend([userLocation.lng, userLocation.lat])
            .extend([selectedShelter.coordinates.lng, selectedShelter.coordinates.lat]);
          
          map.current?.fitBounds(bounds, { padding: 80 });
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    getRoute();

    return () => {
      if (map.current?.getSource(routeId)) {
        map.current.removeLayer(routeId);
        map.current.removeSource(routeId);
      }
    };
  }, [showRoute, userLocation, selectedShelter, isMapLoaded, mapboxToken]);

  return (
    <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />
  );
}
