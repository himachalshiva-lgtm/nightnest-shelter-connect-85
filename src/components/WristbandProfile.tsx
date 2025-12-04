import { WristbandProfile as WristbandProfileType } from '@/types/shelter';
import { 
  User, 
  Calendar, 
  Building2, 
  Heart, 
  MapPin, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { calculateDistance, formatDistance } from '@/lib/geoUtils';

interface WristbandProfileProps {
  profile: WristbandProfileType | null;
  open: boolean;
  onClose: () => void;
  onCheckIn: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

export function WristbandProfileView({ profile, open, onClose, onCheckIn, userLocation }: WristbandProfileProps) {
  if (!profile) return null;

  const distance = userLocation && profile.recommendedShelter
    ? calculateDistance(userLocation, profile.recommendedShelter.coordinates)
    : null;

  const statusConfig = {
    available: { label: 'Available', className: 'bg-success/20 text-success border-success/30' },
    limited: { label: 'Limited', className: 'bg-warning/20 text-warning border-warning/30' },
    full: { label: 'Full', className: 'bg-danger/20 text-danger border-danger/30' },
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" />
            Wristband Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Wristband ID */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Wristband ID</p>
              <p className="text-lg font-mono font-semibold text-primary">{profile.wristbandId}</p>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {profile.checkInCount} visits
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">Last Check-in</span>
              </div>
              <p className="font-semibold text-foreground">{profile.lastCheckIn}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">Last Shelter</span>
              </div>
              <p className="font-semibold text-foreground text-sm">{profile.lastShelter}</p>
            </div>
          </div>

          {/* Health Notes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Health Notes</span>
            </div>
            <div className="space-y-2">
              {profile.healthNotes.map((note, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20"
                >
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Shelter */}
          {profile.recommendedShelter && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Recommended Shelter</span>
              </div>
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{profile.recommendedShelter.name}</h4>
                  <Badge 
                    variant="outline" 
                    className={cn("border", statusConfig[profile.recommendedShelter.status].className)}
                  >
                    {statusConfig[profile.recommendedShelter.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{profile.recommendedShelter.address}</p>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="text-primary font-medium">
                    {profile.recommendedShelter.availableBeds} beds available
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {profile.recommendedShelter.checkInTime}
                  </span>
                  {distance !== null && (
                    <span className="text-accent flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {formatDistance(distance)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="scan" className="flex-1" onClick={onCheckIn}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Check In to Shelter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
