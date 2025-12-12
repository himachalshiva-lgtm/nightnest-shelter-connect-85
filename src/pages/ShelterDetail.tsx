import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bed, 
  Users, 
  Utensils, 
  Clock, 
  Phone, 
  MapPin,
  Wifi,
  ShowerHead,
  Lock,
  Briefcase,
  Heart,
  Shirt,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockShelters } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ShelterLocationMap from '@/components/ShelterLocationMap';
const amenityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Showers': ShowerHead,
  'Lockers': Lock,
  'Job Assistance': Briefcase,
  'Medical Support': Heart,
  'Counseling': Heart,
  'Meals': Utensils,
  'Laundry': Shirt,
};

const statusConfig = {
  available: {
    label: 'Available',
    className: 'bg-success/20 text-success border-success/30',
    barColor: 'bg-success',
  },
  limited: {
    label: 'Limited Space',
    className: 'bg-warning/20 text-warning border-warning/30',
    barColor: 'bg-warning',
  },
  full: {
    label: 'Full',
    className: 'bg-danger/20 text-danger border-danger/30',
    barColor: 'bg-danger',
  },
};

export default function ShelterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const shelter = mockShelters.find(s => s.id === id);

  const handleCall = () => {
    window.open(`tel:${shelter?.phone}`);
    toast({
      title: "Calling Shelter",
      description: `Initiating call to ${shelter?.phone}`,
    });
  };

  const handleGetDirections = () => {
    if (shelter) {
      // Create a link and trigger navigation (avoids popup blockers)
      const link = document.createElement('a');
      link.href = `https://www.openstreetmap.org/?mlat=${shelter.coordinates.lat}&mlon=${shelter.coordinates.lng}#map=16/${shelter.coordinates.lat}/${shelter.coordinates.lng}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Opening Directions",
        description: `Getting directions to ${shelter.name}`,
      });
    }
  };

  if (!shelter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground mb-4">Shelter not found</p>
        <Button variant="outline" onClick={() => navigate('/shelters')}>
          Back to Shelters
        </Button>
      </div>
    );
  }

  const status = statusConfig[shelter.status];
  const occupancyRate = ((shelter.totalBeds - shelter.availableBeds) / shelter.totalBeds) * 100;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{shelter.name}</h1>
            <Badge variant="outline" className={cn("border", status.className)}>
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{shelter.address}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCall}>
            <Phone className="h-4 w-4 mr-2" />
            {shelter.phone}
          </Button>
          <Button variant="scan" onClick={handleGetDirections}>
            <Navigation className="h-4 w-4 mr-2" />
            Get Directions
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Bed className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {shelter.availableBeds}/{shelter.totalBeds}
              </p>
              <p className="text-sm text-muted-foreground">Beds Available</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all", status.barColor)}
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{occupancyRate.toFixed(0)}% occupied</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{shelter.volunteers}</p>
              <p className="text-sm text-muted-foreground">Active Volunteers</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Utensils className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {shelter.mealsAvailable ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-muted-foreground">Meals Available</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {shelter.checkInTime}
              </p>
              <p className="text-sm text-muted-foreground">Check-in Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Amenities */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Amenities</h3>
          <div className="grid grid-cols-2 gap-4">
            {shelter.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity] || Bed;
              return (
                <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Location</h3>
          <div className="aspect-video rounded-xl overflow-hidden">
            <ShelterLocationMap 
              coordinates={shelter.coordinates}
              name={shelter.name}
              address={shelter.address}
            />
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="stat-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Operating Hours</h3>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Clock className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-in Opens</p>
              <p className="font-semibold text-foreground">{shelter.checkInTime}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-out Time</p>
              <p className="font-semibold text-foreground">{shelter.checkOutTime}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
