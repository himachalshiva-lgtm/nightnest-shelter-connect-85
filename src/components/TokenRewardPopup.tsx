import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coins, Sparkles, CheckCircle2 } from 'lucide-react';

interface TokenRewardPopupProps {
  open: boolean;
  onClose: () => void;
  tokens: number;
  wristbandId: string;
}

export function TokenRewardPopup({ open, onClose, tokens, wristbandId }: TokenRewardPopupProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (open) {
      // Trigger animation after a small delay
      const timer = setTimeout(() => setShowAnimation(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border bg-card text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-foreground text-xl">
            <CheckCircle2 className="h-6 w-6 text-success" />
            Scan Complete!
          </DialogTitle>
          <DialogDescription className="text-center">
            You've earned virtual tokens for this scan
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 space-y-6">
          {/* Token Animation */}
          <div 
            className={`relative mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center transition-all duration-500 ${
              showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
          >
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 animate-pulse" />
            <Coins className="h-16 w-16 text-primary relative z-10" />
            
            {/* Sparkles */}
            <Sparkles className={`absolute -top-2 -right-2 h-6 w-6 text-accent transition-all duration-700 delay-200 ${
              showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`} />
            <Sparkles className={`absolute -bottom-2 -left-2 h-5 w-5 text-primary transition-all duration-700 delay-300 ${
              showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`} />
          </div>

          {/* Token Count */}
          <div className={`transition-all duration-500 delay-300 ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <p className="text-5xl font-bold text-primary mb-2">+{tokens}</p>
            <p className="text-lg text-muted-foreground">Virtual Tokens Earned</p>
          </div>

          {/* Wristband ID */}
          <div className={`p-3 rounded-lg bg-secondary/50 transition-all duration-500 delay-400 ${
            showAnimation ? 'opacity-100' : 'opacity-0'
          }`}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Wristband Scanned</p>
            <p className="font-mono font-semibold text-foreground">{wristbandId}</p>
          </div>
        </div>

        <Button variant="default" className="w-full" onClick={onClose}>
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}
