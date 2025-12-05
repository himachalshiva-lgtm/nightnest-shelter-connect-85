import { Users, Calendar, Clock, AlertTriangle, Mail, Phone, MapPin, Coins, TrendingUp } from 'lucide-react';
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
  totalTokensEarned: number;
  shiftsCompleted: number;
}

const TOKENS_PER_SHIFT = 50;

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
    startDate: '2024-01-15',
    totalTokensEarned: 1200,
    shiftsCompleted: 24
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
    startDate: '2024-03-10',
    totalTokensEarned: 650,
    shiftsCompleted: 13
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
    startDate: '2023-11-22',
    totalTokensEarned: 2500,
    shiftsCompleted: 50
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
    startDate: '2024-02-05',
    totalTokensEarned: 800,
    shiftsCompleted: 16
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
    startDate: '2024-04-18',
    totalTokensEarned: 350,
    shiftsCompleted: 7
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
    startDate: '2023-09-01',
    totalTokensEarned: 1850,
    shiftsCompleted: 37
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
    startDate: '2024-01-20',
    totalTokensEarned: 900,
    shiftsCompleted: 18
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
  const totalTokensDistributed = volunteers.reduce((sum, v) => sum + v.totalTokensEarned, 0);
  const totalShiftsCompleted = volunteers.reduce((sum, v) => sum + v.shiftsCompleted, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Volunteers</h1>
        <p className="text-muted-foreground mt-1">Manage volunteer shifts and token rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
          title="Shifts Completed"
          value={totalShiftsCompleted}
          icon={Calendar}
        />
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
              <p className="text-3xl font-bold tracking-tight text-primary">{totalTokensDistributed.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3">
              <Coins className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
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

      {/* Token Rewards Info */}
      <div className="stat-card bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <Coins className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Virtual Token Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Volunteers earn <span className="font-semibold text-primary">{TOKENS_PER_SHIFT} tokens</span> for each completed shift. 
              Tokens can be redeemed for rewards, recognition, or donated to shelter programs.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm text-muted-foreground">Token Rate</p>
            <p className="text-2xl font-bold text-primary">{TOKENS_PER_SHIFT}<span className="text-sm font-normal text-muted-foreground">/shift</span></p>
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
                <TableHead>Shifts Done</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-primary" />
                    Tokens
                  </div>
                </TableHead>
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
                  <TableCell>
                    <div>
                      <p className="text-foreground">{volunteer.schedule}</p>
                      <p className="text-xs text-muted-foreground">{volunteer.shift}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{volunteer.shiftsCompleted}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">{volunteer.totalTokensEarned.toLocaleString()}</span>
                      <TrendingUp className="h-3.5 w-3.5 text-success" />
                    </div>
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

      {/* Top Earners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Token Earners</h3>
          <div className="space-y-3">
            {[...volunteers].sort((a, b) => b.totalTokensEarned - a.totalTokensEarned).slice(0, 5).map((volunteer, index) => (
              <div 
                key={volunteer.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                    index === 0 && "bg-yellow-500/20 text-yellow-500",
                    index === 1 && "bg-gray-400/20 text-gray-400",
                    index === 2 && "bg-amber-600/20 text-amber-600",
                    index > 2 && "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{volunteer.name}</p>
                    <p className="text-xs text-muted-foreground">{volunteer.shiftsCompleted} shifts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">{volunteer.totalTokensEarned.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shelters Needing Volunteers */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Shelters Needing Volunteers</h3>
          <div className="space-y-3">
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
    </div>
  );
}
