import { Users, Calendar, Clock, AlertTriangle, Mail, Phone, MapPin } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import { mockShelters } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  shelter: string;
  role: string;
  schedule: string;
  shift: string;
  status: 'active' | 'upcoming' | 'completed' | 'off-duty';
  hoursThisMonth: number;
  startDate: string;
}

const volunteers: Volunteer[] = [
  { 
    id: 1, 
    name: 'Sarah Johnson', 
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    shelter: 'Hope Haven Center', 
    role: 'Shift Lead',
    schedule: 'Mon, Wed, Fri',
    shift: 'Evening (4pm-10pm)', 
    status: 'active',
    hoursThisMonth: 48,
    startDate: '2024-01-15'
  },
  { 
    id: 2, 
    name: 'Michael Chen', 
    email: 'mchen@email.com',
    phone: '(555) 234-5678',
    shelter: 'Sunrise Shelter', 
    role: 'Kitchen Staff',
    schedule: 'Tue, Thu, Sat',
    shift: 'Night (10pm-6am)', 
    status: 'active',
    hoursThisMonth: 32,
    startDate: '2024-03-10'
  },
  { 
    id: 3, 
    name: 'Emily Davis', 
    email: 'emily.davis@email.com',
    phone: '(555) 345-6789',
    shelter: 'Safe Harbor House', 
    role: 'Intake Coordinator',
    schedule: 'Mon-Fri',
    shift: 'Morning (6am-12pm)', 
    status: 'upcoming',
    hoursThisMonth: 60,
    startDate: '2023-11-22'
  },
  { 
    id: 4, 
    name: 'James Wilson', 
    email: 'jwilson@email.com',
    phone: '(555) 456-7890',
    shelter: 'New Beginnings Refuge', 
    role: 'Security',
    schedule: 'Fri, Sat, Sun',
    shift: 'Evening (4pm-10pm)', 
    status: 'active',
    hoursThisMonth: 24,
    startDate: '2024-02-05'
  },
  { 
    id: 5, 
    name: 'Maria Garcia', 
    email: 'mgarcia@email.com',
    phone: '(555) 567-8901',
    shelter: 'Community Care Center', 
    role: 'Case Worker',
    schedule: 'Mon, Wed',
    shift: 'Night (10pm-6am)', 
    status: 'completed',
    hoursThisMonth: 16,
    startDate: '2024-04-18'
  },
  { 
    id: 6, 
    name: 'David Kim', 
    email: 'dkim@email.com',
    phone: '(555) 678-9012',
    shelter: 'Hope Haven Center', 
    role: 'Medical Support',
    schedule: 'Tue, Thu',
    shift: 'Morning (6am-12pm)', 
    status: 'off-duty',
    hoursThisMonth: 20,
    startDate: '2023-09-01'
  },
  { 
    id: 7, 
    name: 'Lisa Thompson', 
    email: 'lthompson@email.com',
    phone: '(555) 789-0123',
    shelter: 'Sunrise Shelter', 
    role: 'Shift Lead',
    schedule: 'Wed, Fri, Sun',
    shift: 'Evening (4pm-10pm)', 
    status: 'active',
    hoursThisMonth: 36,
    startDate: '2024-01-20'
  },
];

const getStatusStyles = (status: Volunteer['status']) => {
  switch (status) {
    case 'active':
      return 'bg-success/20 text-success border-success/30';
    case 'upcoming':
      return 'bg-warning/20 text-warning border-warning/30';
    case 'completed':
      return 'bg-muted text-muted-foreground border-border';
    case 'off-duty':
      return 'bg-secondary text-secondary-foreground border-border';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export default function Volunteers() {
  const totalVolunteers = mockShelters.reduce((sum, s) => sum + s.volunteers, 0);
  const activeVolunteers = volunteers.filter(v => v.status === 'active').length;
  const sheltersNeedingHelp = mockShelters.filter(s => s.volunteers < 5).length;
  const totalHoursThisMonth = volunteers.reduce((sum, v) => sum + v.hoursThisMonth, 0);

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
          title="Hours This Month"
          value={totalHoursThisMonth}
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

      {/* Volunteer Directory Table */}
      <div className="stat-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Volunteer Directory</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Volunteer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Assigned Shelter</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Current Shift</TableHead>
                <TableHead>Hours (Month)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.map((volunteer) => (
                <TableRow key={volunteer.id} className="border-border/50 hover:bg-secondary/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {volunteer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{volunteer.name}</p>
                        <p className="text-xs text-muted-foreground">Since {new Date(volunteer.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{volunteer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{volunteer.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{volunteer.shelter}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                      {volunteer.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{volunteer.schedule}</TableCell>
                  <TableCell className="text-muted-foreground">{volunteer.shift}</TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{volunteer.hoursThisMonth}h</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={cn("border capitalize", getStatusStyles(volunteer.status))}
                    >
                      {volunteer.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
