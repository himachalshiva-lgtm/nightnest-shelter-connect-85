import { useState, useEffect, useRef } from 'react';
import { Scan, QrCode, Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Html5Qrcode } from 'html5-qrcode';

interface WristbandScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (wristbandId: string) => void;
}

export function WristbandScanner({ open, onClose, onScan }: WristbandScannerProps) {
  const [manualId, setManualId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cleanup scanner when dialog closes
  useEffect(() => {
    if (!open && scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
      setIsScanning(false);
      setCameraError(null);
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startCameraScanning = async () => {
    setCameraError(null);
    
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      setIsScanning(true);

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code scanned successfully
          onScan(decodedText);
          stopScanning();
        },
        () => {
          // QR code not detected - this is normal, keep scanning
        }
      );
    } catch (err) {
      setIsScanning(false);
      if (err instanceof Error) {
        if (err.message.includes('Permission')) {
          setCameraError('Camera permission denied. Please allow camera access.');
        } else if (err.message.includes('NotFoundError')) {
          setCameraError('No camera found on this device.');
        } else {
          setCameraError(`Camera error: ${err.message}`);
        }
      } else {
        setCameraError('Failed to start camera. Try manual entry instead.');
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    setIsScanning(false);
  };

  const handleSimulateScan = () => {
    // Generate ID in format: NN-USER-XXXX
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const randomId = `NN-USER-${randomNum}`;
    onScan(randomId);
  };

  const handleManualEntry = () => {
    if (manualId.trim()) {
      onScan(manualId.trim());
      setManualId('');
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Scan className="h-5 w-5 text-primary" />
            Scan Wristband
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Camera Scanner Area */}
          <div className="relative aspect-square max-w-xs mx-auto rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/50 overflow-hidden">
            <div id="qr-reader" className="w-full h-full" />
            
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Click "Start Camera" to scan QR code
                  </p>
                </div>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg">
              {cameraError}
            </div>
          )}

          <div className="flex gap-2">
            {!isScanning ? (
              <Button 
                variant="default" 
                size="lg" 
                className="flex-1"
                onClick={startCameraScanning}
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                size="lg" 
                className="flex-1"
                onClick={stopScanning}
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Camera
              </Button>
            )}
            
            <Button 
              variant="secondary" 
              size="lg"
              onClick={handleSimulateScan}
              disabled={isScanning}
            >
              <Scan className="h-4 w-4 mr-2" />
              Demo
            </Button>
          </div>

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
              placeholder="Enter ID (e.g., NN-USER-1234)"
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
