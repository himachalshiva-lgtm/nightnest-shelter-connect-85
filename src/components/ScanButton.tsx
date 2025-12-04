import { Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScanButtonProps {
  onClick: () => void;
}

export function ScanButton({ onClick }: ScanButtonProps) {
  return (
    <Button 
      variant="scan" 
      size="xl" 
      onClick={onClick}
      className="relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      <Scan className="h-5 w-5 mr-2" />
      Scan Wristband
    </Button>
  );
}
