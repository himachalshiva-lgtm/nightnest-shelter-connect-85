import { useState } from 'react';
import { Navigation, Shield, Loader2, MapPin, Clock, Phone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shelter } from '@/types/shelter';

interface SafeRouteResult {
  recommendedShelter: {
    id: string;
    name: string;
    reason: string;
    safetyScore: number;
  };
  routeGuidance: string;
  safetyTips: string[];
  estimatedWalkTime: number;
  alternativeShelters: Array<{
    name: string;
    reason: string;
  }>;
  emergencyContacts: string[];
}

interface AISafeRouteProps {
  userLocation: { lat: number; lng: number } | null;
  shelters: Shelter[];
  onSelectShelter: (shelter: Shelter) => void;
}

export function AISafeRoute({ userLocation, shelters, onSelectShelter }: AISafeRouteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SafeRouteResult | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  };

  const handleFindSafeRoute = async () => {
    if (!userLocation) {
      toast.error('Please enable location first');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setRawResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-safe-route', {
        body: {
          userLocation,
          shelters: shelters.map(s => ({
            id: s.id,
            name: s.name,
            address: s.address,
            availableBeds: s.availableBeds,
            coordinates: s.coordinates,
            amenities: s.amenities,
          })),
          timeOfDay: getTimeOfDay(),
        },
      });

      if (error) throw error;

      if (data.success) {
        if (data.routeData.parseError) {
          setRawResponse(data.routeData.rawResponse);
          toast.info('AI provided route guidance (text format)');
        } else {
          setResult(data.routeData);
          toast.success('Safe route calculated!');
        }
      } else {
        throw new Error(data.error || 'Route calculation failed');
      }
    } catch (error) {
      console.error('Route error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to calculate safe route');
    } finally {
      setIsLoading(false);
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 5) return 'text-warning';
    return 'text-danger';
  };

  const handleNavigateToShelter = () => {
    if (result?.recommendedShelter) {
      const shelter = shelters.find(s => s.id === result.recommendedShelter.id || s.name === result.recommendedShelter.name);
      if (shelter) {
        onSelectShelter(shelter);
      }
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          AI Safe Route Finder
        </CardTitle>
        <CardDescription>
          Find the safest route to a nearby shelter based on time, lighting, and safety factors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleFindSafeRoute} 
          disabled={isLoading || !userLocation}
          className="w-full"
          variant="scan"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Calculating Safe Route...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              Find Safest Route
            </>
          )}
        </Button>

        {!userLocation && (
          <p className="text-sm text-muted-foreground text-center">
            Please click "My Location" to enable route finding
          </p>
        )}

        {rawResponse && (
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              AI Route Guidance
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rawResponse}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Recommended Shelter */}
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-success" />
                    Recommended Shelter
                  </h4>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {result.recommendedShelter.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Safety Score</p>
                  <p className={`text-2xl font-bold ${getSafetyScoreColor(result.recommendedShelter.safetyScore)}`}>
                    {result.recommendedShelter.safetyScore}/10
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.recommendedShelter.reason}</p>
              <Button 
                size="sm" 
                className="mt-3" 
                onClick={handleNavigateToShelter}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Shelter
              </Button>
            </div>

            {/* Walk Time */}
            {result.estimatedWalkTime && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  Estimated walking time: <strong>{result.estimatedWalkTime} minutes</strong>
                </span>
              </div>
            )}

            {/* Route Guidance */}
            {result.routeGuidance && (
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h4 className="font-medium mb-2">Route Directions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.routeGuidance}
                </p>
              </div>
            )}

            {/* Safety Tips */}
            {result.safetyTips && result.safetyTips.length > 0 && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Safety Tips
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {result.safetyTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emergency Contacts */}
            {result.emergencyContacts && result.emergencyContacts.length > 0 && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Emergency Contacts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.emergencyContacts.map((contact, index) => (
                    <Badge key={index} variant="outline">
                      {contact}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Shelters */}
            {result.alternativeShelters && result.alternativeShelters.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Alternative Options</h4>
                {result.alternativeShelters.slice(0, 3).map((alt, index) => (
                  <div key={index} className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <p className="text-sm font-medium">{alt.name}</p>
                    <p className="text-xs text-muted-foreground">{alt.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
