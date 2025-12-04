import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShelterCard } from '@/components/ShelterCard';
import { mockShelters } from '@/data/mockData';
import { ShelterStatus } from '@/types/shelter';
import { cn } from '@/lib/utils';

const filterOptions: { label: string; value: ShelterStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Limited', value: 'limited' },
  { label: 'Full', value: 'full' },
];

export default function Shelters() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ShelterStatus | 'all'>('all');
  const navigate = useNavigate();

  const filteredShelters = mockShelters.filter((shelter) => {
    const matchesSearch = shelter.name.toLowerCase().includes(search.toLowerCase()) ||
                         shelter.address.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || shelter.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Shelters</h1>
        <p className="text-muted-foreground mt-1">Manage and monitor all shelter locations</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shelters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <div className="flex gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value)}
              className={cn(
                filter === option.value && "glow-primary"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredShelters.length} of {mockShelters.length} shelters
      </p>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredShelters.map((shelter) => (
          <ShelterCard
            key={shelter.id}
            shelter={shelter}
            onClick={() => navigate(`/shelters/${shelter.id}`)}
          />
        ))}
      </div>

      {filteredShelters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No shelters found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
