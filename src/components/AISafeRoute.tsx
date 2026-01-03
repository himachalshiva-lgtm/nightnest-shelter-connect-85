import { useState, useEffect, useRef } from 'react';
import { Navigation, Shield, Loader2, MapPin, Clock, Phone, AlertTriangle, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shelter } from '@/types/shelter';
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

interface AISafeRouteProps {
  userLocation: { lat: number; lng: number } | null;
  shelters: Shelter[];
  onSelectShelter: (shelter: Shelter) => void;
}

// Mockup Delhi locations for demonstration
const DELHI_MOCKUP_LOCATIONS = [
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'India Gate', lat: 28.6129, lng: 77.2295 },
  { name: 'Old Delhi Railway Station', lat: 28.6618, lng: 77.2265 },
  { name: 'Chandni Chowk', lat: 28.6505, lng: 77.2303 },
  { name: 'Karol Bagh', lat: 28.6523, lng: 77.1901 },
];

export function AISafeRoute({ userLocation, shelters, onSelectShelter }: AISafeRouteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SafeRouteResult | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [selectedShelterForRoute, setSelectedShelterForRoute] = useState<Shelter | null>(null);
  const [mockupLocation, setMockupLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  // Set a random mockup location when component mounts or when user location changes
  useEffect(() => {
    if (!userLocation) {
      const randomLocation = DELHI_MOCKUP_LOCATIONS[Math.floor(Math.random() * DELHI_MOCKUP_LOCATIONS.length)];
      setMockupLocation(randomLocation);
    }
  }, [userLocation]);

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

    try {
      const { data, error } = await supabase.functions.invoke('ai-safe-route', {
        body: {
          userLocation: effectiveLocation,
          shelters: shelters.map(s => ({
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
          const shelter = shelters.find(s => s.id === data.routeData.recommendedShelter.id || s.name === data.routeData.recommendedShelter.name);
          if (shelter) {
            setSelectedShelterForRoute(shelter);
            setShowRouteMap(true);
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

  const handleNavigateToShelter = () => {
    if (result?.recommendedShelter) {
      const shelter = shelters.find(s => s.id === result.recommendedShelter.id || s.name === result.recommendedShelter.name);
      if (shelter) {
        setSelectedShelterForRoute(shelter);
        setShowRouteMap(true);
        onSelectShelter(shelter);
      }
    }
  };

  const openGoogleMapsDirections = () => {
    if (selectedShelterForRoute && effectiveLocation) {
      const url = `https://www.google.com/maps/dir/${effectiveLocation.lat},${effectiveLocation.lng}/${selectedShelterForRoute.coordinates.lat},${selectedShelterForRoute.coordinates.lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            AI Safe Route Finder
          </CardTitle>
          <CardDescription>
            Find the safest route to a nearby shelter based on time, lighting, and safety factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show mockup location info */}
          {!userLocation && mockupLocation && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Using demo location: <strong>{mockupLocation.name}</strong>
              </p>
            </div>
          )}

          <Button 
            onClick={handleFindSafeRoute} 
            disabled={isLoading}
            className="w-full"
            variant="scan"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calculating Safe Route...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Find Safest Route
              </>
            )}
          </Button>

          {rawResponse && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                AI Route Guidance
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rawResponse}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Recommended Shelter */}
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-success" />
                      Recommended Shelter
                    </h4>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {result.recommendedShelter.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Safety Score</p>
                    <p className={`text-2xl font-bold ${getSafetyScoreColor(result.recommendedShelter.safetyScore)}`}>
                      {result.recommendedShelter.safetyScore}/10
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{result.recommendedShelter.reason}</p>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    onClick={handleNavigateToShelter}
                  >
                    <Route className="h-4 w-4 mr-2" />
                    View Route on Map
                  </Button>
                </div>
              </div>

              {/* Walk Time */}
              {result.estimatedWalkTime && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    Estimated walking time: <strong>{result.estimatedWalkTime} minutes</strong>
                  </span>
                </div>
              )}

              {/* Safety Tips */}
              {result.safetyTips && result.safetyTips.length > 0 && (
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Safety Tips
                  </h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {result.safetyTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Emergency Contacts */}
              {result.emergencyContacts && result.emergencyContacts.length > 0 && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Emergency Contacts
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.emergencyContacts.map((contact, index) => (
                      <Badge key={index} variant="outline">
                        {contact}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Map Dialog */}
      <Dialog open={showRouteMap} onOpenChange={setShowRouteMap}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Safe Route to {selectedShelterForRoute?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <RouteMapDisplay 
              userLocation={effectiveLocation!}
              shelter={selectedShelterForRoute!}
              locationName={mockupLocation?.name || 'Your Location'}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={openGoogleMapsDirections} className="flex-1">
              <Navigation className="h-4 w-4 mr-2" />
              Open in Google Maps
            </Button>
            <Button variant="outline" onClick={() => setShowRouteMap(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
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

          // Draw the route with a highlighted style
          L.polyline(coordinates, {
            color: '#6366f1',
            weight: 6,
            opacity: 0.8,
          }).addTo(mapRef.current);

          // Also add a white background line for visibility
          L.polyline(coordinates, {
            color: '#ffffff',
            weight: 10,
            opacity: 0.5,
          }).addTo(mapRef.current).bringToBack();

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
    <div ref={mapContainerRef} className="w-full h-full min-h-[400px] rounded-lg overflow-hidden" />
  );
}
