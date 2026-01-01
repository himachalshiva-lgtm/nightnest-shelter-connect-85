import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Leaf, Package, Handshake, TrendingUp } from 'lucide-react';
import { ShelterOverview } from '@/components/admin/ShelterOverview';
import { NGOPartnerPortal } from '@/components/admin/NGOPartnerPortal';
import { ImpactSummary } from '@/components/admin/ImpactSummary';

interface ShelterData {
  id: string;
  name: string;
  address: string;
  city: string;
  total_beds: number;
  phone: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
}

export default function AdminDashboard() {
  const { shelterId, user } = useAuthContext();
  const { toast } = useToast();
  const [shelter, setShelter] = useState<ShelterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentOccupancy, setCurrentOccupancy] = useState(0);

  useEffect(() => {
    async function fetchShelterData() {
      if (!shelterId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('shelters')
          .select('*')
          .eq('id', shelterId)
          .maybeSingle();

        if (error) throw error;
        setShelter(data);

        // Get today's check-ins for occupancy
        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabase
          .from('check_in_history')
          .select('*', { count: 'exact', head: true })
          .eq('shelter_id', shelterId)
          .gte('check_in_time', today);

        setCurrentOccupancy(count || 0);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchShelterData();
  }, [shelterId, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <p className="text-xl text-muted-foreground">No shelter assigned to your account.</p>
        <p className="text-sm text-muted-foreground">Please contact support to get assigned to a shelter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Shelter Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage {shelter.name} - Full administrative access
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{shelter.total_beds}</span>
              <span className="text-muted-foreground">beds</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold">{currentOccupancy}</span>
              <span className="text-muted-foreground">/ {shelter.total_beds}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Beds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{Math.max(0, shelter.total_beds - currentOccupancy)}</span>
              <span className="text-muted-foreground">beds</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">
                {shelter.total_beds > 0 
                  ? Math.round((currentOccupancy / shelter.total_beds) * 100) 
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ngo" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            NGO Portal
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ShelterOverview shelter={shelter} currentOccupancy={currentOccupancy} />
        </TabsContent>

        <TabsContent value="ngo">
          <NGOPartnerPortal shelterId={shelter.id} shelterName={shelter.name} />
        </TabsContent>

        <TabsContent value="impact">
          <ImpactSummary shelterId={shelter.id} shelterName={shelter.name} totalBeds={shelter.total_beds} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
