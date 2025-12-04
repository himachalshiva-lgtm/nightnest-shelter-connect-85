import { useState } from 'react';
import { X, Scan, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WristbandScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (wristbandId: string) => void;
}

export function WristbandScanner({ open, onClose, onScan }: WristbandScannerProps) {
  const [manualId, setManualId] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const randomId = `WB-2024-${Math.floor(1000 + Math.random() * 9000)}`;
      onScan(randomId);
      setIsScanning(false);
    }, 1500);
  };

  const handleManualEntry = () => {
    if (manualId.trim()) {
      onScan(manualId.trim());
      setManualId('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Scan className="h-5 w-5 text-primary" />
            Scan Wristband
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Scanner Area */}
          <div className="relative aspect-square max-w-xs mx-auto rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/50 flex items-center justify-center overflow-hidden">
            {isScanning ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/20 animate-scan-line" />
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <p className="mt-4 text-sm text-muted-foreground">Scanning...</p>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Position wristband QR code in front of camera
                </p>
              </div>
            )}
          </div>

          <Button 
            variant="scan" 
            size="lg" 
            className="w-full"
            onClick={handleSimulateScan}
            disabled={isScanning}
          >
            <Scan className="h-4 w-4 mr-2" />
            {isScanning ? 'Scanning...' : 'Simulate Scan'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter wristband ID (e.g., WB-2024-1234)"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className="bg-secondary border-border"
            />
            <Button variant="secondary" onClick={handleManualEntry}>
              Enter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
