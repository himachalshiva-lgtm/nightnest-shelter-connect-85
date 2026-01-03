import { useState, useEffect, useRef } from 'react';
import { Navigation, Shield, Loader2, MapPin, Clock, Phone, AlertTriangle, Route, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { mockShelters } from '@/data/mockData';
import { Shelter } from '@/types/shelter';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SafeRouteResult {
  recommendedShelter: {
    id: string;
    name: string;
    reason: string;
    safetyScore: number;
  };
  routeGuidance: string;
  safetyTips: string[];
  estimatedWalkTime: number;
  alternativeShelters: Array<{
    name: string;
    reason: string;
  }>;
  emergencyContacts: string[];
}

// Mockup Delhi locations for demonstration
const DELHI_MOCKUP_LOCATIONS = [
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'India Gate', lat: 28.6129, lng: 77.2295 },
  { name: 'Old Delhi Railway Station', lat: 28.6618, lng: 77.2265 },
  { name: 'Chandni Chowk', lat: 28.6505, lng: 77.2303 },
  { name: 'Karol Bagh', lat: 28.6523, lng: 77.1901 },
];

export default function SafeRouteFinder() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SafeRouteResult | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [selectedShelterForRoute, setSelectedShelterForRoute] = useState<Shelter | null>(null);
  const [mockupLocation, setMockupLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Set a random mockup location when component mounts
  useEffect(() => {
    const randomLocation = DELHI_MOCKUP_LOCATIONS[Math.floor(Math.random() * DELHI_MOCKUP_LOCATIONS.length)];
    setMockupLocation(randomLocation);

    // Also try to get real location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Use mockup if geolocation fails
        }
      );
    }
  }, []);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  };

  const effectiveLocation = userLocation || (mockupLocation ? { lat: mockupLocation.lat, lng: mockupLocation.lng } : null);

  const handleFindSafeRoute = async () => {
    if (!effectiveLocation) {
      toast.error('Location not available');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setRawResponse(null);
    setSelectedShelterForRoute(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-safe-route', {
        body: {
          userLocation: effectiveLocation,
          shelters: mockShelters.map(s => ({
            id: s.id,
            name: s.name,
            address: s.address,
            availableBeds: s.availableBeds,
            coordinates: s.coordinates,
            amenities: s.amenities,
          })),
          timeOfDay: getTimeOfDay(),
        },
      });

      if (error) throw error;

      if (data.success) {
        if (data.routeData.parseError) {
          setRawResponse(data.routeData.rawResponse);
          toast.info('AI provided route guidance (text format)');
        } else {
          setResult(data.routeData);
          // Find the shelter and show route on map
          const shelter = mockShelters.find(s => s.id === data.routeData.recommendedShelter.id || s.name === data.routeData.recommendedShelter.name);
          if (shelter) {
            setSelectedShelterForRoute(shelter);
          }
          toast.success('Safe route calculated!');
        }
      } else {
        throw new Error(data.error || 'Route calculation failed');
      }
    } catch (error) {
      console.error('Route error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to calculate safe route');
    } finally {
      setIsLoading(false);
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 5) return 'text-warning';
    return 'text-danger';
  };

  const openGoogleMapsDirections = () => {
    if (selectedShelterForRoute && effectiveLocation) {
      const url = `https://www.google.com/maps/dir/${effectiveLocation.lat},${effectiveLocation.lng}/${selectedShelterForRoute.coordinates.lat},${selectedShelterForRoute.coordinates.lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/map')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            AI Safe Route Finder
          </h1>
          <p className="text-muted-foreground mt-1">
            Find the safest route to a nearby shelter based on time, lighting, and safety factors
          </p>
        </div>
      </div>

      {/* Location Info */}
      {!userLocation && mockupLocation && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm text-primary flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Using demo location: <strong>{mockupLocation.name}</strong>
          </p>
        </div>
      )}

      {/* Find Route Button */}
      <Button 
        onClick={handleFindSafeRoute} 
        disabled={isLoading}
        size="lg"
        variant="scan"
        className="w-full md:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Calculating Safe Route...
          </>
        ) : (
          <>
            <Navigation className="h-5 w-5 mr-2" />
            Find Safest Route
          </>
        )}
      </Button>

      {/* Raw Response */}
      {rawResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              AI Route Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{rawResponse}</p>
          </CardContent>
        </Card>
      )}

      {/* Result with Map */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Route Map */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                Route to {selectedShelterForRoute?.name}
              </CardTitle>
              <CardDescription>
                Walking route from your location
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {selectedShelterForRoute && effectiveLocation && (
                <div className="h-[400px]">
                  <RouteMapDisplay 
                    userLocation={effectiveLocation}
                    shelter={selectedShelterForRoute}
                    locationName={mockupLocation?.name || 'Your Location'}
                  />
                </div>
              )}
              <div className="p-4 border-t border-border">
                <Button onClick={openGoogleMapsDirections} className="w-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Route Details */}
          <div className="space-y-4">
            {/* Recommended Shelter */}
            <Card className="border-success/30">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-success" />
                      Recommended Shelter
                    </h4>
                    <p className="text-xl font-semibold text-foreground mt-1">
                      {result.recommendedShelter.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Safety Score</p>
                    <p className={`text-3xl font-bold ${getSafetyScoreColor(result.recommendedShelter.safetyScore)}`}>
                      {result.recommendedShelter.safetyScore}/10
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{result.recommendedShelter.reason}</p>
              </CardContent>
            </Card>

            {/* Walk Time */}
            {result.estimatedWalkTime && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated walking time</p>
                      <p className="text-lg font-semibold text-foreground">{result.estimatedWalkTime} minutes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safety Tips */}
            {result.safetyTips && result.safetyTips.length > 0 && (
              <Card className="border-warning/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Safety Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {result.safetyTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Emergency Contacts */}
            {result.emergencyContacts && result.emergencyContacts.length > 0 && (
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Phone className="h-4 w-4 text-primary" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.emergencyContacts.map((contact, index) => (
                      <Badge key={index} variant="outline">
                        {contact}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Back to Map Button */}
      <Button variant="outline" onClick={() => navigate('/map')} className="mt-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Map View
      </Button>
    </div>
  );
}

// Separate component for the route map display
function RouteMapDisplay({ 
  userLocation, 
  shelter, 
  locationName 
}: { 
  userLocation: { lat: number; lng: number }; 
  shelter: Shelter;
  locationName: string;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !shelter || !userLocation) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current, {
      center: [
        (userLocation.lat + shelter.coordinates.lat) / 2,
        (userLocation.lng + shelter.coordinates.lng) / 2
      ],
      zoom: 13,
    });

    // Add tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // Add user location marker
    const userIcon = L.divIcon({
      html: `<div style="width: 24px; height: 24px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup(`<strong>${locationName}</strong><br/>Starting Point`);

    // Add shelter marker
    const shelterIcon = L.divIcon({
      html: `<div style="width: 28px; height: 28px; background: #22c55e; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">S</div>`,
      className: 'custom-div-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker([shelter.coordinates.lat, shelter.coordinates.lng], { icon: shelterIcon })
      .addTo(mapRef.current)
      .bindPopup(`<strong>${shelter.name}</strong><br/>${shelter.address}`);

    // Fetch and draw route from OSRM
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/walking/${userLocation.lng},${userLocation.lat};${shelter.coordinates.lng},${shelter.coordinates.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes && data.routes[0] && mapRef.current) {
          const coordinates = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );

          // Draw white background line for visibility
          L.polyline(coordinates, {
            color: '#ffffff',
            weight: 10,
            opacity: 0.5,
          }).addTo(mapRef.current);

          // Draw the route with a highlighted style
          L.polyline(coordinates, {
            color: '#6366f1',
            weight: 6,
            opacity: 0.8,
          }).addTo(mapRef.current);

          // Fit bounds to show entire route
          const bounds = L.latLngBounds([
            [userLocation.lat, userLocation.lng],
            [shelter.coordinates.lat, shelter.coordinates.lng]
          ]);
          mapRef.current.fitBounds(bounds.pad(0.2));

          // Add distance info
          const distanceKm = (data.routes[0].distance / 1000).toFixed(1);
          const durationMins = Math.round(data.routes[0].duration / 60);
          
          L.popup()
            .setLatLng([
              (userLocation.lat + shelter.coordinates.lat) / 2,
              (userLocation.lng + shelter.coordinates.lng) / 2
            ])
            .setContent(`<strong>Walking Route</strong><br/>${distanceKm} km • ~${durationMins} mins`)
            .addTo(mapRef.current);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback: draw straight line
        if (mapRef.current) {
          L.polyline([
            [userLocation.lat, userLocation.lng],
            [shelter.coordinates.lat, shelter.coordinates.lng]
          ], {
            color: '#6366f1',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10',
          }).addTo(mapRef.current);
        }
      }
    };

    fetchRoute();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [userLocation, shelter, locationName]);

  return (
    <div ref={mapContainerRef} className="w-full h-full" />
  );
}
