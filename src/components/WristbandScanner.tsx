import { useState, useEffect, useRef, useCallback } from 'react';
import { Scan, QrCode, Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

interface WristbandScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (wristbandId: string) => void;
}

export function WristbandScanner({ open, onClose, onScan }: WristbandScannerProps) {
  const [manualId, setManualId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string>('Ready to scan');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerIdRef = useRef(`qr-reader-${Date.now()}`);

  // Safe stop function
  const safeStopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scannerRef.current.stop();
          console.log('Scanner stopped successfully');
        }
      } catch (e) {
        console.log('Scanner stop handled:', e);
      }
      try {
        scannerRef.current.clear();
      } catch (e) {
        // Ignore clear errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setScanStatus('Ready to scan');
  }, []);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      safeStopScanner();
      setCameraError(null);
    }
  }, [open, safeStopScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      safeStopScanner();
    };
  }, [safeStopScanner]);

  const startCameraScanning = async () => {
    setCameraError(null);
    setScanStatus('Starting camera...');
    
    try {
      // Stop any existing scanner first
      await safeStopScanner();
      
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create new scanner instance
      scannerRef.current = new Html5Qrcode(containerIdRef.current);
      
      setIsScanning(true);
      setScanStatus('Scanning for QR codes...');

      const config = {
        fps: 10,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText, decodedResult) => {
          console.log('QR Code scanned:', decodedText, decodedResult);
          setScanStatus(`Scanned: ${decodedText}`);
          safeStopScanner();
          onScan(decodedText);
        },
        (errorMessage) => {
          // This fires constantly when no QR is detected - don't log
        }
      );
      
      console.log('Scanner started successfully');
      setScanStatus('Point camera at QR code...');
      
    } catch (err) {
      console.error('Scanner start error:', err);
      setIsScanning(false);
      setScanStatus('Failed to start');
      
      if (err instanceof Error) {
        if (err.message.includes('Permission') || err.message.includes('NotAllowed')) {
          setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
        } else if (err.message.includes('NotFound') || err.message.includes('DevicesNotFound')) {
          setCameraError('No camera found on this device.');
        } else if (err.message.includes('NotReadable') || err.message.includes('TrackStartError')) {
          setCameraError('Camera is in use by another application.');
        } else {
          setCameraError(`Camera error: ${err.message}`);
        }
      } else {
        setCameraError('Failed to start camera. Try manual entry instead.');
      }
    }
  };

  const stopScanning = async () => {
    await safeStopScanner();
  };

  const handleSimulateScan = () => {
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
    safeStopScanner();
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
          <DialogDescription>
            Use your camera to scan a QR code or enter the wristband ID manually.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Camera Scanner Area */}
          <div className="relative mx-auto rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/50 overflow-hidden" style={{ width: '280px', height: '280px' }}>
            <div 
              id={containerIdRef.current} 
              style={{ width: '100%', height: '100%' }}
            />
            
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/90">
                <div className="text-center p-6">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Click "Start Camera" to scan QR code
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scan status */}
          <p className="text-center text-sm text-muted-foreground">
            {scanStatus}
          </p>

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
              onKeyDown={(e) => e.key === 'Enter' && handleManualEntry()}
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
