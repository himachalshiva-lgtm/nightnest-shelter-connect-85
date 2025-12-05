import { useState, useEffect } from 'react';
import { MapPin, Bed, Users, Clock, Navigation, Locate, Settings, Route, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockShelters } from '@/data/mockData';
import { Shelter } from '@/types/shelter';
import { cn } from '@/lib/utils';
import MapboxMap from '@/components/MapboxMap';
import { calculateDistance, formatDistance, getNearestShelters } from '@/lib/geoUtils';
import { toast } from 'sonner';

const statusConfig = {
  available: {
    color: 'bg-success',
    label: 'Available',
  },
  limited: {
    color: 'bg-warning',
    label: 'Limited',
  },
  full: {
    color: 'bg-danger',
    label: 'Full',
  },
};

const MAPBOX_TOKEN_KEY = 'nightnest_mapbox_token';

export default function MapView() {
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [sheltersWithDistance, setSheltersWithDistance] = useState<(Shelter & { distance?: number })[]>(mockShelters);
  const [isLocating, setIsLocating] = useState(false);
  const [tokenError, setTokenError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved token on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(MAPBOX_TOKEN_KEY);
      if (savedToken && savedToken.startsWith('pk.')) {
        setMapboxToken(savedToken);
        setTokenInput(savedToken);
      }
    } catch (error) {
      console.error('Error loading token from localStorage:', error);
    }
    setIsLoading(false);
  }, []);

  // Update distances when user location changes
  useEffect(() => {
    if (userLocation) {
      const withDistances = getNearestShelters(userLocation, mockShelters, false);
      setSheltersWithDistance(withDistances);
    }
  }, [userLocation]);

  const validateToken = (token: string): boolean => {
    // Mapbox public tokens start with 'pk.'
    if (!token || !token.startsWith('pk.')) {
      setTokenError('Token must start with "pk." (public token)');
      return false;
    }
    if (token.length < 50) {
      setTokenError('Token appears too short. Please check your token.');
      return false;
    }
    setTokenError('');
    return true;
  };

  const handleSaveToken = () => {
    const trimmedToken = tokenInput.trim();
    if (validateToken(trimmedToken)) {
      try {
        localStorage.setItem(MAPBOX_TOKEN_KEY, trimmedToken);
        setMapboxToken(trimmedToken);
        toast.success('Mapbox token saved successfully');
      } catch (error) {
        toast.error('Failed to save token');
        console.error('Error saving token:', error);
      }
    }
  };

  const handleClearToken = () => {
    try {
      localStorage.removeItem(MAPBOX_TOKEN_KEY);
      setMapboxToken('');
      setTokenInput('');
      setTokenError('');
      toast.info('Token cleared');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
          toast.success('Location updated');
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use mock NYC location as fallback
          setUserLocation({ lat: 40.7484, lng: -73.9857 });
          setIsLocating(false);
          toast.info('Using default location (NYC)');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setUserLocation({ lat: 40.7484, lng: -73.9857 });
      setIsLocating(false);
      toast.info('Geolocation not supported, using default location');
    }
  };

  const handleNavigate = () => {
    if (selectedShelter) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedShelter.coordinates.lat},${selectedShelter.coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Map View</h1>
          <p className="text-muted-foreground mt-1">Configure Mapbox to view shelter locations</p>
        </div>

        <div className="stat-card max-w-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Mapbox Setup Required</h3>
              <p className="text-sm text-muted-foreground">Enter your Mapbox public token to enable maps</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="pk.eyJ1Ijoi..."
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  setTokenError('');
                }}
                className={cn("font-mono text-sm", tokenError && "border-danger")}
              />
              {tokenError && (
                <div className="flex items-center gap-2 text-danger text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{tokenError}</span>
                </div>
              )}
            </div>
            <Button onClick={handleSaveToken} className="w-full" disabled={!tokenInput.trim()}>
              Save Token
            </Button>
          </div>

          <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
            <p className="text-sm font-medium text-foreground">How to get your token:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a> and create a free account</li>
              <li>Navigate to Account → Tokens</li>
              <li>Copy your Default public token (starts with "pk.")</li>
              <li>Paste it above and click Save</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Map View</h1>
          <p className="text-muted-foreground mt-1">Real-time shelter locations with GPS navigation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetLocation}
            disabled={isLocating}
          >
            <Locate className="h-4 w-4 mr-2" />
            {isLocating ? 'Locating...' : 'My Location'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearToken}
            title="Clear Mapbox token"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-warning" />
          <span className="text-sm text-muted-foreground">Limited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-danger" />
          <span className="text-sm text-muted-foreground">Full</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">Your Location</span>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2 stat-card min-h-[500px] relative p-0 overflow-hidden">
          <MapboxMap
            shelters={mockShelters}
            selectedShelter={selectedShelter}
            onShelterSelect={setSelectedShelter}
            mapboxToken={mapboxToken}
            userLocation={userLocation}
            showRoute={showRoute}
          />
        </div>

        {/* Sidebar - Shelter Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Shelter Details</h3>

          {selectedShelter ? (
            <div className="stat-card space-y-4">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-foreground">{selectedShelter.name}</h4>
                <Badge
                  variant="outline"
                  className={cn(
                    'border',
                    selectedShelter.status === 'available' && 'bg-success/20 text-success border-success/30',
                    selectedShelter.status === 'limited' && 'bg-warning/20 text-warning border-warning/30',
                    selectedShelter.status === 'full' && 'bg-danger/20 text-danger border-danger/30'
                  )}
                >
                  {statusConfig[selectedShelter.status].label}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {selectedShelter.address}
              </p>

              {userLocation && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Navigation className="h-4 w-4" />
                  <span className="font-medium">
                    {formatDistance(
                      calculateDistance(userLocation, selectedShelter.coordinates)
                    )}{' '}
                    away
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Bed className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Beds</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {selectedShelter.availableBeds}/{selectedShelter.totalBeds}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Volunteers</span>
                  </div>
                  <p className="font-semibold text-foreground">{selectedShelter.volunteers}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {selectedShelter.checkInTime} - {selectedShelter.checkOutTime}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoute(!showRoute)}
                  disabled={!userLocation}
                >
                  <Route className="h-4 w-4 mr-2" />
                  {showRoute ? 'Hide Route' : 'Show Route'}
                </Button>
                <Button size="sm" onClick={handleNavigate}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate
                </Button>
              </div>
            </div>
          ) : (
            <div className="stat-card text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a shelter marker to view details</p>
            </div>
          )}

          {/* Nearest Shelters List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {userLocation ? 'Nearest Shelters' : 'All Shelters'}
            </h4>
            {sheltersWithDistance.map((shelter) => (
              <button
                key={shelter.id}
                onClick={() => setSelectedShelter(shelter)}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-colors',
                  selectedShelter?.id === shelter.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-secondary/50 hover:bg-secondary'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{shelter.name}</span>
                  <div className="flex items-center gap-2">
                    {shelter.distance !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistance(shelter.distance)}
                      </span>
                    )}
                    <div className={cn('h-2 w-2 rounded-full', statusConfig[shelter.status].color)} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
