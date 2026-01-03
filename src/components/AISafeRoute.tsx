import { useState, useEffect } from 'react';
import { Navigation, Shield, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shelter } from '@/types/shelter';
import { useNavigate } from 'react-router-dom';

// Mockup Delhi locations for demonstration
const DELHI_MOCKUP_LOCATIONS = [
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'India Gate', lat: 28.6129, lng: 77.2295 },
  { name: 'Old Delhi Railway Station', lat: 28.6618, lng: 77.2265 },
  { name: 'Chandni Chowk', lat: 28.6505, lng: 77.2303 },
  { name: 'Karol Bagh', lat: 28.6523, lng: 77.1901 },
];

interface AISafeRouteProps {
  userLocation: { lat: number; lng: number } | null;
  shelters: Shelter[];
  onSelectShelter: (shelter: Shelter) => void;
}

export function AISafeRoute({ userLocation }: AISafeRouteProps) {
  const navigate = useNavigate();
  const [mockupLocation, setMockupLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  // Set a random mockup location when component mounts or when user location changes
  useEffect(() => {
    if (!userLocation) {
      const randomLocation = DELHI_MOCKUP_LOCATIONS[Math.floor(Math.random() * DELHI_MOCKUP_LOCATIONS.length)];
      setMockupLocation(randomLocation);
    }
  }, [userLocation]);

  const handleOpenRouteFinder = () => {
    navigate('/safe-route');
  };

  return (
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
              Demo location: <strong>{mockupLocation.name}</strong>
            </p>
          </div>
        )}

        <Button 
          onClick={handleOpenRouteFinder}
          className="w-full"
          variant="scan"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Open Safe Route Finder
        </Button>
      </CardContent>
    </Card>
  );
}
