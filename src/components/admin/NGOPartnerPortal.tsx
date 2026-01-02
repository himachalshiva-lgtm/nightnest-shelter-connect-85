import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Package, History, Handshake, Phone, Mail, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { AIResourceAllocation } from './AIResourceAllocation';

interface NGOPartnerPortalProps {
  shelterId: string;
  shelterName: string;
}

interface NGO {
  id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  service_types: string[];
  coverage_area: string | null;
  description: string | null;
}

interface NGOStock {
  id: string;
  ngo_id: string;
  item_type: string;
  quantity: number;
}

interface StockLog {
  id: string;
  ngo_id: string;
  item_type: string;
  quantity: number;
  received_date: string;
  notes: string | null;
  ngos?: { name: string };
}

interface Assignment {
  id: string;
  ngo_id: string;
  assigned_date: string;
  services_assigned: string[];
  notes: string | null;
  ngos?: { name: string };
}

const SERVICE_TYPES = ['bedding', 'blankets', 'clothing', 'food', 'food_kits', 'hygiene', 'hygiene_kits', 'medical', 'health', 'shelter', 'rescue', 'humanitarian', 'nutrition', 'care'];

const ITEM_TYPES = ['blankets', 'bedding', 'clothing', 'food_kits', 'hygiene_kits', 'medical_supplies', 'sleeping_bags', 'shoes', 'toiletries'];

