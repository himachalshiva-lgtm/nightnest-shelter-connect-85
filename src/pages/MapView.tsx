import { useState, useEffect } from 'react';
import { MapPin, Bed, Users, Clock, Navigation, Locate, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockShelters } from '@/data/mockData';
import { Shelter } from '@/types/shelter';
import { cn } from '@/lib/utils';
import LeafletMap from '@/components/LeafletMap';
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

export default function MapView() {
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [sheltersWithDistance, setSheltersWithDistance] = useState<(Shelter & { distance?: number })[]>(mockShelters);
  const [isLocating, setIsLocating] = useState(false);

  // Update distances when user location changes
  useEffect(() => {
    if (userLocation) {
      const withDistances = getNearestShelters(userLocation, mockShelters, false);
      setSheltersWithDistance(withDistances);
    }
  }, [userLocation]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Map View</h1>
          <p className="text-muted-foreground mt-1">Real-time shelter locations with GPS navigation</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGetLocation}
          disabled={isLocating}
        >
          <Locate className="h-4 w-4 mr-2" />
          {isLocating ? 'Locating...' : 'My Location'}
        </Button>
      </div>

      {/* Free Map Notice */}
      <div className="p-3 rounded-lg bg-success/10 border border-success/20">
        <p className="text-sm text-success">
          ✓ Using OpenStreetMap - completely free, no API key required!
        </p>
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
          <LeafletMap
            shelters={mockShelters}
            selectedShelter={selectedShelter}
            onShelterSelect={setSelectedShelter}
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
