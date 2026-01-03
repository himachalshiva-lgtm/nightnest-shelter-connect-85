import { useState, useEffect } from 'react';
import { Shield, Handshake, Package, Search, Plus, History, Phone, Mail, MapPin } from 'lucide-react';
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
import { format } from 'date-fns';
import { mockShelters } from '@/data/mockData';
import { AIResourceAllocation } from '@/components/admin/AIResourceAllocation';

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
  shelter_id: string;
  shelters?: { name: string };
  ngos?: { name: string };
}

interface Shelter {
  id: string;
  name: string;
}

const SERVICE_TYPES = ['bedding', 'blankets', 'clothing', 'food', 'food_kits', 'hygiene', 'hygiene_kits', 'medical', 'health', 'shelter', 'rescue', 'humanitarian', 'nutrition', 'care'];
const ITEM_TYPES = ['blankets', 'bedding', 'clothing', 'food_kits', 'hygiene_kits', 'medical_supplies', 'sleeping_bags', 'shoes', 'toiletries'];

export default function NGOPortal() {
  const { toast } = useToast();
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [stocks, setStocks] = useState<NGOStock[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // Dialog states
  const [isLogStockOpen, setIsLogStockOpen] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState('');
  const [selectedShelter, setSelectedShelter] = useState('');
  const [logItemType, setLogItemType] = useState('');
  const [logQuantity, setLogQuantity] = useState('');
  const [logNotes, setLogNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      // Fetch NGOs
      const { data: ngoData } = await supabase.from('ngos').select('*').order('name');
      if (ngoData) setNgos(ngoData);

      // Fetch stocks
      const { data: stockData } = await supabase.from('ngo_stock').select('*');
      if (stockData) setStocks(stockData);

      // Fetch all stock logs
      const { data: logData } = await supabase
        .from('stock_received_logs')
        .select('*, ngos(name), shelters(name)')
        .order('received_date', { ascending: false })
        .limit(100);
      if (logData) setStockLogs(logData);

      // Fetch shelters
      const { data: shelterData } = await supabase.from('shelters').select('id, name').order('name');
      if (shelterData) setShelters(shelterData);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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

  const getNgoStock = (ngoId: string) => stocks.filter((s) => s.ngo_id === ngoId);

  async function handleLogStock() {
    if (!selectedNgo || !selectedShelter || !logItemType || !logQuantity) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase.from('stock_received_logs').insert({
        shelter_id: selectedShelter,
        ngo_id: selectedNgo,
        item_type: logItemType,
        quantity: parseInt(logQuantity),
        notes: logNotes || null,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Stock received logged successfully.' });
      setIsLogStockOpen(false);
      setSelectedNgo('');
      setSelectedShelter('');
      setLogItemType('');
      setLogQuantity('');
      setLogNotes('');
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }

  // Prepare data for AI allocation
  const aiShelters = mockShelters.map(s => ({
    id: s.id,
    name: s.name,
    totalBeds: s.totalBeds,
    currentOccupancy: s.totalBeds - s.availableBeds,
    coordinates: s.coordinates,
  }));

  const aiNgoStock = stocks.map(s => {
    const ngo = ngos.find(n => n.id === s.ngo_id);
    return {
      ngoName: ngo?.name || 'Unknown',
      itemType: s.item_type,
      quantity: s.quantity,
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Handshake className="h-8 w-8 text-primary" />
          NGO Partner Portal
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage NGO partnerships, stock inventory, and resource distribution
        </p>
      </div>

      {/* AI Resource Allocation */}
      <AIResourceAllocation shelters={aiShelters} ngoStock={aiNgoStock} />

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
              <DialogDescription>Record items received from an NGO partner</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>From NGO</Label>
                <Select value={selectedNgo} onValueChange={setSelectedNgo}>
                  <SelectTrigger><SelectValue placeholder="Select NGO" /></SelectTrigger>
                  <SelectContent>
                    {ngos.map((ngo) => (
                      <SelectItem key={ngo.id} value={ngo.id}>{ngo.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Shelter</Label>
                <Select value={selectedShelter} onValueChange={setSelectedShelter}>
                  <SelectTrigger><SelectValue placeholder="Select Shelter" /></SelectTrigger>
                  <SelectContent>
                    {shelters.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Item Type</Label>
                <Select value={logItemType} onValueChange={setLogItemType}>
                  <SelectTrigger><SelectValue placeholder="Select item type" /></SelectTrigger>
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
              <Button onClick={handleLogStock} className="w-full">Log Stock</Button>
            </div>
          </DialogContent>
        </Dialog>
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
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {filteredNgos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No NGOs found</p>
                ) : (
                  filteredNgos.map((ngo) => (
                    <div key={ngo.id} className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
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

        {/* Stock History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Stock Received
            </CardTitle>
            <CardDescription>History of items received from NGO partners</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {stockLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No stock logs yet</p>
                ) : (
                  stockLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">
                            {log.quantity}x {log.item_type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From: {log.ngos?.name || 'Unknown NGO'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            To: {log.shelters?.name || 'Unknown Shelter'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(log.received_date), 'MMM d, yyyy')}
                        </Badge>
                      </div>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground italic">{log.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
