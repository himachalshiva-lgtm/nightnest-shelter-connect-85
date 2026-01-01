import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Phone, Clock, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ShelterOverviewProps {
  shelter: {
    id: string;
    name: string;
    address: string;
    city: string;
    total_beds: number;
    phone: string | null;
    check_in_time: string | null;
    check_out_time: string | null;
  };
  currentOccupancy: number;
}

interface CheckInLog {
  id: string;
  wristband_id: string;
  check_in_time: string;
  check_out_time: string | null;
  notes: string | null;
}

export function ShelterOverview({ shelter, currentOccupancy }: ShelterOverviewProps) {
  const [checkInLogs, setCheckInLogs] = useState<CheckInLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCheckInLogs() {
      const { data, error } = await supabase
        .from('check_in_history')
        .select('*')
        .eq('shelter_id', shelter.id)
        .order('check_in_time', { ascending: false })
        .limit(50);

      if (!error && data) {
        setCheckInLogs(data);
      }
      setIsLoading(false);
    }

    fetchCheckInLogs();

    // Real-time subscription for new check-ins
    const channel = supabase
      .channel('check_in_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'check_in_history',
          filter: `shelter_id=eq.${shelter.id}`,
        },
        (payload) => {
          setCheckInLogs((prev) => [payload.new as CheckInLog, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shelter.id]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Shelter Details */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Shelter Details</CardTitle>
          <CardDescription>Basic information about your shelter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{shelter.name}</p>
              <p className="text-sm text-muted-foreground">{shelter.address}</p>
              <p className="text-sm text-muted-foreground">{shelter.city}</p>
            </div>
          </div>

          {shelter.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm">{shelter.phone}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              <p>Check-in: {shelter.check_in_time || 'N/A'}</p>
              <p>Check-out: {shelter.check_out_time || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              <p>Capacity: {shelter.total_beds} beds</p>
              <p>Current: {currentOccupancy} occupied</p>
            </div>
          </div>

          <div className="pt-2">
            <Badge variant={currentOccupancy >= shelter.total_beds ? 'destructive' : currentOccupancy >= shelter.total_beds * 0.8 ? 'secondary' : 'default'}>
              {currentOccupancy >= shelter.total_beds 
                ? 'Full' 
                : currentOccupancy >= shelter.total_beds * 0.8 
                  ? 'Limited Availability' 
                  : 'Available'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Entry/Exit Logs */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Entry/Exit Logs
          </CardTitle>
          <CardDescription>Recent check-in and check-out activity (read-only)</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : checkInLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Calendar className="h-8 w-8 mb-2" />
                <p>No check-in logs yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkInLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${log.check_out_time ? 'bg-muted-foreground' : 'bg-emerald-500'}`} />
                      <div>
                        <p className="font-medium text-sm">{log.wristband_id}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.check_in_time), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.check_out_time ? 'outline' : 'default'} className="text-xs">
                        {log.check_out_time ? 'Checked Out' : 'Checked In'}
                      </Badge>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
