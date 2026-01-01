import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Leaf, Users, Flame, Droplets, TreePine, Home } from 'lucide-react';

interface ImpactSummaryProps {
  shelterId: string;
  shelterName: string;
  totalBeds: number;
}

interface ImpactMetrics {
  totalPeopleSheltered: number;
  totalNights: number;
  co2Avoided: number;
  openFiresAvoided: number;
  sanitationImpact: number;
}

export function ImpactSummary({ shelterId, shelterName, totalBeds }: ImpactSummaryProps) {
  const [metrics, setMetrics] = useState<ImpactMetrics>({
    totalPeopleSheltered: 0,
    totalNights: 0,
    co2Avoided: 0,
    openFiresAvoided: 0,
    sanitationImpact: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function calculateMetrics() {
      try {
        // Get total check-ins for this shelter
        const { count: totalCheckIns } = await supabase
          .from('check_in_history')
          .select('*', { count: 'exact', head: true })
          .eq('shelter_id', shelterId);

        // Get unique wristbands (unique people)
        const { data: uniqueData } = await supabase
          .from('check_in_history')
          .select('wristband_id')
          .eq('shelter_id', shelterId);

        const uniquePeople = new Set(uniqueData?.map((d) => d.wristband_id) || []).size;

        // Calculate environmental impact estimates
        // These are simulated calculations based on research:
        // - Average person uses 2kg wood for open fire heating per night = ~3.6kg CO2
        // - Sheltering avoids open fire usage
        // - Proper sanitation vs open defecation

        const nights = totalCheckIns || 0;
        const co2Avoided = nights * 3.6; // kg CO2 per person-night
        const openFiresAvoided = nights; // One fire avoided per person-night
        const sanitationImpact = nights * 0.85; // 85% use shelter toilets

        setMetrics({
          totalPeopleSheltered: uniquePeople,
          totalNights: nights,
          co2Avoided: Math.round(co2Avoided),
          openFiresAvoided,
          sanitationImpact: Math.round(sanitationImpact),
        });
      } catch (error) {
        console.error('Error calculating metrics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    calculateMetrics();
  }, [shelterId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const impactCards = [
    {
      title: 'People Sheltered',
      value: metrics.totalPeopleSheltered,
      unit: 'unique individuals',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Shelter Nights',
      value: metrics.totalNights,
      unit: 'person-nights',
      icon: Home,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'CO₂ Emissions Avoided',
      value: metrics.co2Avoided,
      unit: 'kg CO₂',
      icon: Leaf,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      description: 'By not building new infrastructure',
    },
    {
      title: 'Open Fires Avoided',
      value: metrics.openFiresAvoided,
      unit: 'fire instances',
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      description: 'Reduced air pollution & fire hazards',
    },
    {
      title: 'Sanitation Impact',
      value: metrics.sanitationImpact,
      unit: 'toilet uses',
      icon: Droplets,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      description: 'Open defecation avoided',
    },
    {
      title: 'Trees Equivalent Saved',
      value: Math.round(metrics.co2Avoided / 21), // Average tree absorbs 21kg CO2/year
      unit: 'trees per year',
      icon: TreePine,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
      description: 'Carbon offset equivalent',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-600">
            <Leaf className="h-6 w-6" />
            Environmental & Social Impact
          </CardTitle>
          <CardDescription>
            Measuring the positive impact of {shelterName} on the community and environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            By utilizing existing government school infrastructure as night shelters, NightNest 
            helps reduce the environmental footprint of providing homeless services. These metrics 
            represent estimated environmental and social benefits.
          </p>
        </CardContent>
      </Card>

      {/* Impact Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {impactCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.unit}</p>
                  {card.description && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {card.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
          <CardDescription>Tracking towards monthly impact goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Occupancy Utilization</span>
              <span className="text-muted-foreground">
                {metrics.totalNights > 0 ? Math.min(100, Math.round((metrics.totalNights / (totalBeds * 30)) * 100)) : 0}%
              </span>
            </div>
            <Progress 
              value={metrics.totalNights > 0 ? Math.min(100, (metrics.totalNights / (totalBeds * 30)) * 100) : 0} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Carbon Reduction Goal (500kg/month)</span>
              <span className="text-muted-foreground">
                {Math.min(100, Math.round((metrics.co2Avoided / 500) * 100))}%
              </span>
            </div>
            <Progress 
              value={Math.min(100, (metrics.co2Avoided / 500) * 100)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>People Reached (Target: 100)</span>
              <span className="text-muted-foreground">
                {Math.min(100, metrics.totalPeopleSheltered)}%
              </span>
            </div>
            <Progress 
              value={Math.min(100, metrics.totalPeopleSheltered)} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Methodology Note */}
      <Card className="bg-secondary/30">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            <strong>Methodology Note:</strong> Environmental impact calculations are estimates based on 
            published research. CO₂ savings assume 2kg wood burning per person-night would otherwise 
            occur (3.6kg CO₂ equivalent). Sanitation impact assumes 85% of shelter users utilize 
            provided facilities. Tree equivalents based on average annual CO₂ absorption of 21kg per tree.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
