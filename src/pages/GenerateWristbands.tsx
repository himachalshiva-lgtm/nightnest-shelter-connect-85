import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Plus, Trash2 } from 'lucide-react';

interface WristbandQR {
  id: string;
  wristbandId: string;
}

export default function GenerateWristbands() {
  const [wristbands, setWristbands] = useState<WristbandQR[]>([]);
  const [count, setCount] = useState(5);
  const printRef = useRef<HTMLDivElement>(null);

  const generateWristbandId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `NN-USER-${randomNum}`;
  };

  const handleGenerate = () => {
    const newWristbands: WristbandQR[] = [];
    for (let i = 0; i < count; i++) {
      newWristbands.push({
        id: crypto.randomUUID(),
        wristbandId: generateWristbandId(),
      });
    }
    setWristbands([...wristbands, ...newWristbands]);
  };

  const handleRemove = (id: string) => {
    setWristbands(wristbands.filter(w => w.id !== id));
  };

  const handleClearAll = () => {
    setWristbands([]);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NightNest Wristbands</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, sans-serif; }
            .print-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              padding: 20px;
            }
            .wristband-card {
              border: 2px dashed #ccc;
              border-radius: 12px;
              padding: 16px;
              text-align: center;
              page-break-inside: avoid;
            }
            .wristband-card h3 {
              font-size: 10px;
              color: #666;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .wristband-card .qr-container {
              display: flex;
              justify-content: center;
              margin-bottom: 8px;
            }
            .wristband-card .id {
              font-size: 12px;
              font-weight: 600;
              font-family: monospace;
              color: #333;
            }
            @media print {
              .print-grid { padding: 10px; gap: 12px; }
              .wristband-card { border-color: #999; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Generate Wristband QR Codes</h1>
        <p className="text-muted-foreground">Create printable QR codes for wristbands</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Generate New Wristbands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <Input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 bg-secondary border-border"
              />
            </div>
            <Button onClick={handleGenerate}>
              <Plus className="h-4 w-4 mr-2" />
              Generate
            </Button>
            {wristbands.length > 0 && (
              <>
                <Button variant="secondary" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print All
                </Button>
                <Button variant="destructive" onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {wristbands.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Generated Wristbands ({wristbands.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {wristbands.map((wristband) => (
                <div
                  key={wristband.id}
                  className="relative group border-2 border-dashed border-border rounded-xl p-4 text-center bg-secondary/30 hover:border-primary/50 transition-colors"
                >
                  <button
                    onClick={() => handleRemove(wristband.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">NightNest</p>
                  <div className="flex justify-center mb-2">
                    <QRCodeSVG
                      value={wristband.wristbandId}
                      size={100}
                      level="H"
                      includeMargin={false}
                      bgColor="transparent"
                      fgColor="currentColor"
                      className="text-foreground"
                    />
                  </div>
                  <p className="text-xs font-mono font-semibold text-foreground">{wristband.wristbandId}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden print template */}
      <div ref={printRef} className="hidden">
        <div className="print-grid">
          {wristbands.map((wristband) => (
            <div key={wristband.id} className="wristband-card">
              <h3>NightNest</h3>
              <div className="qr-container">
                <QRCodeSVG
                  value={wristband.wristbandId}
                  size={80}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="id">{wristband.wristbandId}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
