import { useState, useEffect } from 'react';
import { Users, Building2, Bed, CreditCard } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { ShelterCard } from '@/components/ShelterCard';
import { ScanButton } from '@/components/ScanButton';
import { WristbandScanner } from '@/components/WristbandScanner';
import { WristbandProfileView } from '@/components/WristbandProfile';
import { mockDashboardStats, mockShelters, generateWristbandProfile } from '@/data/mockData';
import { WristbandProfile } from '@/types/shelter';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<WristbandProfile | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get user location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to NYC if geolocation fails
          setUserLocation({ lat: 40.7580, lng: -73.9855 });
        }
      );
    } else {
      setUserLocation({ lat: 40.7580, lng: -73.9855 });
    }
  }, []);

  const handleScan = (wristbandId: string) => {
    setScannerOpen(false);
    const profile = generateWristbandProfile(wristbandId, userLocation || undefined);
    setCurrentProfile(profile);
    setProfileOpen(true);
  };

  const handleCheckIn = () => {
    setProfileOpen(false);
    toast({
      title: "Check-in Successful",
      description: `${currentProfile?.wristbandId} has been checked in to ${currentProfile?.recommendedShelter?.name}.`,
    });
    setCurrentProfile(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time shelter overview</p>
        </div>
        <ScanButton onClick={() => setScannerOpen(true)} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Check-ins"
          value={mockDashboardStats.totalCheckIns.toLocaleString()}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Shelters"
          value={mockDashboardStats.activeShelters}
          icon={Building2}
        />
        <StatCard
          title="Available Beds"
          value={mockDashboardStats.availableBeds}
          icon={Bed}
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          title="Wristbands Registered"
          value={mockDashboardStats.registeredWristbands.toLocaleString()}
          icon={CreditCard}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Shelters Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Shelter Status</h2>
          <button 
            onClick={() => navigate('/shelters')}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockShelters.slice(0, 4).map((shelter) => (
            <ShelterCard 
              key={shelter.id} 
              shelter={shelter}
              onClick={() => navigate(`/shelters/${shelter.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <WristbandScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
      <WristbandProfileView
        profile={currentProfile}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onCheckIn={handleCheckIn}
        userLocation={userLocation}
      />
    </div>
  );
}
