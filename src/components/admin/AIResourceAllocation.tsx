import { useState } from 'react';
import { Brain, Package, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Shelter {
  id: string;
  name: string;
  totalBeds: number;
  currentOccupancy: number;
  coordinates: { lat: number; lng: number };
}

interface NGOStock {
  ngoName: string;
  itemType: string;
  quantity: number;
}

interface Allocation {
  shelterId: string;
  shelterName: string;
  quantity: number;
  priority: string;
  reason: string;
}

interface AllocationResult {
  allocations: Allocation[];
  summary: string;
  totalAllocated: number;
  recommendations: string[];
}

interface AIResourceAllocationProps {
  shelters: Shelter[];
  ngoStock: NGOStock[];
}

const resourceTypes = [
  { value: 'blankets', label: 'Blankets' },
  { value: 'food_kits', label: 'Food Kits' },
  { value: 'hygiene_kits', label: 'Hygiene Kits' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'medical_supplies', label: 'Medical Supplies' },
];

export function AIResourceAllocation({ shelters, ngoStock }: AIResourceAllocationProps) {
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AllocationResult | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const handleAllocate = async () => {
    if (!selectedResource) {
      toast.error('Please select a resource type');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setRawResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-resource-allocation', {
        body: {
          shelters: shelters.map(s => ({
            id: s.id,
            name: s.name,
            totalBeds: s.totalBeds,
            currentOccupancy: s.currentOccupancy,
            coordinates: s.coordinates,
          })),
          ngoStock,
          resourceType: selectedResource,
        },
      });

      if (error) throw error;

      if (data.success) {
        if (data.allocation.parseError) {
          setRawResponse(data.allocation.rawResponse);
          toast.info('AI provided recommendations (text format)');
        } else {
          setResult(data.allocation);
          toast.success('AI allocation complete!');
        }
      } else {
        throw new Error(data.error || 'Allocation failed');
      }
    } catch (error) {
      console.error('Allocation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate allocation');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-danger/20 text-danger border-danger/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'low': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Resource Allocation
        </CardTitle>
        <CardDescription>
          Use AI to optimally distribute NGO resources across shelters based on need and capacity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Select value={selectedResource} onValueChange={setSelectedResource}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select resource type" />
            </SelectTrigger>
            <SelectContent>
              {resourceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAllocate} disabled={isLoading || !selectedResource}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Generate Allocation
              </>
            )}
          </Button>
        </div>

        {rawResponse && (
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Recommendations
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rawResponse}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Allocation Summary
              </h4>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
              <p className="text-sm font-medium mt-2">
                Total items to distribute: <span className="text-primary">{result.totalAllocated}</span>
              </p>
            </div>

            {result.allocations && result.allocations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Allocation Plan</h4>
                {result.allocations.map((allocation, index) => (
                  <div key={index} className="p-3 rounded-lg bg-secondary/50 border border-border flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{allocation.shelterName}</p>
                      <p className="text-xs text-muted-foreground">{allocation.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPriorityColor(allocation.priority)}>
                        {allocation.priority}
                      </Badge>
                      <span className="font-bold text-primary">{allocation.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Additional Recommendations
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
