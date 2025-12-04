import { Shelter } from '@/types/shelter';

export interface Coordinates {
  lat: number;
  lng: number;
}

// Calculate distance between two coordinates using Haversine formula (returns km)
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Get nearest shelters sorted by distance
export function getNearestShelters(
  userLocation: Coordinates,
  shelters: Shelter[],
  excludeFull: boolean = true
): (Shelter & { distance: number })[] {
  const filtered = excludeFull 
    ? shelters.filter(s => s.status !== 'full')
    : shelters;

  return filtered
    .map(shelter => ({
      ...shelter,
      distance: calculateDistance(userLocation, shelter.coordinates),
    }))
    .sort((a, b) => a.distance - b.distance);
}

// Get recommended shelter (nearest with available beds)
export function getRecommendedShelter(
  userLocation: Coordinates,
  shelters: Shelter[]
): Shelter | null {
  const nearest = getNearestShelters(userLocation, shelters, true);
  return nearest[0] || null;
}
