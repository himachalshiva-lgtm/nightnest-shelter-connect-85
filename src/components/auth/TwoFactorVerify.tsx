import { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface TwoFactorVerifyProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    factorId: string;
}

export function TwoFactorVerify({ isOpen, onClose, onSuccess, factorId }: TwoFactorVerifyProps) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { verifyMFA } = useAuth();

    const handleVerify = async () => {
        if (code.length !== 6) {
            toast({
                title: "Invalid code",
                description: "Please enter a 6-digit verification code.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await verifyMFA(factorId, code);

            if (error) {
                toast({
                    title: "Verification Failed",
                    description: "The code you entered is incorrect. Please try again.",
                    variant: "destructive",
                });
                setCode('');
            } else {
                toast({
                    title: "Verified!",
                    description: "Successfully authenticated with 2FA.",
                });
                onSuccess();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Two-Factor Verification
                    </DialogTitle>
                    <DialogDescription>
                        Enter the verification code from your authenticator app
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Verification Code</label>
                        <Input
                            type="text"
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="text-center text-2xl font-mono tracking-widest h-14"
                            maxLength={6}
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground text-center">
                            Enter the 6-digit code from your authenticator app
                        </p>
                    </div>

                    <Button
                        onClick={handleVerify}
                        className="w-full"
                        disabled={isLoading || code.length !== 6}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Verify"
                        )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Lost access to your authenticator?{' '}
                        <button className="text-primary hover:underline font-medium">
                            Use backup code
                        </button>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