export function NGOPartnerPortal({ shelterId, shelterName }: NGOPartnerPortalProps) {
  const { toast } = useToast();
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [stocks, setStocks] = useState<NGOStock[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // Dialog states
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isLogStockOpen, setIsLogStockOpen] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [assignNotes, setAssignNotes] = useState('');
  const [logItemType, setLogItemType] = useState('');
  const [logQuantity, setLogQuantity] = useState('');
  const [logNotes, setLogNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [shelterId]);

  async function fetchData() {
    setIsLoading(true);
    try {
      // Fetch NGOs
      const { data: ngoData } = await supabase
        .from('ngos')
        .select('*')
        .order('name');

      if (ngoData) setNgos(ngoData);

      // Fetch stocks
      const { data: stockData } = await supabase
        .from('ngo_stock')
        .select('*');

      if (stockData) setStocks(stockData);

      // Fetch stock logs for this shelter
      const { data: logData } = await supabase
        .from('stock_received_logs')
        .select('*, ngos(name)')
        .eq('shelter_id', shelterId)
        .order('received_date', { ascending: false })
        .limit(50);

      if (logData) setStockLogs(logData);

      // Fetch assignments for this shelter
      const { data: assignData } = await supabase
        .from('shelter_ngo_assignments')
        .select('*, ngos(name)')
        .eq('shelter_id', shelterId)
        .order('assigned_date', { ascending: false });

      if (assignData) setAssignments(assignData);
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

  const filteredNgos = ngos.filter((ngo) => {
    const matchesSearch = ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.coverage_area?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = serviceFilter === 'all' || ngo.service_types.includes(serviceFilter);
    return matchesSearch && matchesService;
  });

  const getNgoStock = (ngoId: string) => {
    return stocks.filter((s) => s.ngo_id === ngoId);
  };

  async function handleAssignNgo() {
    if (!selectedNgo || selectedServices.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select an NGO and at least one service.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('shelter_ngo_assignments')
        .insert({
          shelter_id: shelterId,
          ngo_id: selectedNgo,
          services_assigned: selectedServices,
          notes: assignNotes || null,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'NGO assigned successfully.',
      });

      setIsAssignOpen(false);
      setSelectedNgo('');
      setSelectedServices([]);
      setAssignNotes('');
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  async function handleLogStock() {
    if (!selectedNgo || !logItemType || !logQuantity) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('stock_received_logs')
        .insert({
          shelter_id: shelterId,
          ngo_id: selectedNgo,
          item_type: logItemType,
          quantity: parseInt(logQuantity),
          notes: logNotes || null,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Stock received logged successfully.',
      });

      setIsLogStockOpen(false);
      setSelectedNgo('');
      setLogItemType('');
      setLogQuantity('');
      setLogNotes('');
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search NGOs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {SERVICE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Handshake className="h-4 w-4 mr-2" />
                Assign NGO
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign NGO Services</DialogTitle>
                <DialogDescription>
                  Assign an NGO to provide services at {shelterName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select NGO</Label>
                  <Select value={selectedNgo} onValueChange={setSelectedNgo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an NGO" />
                    </SelectTrigger>
                    <SelectContent>
                      {ngos.map((ngo) => (
                        <SelectItem key={ngo.id} value={ngo.id}>
                          {ngo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Services</Label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_TYPES.slice(0, 8).map((service) => (
                      <Badge
                        key={service}
                        variant={selectedServices.includes(service) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedServices((prev) =>
                            prev.includes(service)
                              ? prev.filter((s) => s !== service)
                              : [...prev, service]
                          );
                        }}
                      >
                        {service.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="Any additional notes..."
                  />
                </div>
                <Button onClick={handleAssignNgo} className="w-full">
                  Assign NGO
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isLogStockOpen} onOpenChange={setIsLogStockOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Log Stock Received
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Received Items</DialogTitle>
                <DialogDescription>
                  Record items received from an NGO partner
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>From NGO</Label>
                  <Select value={selectedNgo} onValueChange={setSelectedNgo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select NGO" />
                    </SelectTrigger>
                    <SelectContent>
                      {ngos.map((ngo) => (
                        <SelectItem key={ngo.id} value={ngo.id}>
                          {ngo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Item Type</Label>
                  <Select value={logItemType} onValueChange={setLogItemType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={logQuantity}
                    onChange={(e) => setLogQuantity(e.target.value)}
                    placeholder="e.g., 100"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="e.g., Winter blankets for cold wave"
                  />
                </div>
                <Button onClick={handleLogStock} className="w-full">
                  Log Stock
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NGO Directory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5" />
              NGO Directory
            </CardTitle>
            <CardDescription>Partner organizations and their services</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {filteredNgos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No NGOs found</p>
                ) : (
                  filteredNgos.map((ngo) => (
                    <div
                      key={ngo.id}
                      className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{ngo.name}</h4>
                          {ngo.coverage_area && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {ngo.coverage_area}
                            </p>
                          )}
                        </div>
                      </div>
                      {ngo.description && (
                        <p className="text-sm text-muted-foreground">{ngo.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {ngo.service_types.map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {ngo.contact_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {ngo.contact_phone}
                          </span>
                        )}
                        {ngo.contact_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {ngo.contact_email}
                          </span>
                        )}
                      </div>
                      {/* Stock availability */}
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-medium mb-2">Available Stock:</p>
                        <div className="flex flex-wrap gap-2">
                          {getNgoStock(ngo.id).length === 0 ? (
                            <span className="text-xs text-muted-foreground">No stock data</span>
                          ) : (
                            getNgoStock(ngo.id).map((stock) => (
                              <Badge key={stock.id} variant="secondary" className="text-xs">
                                {stock.item_type.replace('_', ' ')}: {stock.quantity}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Stock & Assignment History */}
        <div className="space-y-6">
          {/* Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Active Assignments
              </CardTitle>
              <CardDescription>NGOs assigned to provide services</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px] pr-4">
                {assignments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No assignments yet</p>
                ) : (
                  <div className="space-y-2">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"
                      >
                        <div>
                          <p className="font-medium text-sm">{assignment.ngos?.name}</p>
                          <div className="flex gap-1 mt-1">
                            {assignment.services_assigned.map((s) => (
                              <Badge key={s} variant="outline" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(assignment.assigned_date), 'MMM d')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Stock Received History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Stock Received History
              </CardTitle>
              <CardDescription>Items received from NGO partners</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px] pr-4">
                {stockLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No stock logs yet</p>
                ) : (
                  <div className="space-y-2">
                    {stockLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {log.quantity} {log.item_type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From {log.ngos?.name}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.received_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Resource Allocation Section */}
      <AIResourceAllocation
        shelters={[{
          id: shelterId,
          name: shelterName,
          totalBeds: 100, // This would come from props in a real implementation
          currentOccupancy: 65,
          coordinates: { lat: 28.6129, lng: 77.2295 },
        }]}
        ngoStock={stocks.map(s => ({
          ngoName: ngos.find(n => n.id === s.ngo_id)?.name || 'Unknown NGO',
          itemType: s.item_type,
          quantity: s.quantity,
        }))}
      />
    </div>
  );
}
