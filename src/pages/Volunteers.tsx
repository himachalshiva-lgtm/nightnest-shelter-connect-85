import { Users, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import { mockShelters } from '@/data/mockData';
import { cn } from '@/lib/utils';

const volunteerShifts = [
  { id: 1, name: 'Sarah Johnson', shelter: 'Hope Haven Center', shift: 'Evening', status: 'active' },
  { id: 2, name: 'Michael Chen', shelter: 'Sunrise Shelter', shift: 'Night', status: 'active' },
  { id: 3, name: 'Emily Davis', shelter: 'Safe Harbor House', shift: 'Morning', status: 'upcoming' },
  { id: 4, name: 'James Wilson', shelter: 'New Beginnings Refuge', shift: 'Evening', status: 'active' },
  { id: 5, name: 'Maria Garcia', shelter: 'Community Care Center', shift: 'Night', status: 'completed' },
];

export default function Volunteers() {
  const totalVolunteers = mockShelters.reduce((sum, s) => sum + s.volunteers, 0);
  const activeVolunteers = volunteerShifts.filter(v => v.status === 'active').length;
  const sheltersNeedingHelp = mockShelters.filter(s => s.volunteers < 5).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Volunteers</h1>
        <p className="text-muted-foreground mt-1">Manage volunteer shifts and assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Volunteers"
          value={totalVolunteers}
          icon={Users}
        />
        <StatCard
          title="Currently Active"
          value={activeVolunteers}
          icon={Clock}
        />
        <StatCard
          title="Shifts Today"
          value={12}
          icon={Calendar}
        />
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Shelters Need Help</p>
              <p className="text-3xl font-bold tracking-tight text-warning">{sheltersNeedingHelp}</p>
            </div>
            <div className="rounded-xl bg-warning/10 p-3">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Shifts Table */}
      <div className="stat-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Today's Shifts</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Volunteer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Shelter</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Shift</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {volunteerShifts.map((volunteer) => (
                <tr key={volunteer.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {volunteer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">{volunteer.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{volunteer.shelter}</td>
                  <td className="py-3 px-4 text-muted-foreground">{volunteer.shift}</td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "border",
                        volunteer.status === 'active' && "bg-success/20 text-success border-success/30",
                        volunteer.status === 'upcoming' && "bg-warning/20 text-warning border-warning/30",
                        volunteer.status === 'completed' && "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {volunteer.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shelters Needing Volunteers */}
      <div className="stat-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Shelters Needing Volunteers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockShelters.filter(s => s.volunteers < 5).map((shelter) => (
            <div 
              key={shelter.id}
              className="p-4 rounded-xl bg-warning/5 border border-warning/20"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">{shelter.name}</h4>
                <Badge variant="outline" className="border-warning/30 text-warning">
                  {shelter.volunteers} volunteers
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{shelter.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
