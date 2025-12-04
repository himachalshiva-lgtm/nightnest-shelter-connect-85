import { Shelter } from '@/types/shelter';
import { Bed, Users, Utensils, Clock, MapPin, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ShelterCardProps {
  shelter: Shelter;
  onClick?: () => void;
}

const statusConfig = {
  available: {
    label: 'Available',
    className: 'bg-success/20 text-success border-success/30',
  },
  limited: {
    label: 'Limited',
    className: 'bg-warning/20 text-warning border-warning/30',
  },
  full: {
    label: 'Full',
    className: 'bg-danger/20 text-danger border-danger/30',
  },
};

export function ShelterCard({ shelter, onClick }: ShelterCardProps) {
  const status = statusConfig[shelter.status];

  return (
    <div 
      onClick={onClick}
      className="stat-card cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {shelter.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" />
            {shelter.address}
          </p>
        </div>
        <Badge variant="outline" className={cn("border", status.className)}>
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="p-2 rounded-lg bg-secondary">
            <Bed className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{shelter.availableBeds}/{shelter.totalBeds}</p>
            <p className="text-xs text-muted-foreground">Beds</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="p-2 rounded-lg bg-secondary">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{shelter.volunteers}</p>
            <p className="text-xs text-muted-foreground">Volunteers</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{shelter.checkInTime} - {shelter.checkOutTime}</span>
          </div>
          {shelter.mealsAvailable && (
            <div className="flex items-center gap-1.5 text-sm text-success">
              <Utensils className="h-4 w-4" />
              <span>Meals</span>
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}
