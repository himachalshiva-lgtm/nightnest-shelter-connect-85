import { useState, useEffect } from 'react';
import { Shield, Copy, CheckCircle2, Smartphone, X, Loader2 } from 'lucide-react';
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

interface TwoFactorSetupProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function TwoFactorSetup({ isOpen, onClose, onSuccess }: TwoFactorSetupProps) {
    const [step, setStep] = useState<'intro' | 'qr' | 'verify' | 'success'>('intro');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [factorId, setFactorId] = useState('');
    const { toast } = useToast();
    const { enrollMFA, verifyMFA, getMFAFactors } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setStep('intro');
            setQrCode('');
            setSecret('');
            setVerificationCode('');
        }
    }, [isOpen]);

    const handleStartEnrollment = async () => {
        setIsLoading(true);
        try {
            const result = await enrollMFA();

            if ('error' in result && result.error) {
                toast({
                    title: "Error",
                    description: result.error.message,
                    variant: "destructive",
                });
                return;
            }

            if ('qrCode' in result) {
                setQrCode(result.qrCode);
                setSecret(result.secret);

                // Get the factor ID for verification
                const { data: factors } = await getMFAFactors();
                const totpFactor = factors?.totp?.find((f: any) => f.factor_type === 'totp');
                if (totpFactor) {
                    setFactorId(totpFactor.id);
                }

                setStep('qr');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to start 2FA enrollment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (verificationCode.length !== 6) {
            toast({
                title: "Invalid code",
                description: "Please enter a 6-digit verification code.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await verifyMFA(factorId, verificationCode);

            if (error) {
                toast({
                    title: "Verification Failed",
                    description: "The code you entered is incorrect. Please try again.",
                    variant: "destructive",
                });
            } else {
                setStep('success');
                toast({
                    title: "2FA Enabled",
                    description: "Two-factor authentication is now active on your account.",
                });
                onSuccess?.();
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

    const copyToClipboard = () => {
        navigator.clipboard.writeText(secret);
        toast({
            title: "Copied!",
            description: "Secret key copied to clipboard.",
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Two-Factor Authentication
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'intro' && "Add an extra layer of security to your account"}
                        {step === 'qr' && "Scan this QR code with your authenticator app"}
                        {step === 'verify' && "Enter the verification code from your app"}
                        {step === 'success' && "2FA has been successfully enabled"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {step === 'intro' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Smartphone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Authenticator App Required</p>
                                        <p className="text-sm text-muted-foreground">
                                            You'll need an authenticator app like Google Authenticator, Authy, or 1Password.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>✓ Protects against unauthorized access</p>
                                <p>✓ Required for sensitive operations</p>
                                <p>✓ Works even without internet</p>
                            </div>

                            <Button
                                onClick={handleStartEnrollment}
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Get Started"
                                )}
                            </Button>
                        </div>
                    )}

                    {step === 'qr' && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div className="p-4 bg-white rounded-xl">
                                    {qrCode ? (
                                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                    ) : (
                                        <div className="w-48 h-48 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-2">Can't scan? Enter this code manually:</p>
                                <div className="flex items-center justify-center gap-2">
                                    <code className="px-3 py-2 bg-secondary rounded-lg text-sm font-mono">
                                        {secret}
                                    </code>
                                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Button onClick={() => setStep('verify')} className="w-full">
                                I've Scanned the Code
                            </Button>
                        </div>
                    )}

                    {step === 'verify' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Verification Code</label>
                                <Input
                                    type="text"
                                    placeholder="000000"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="text-center text-2xl font-mono tracking-widest h-14"
                                    maxLength={6}
                                />
                                <p className="text-xs text-muted-foreground text-center">
                                    Enter the 6-digit code from your authenticator app
                                </p>
                            </div>

                            <Button
                                onClick={handleVerify}
                                className="w-full"
                                disabled={isLoading || verificationCode.length !== 6}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Verify & Enable"
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => setStep('qr')}
                                className="w-full"
                            >
                                Back to QR Code
                            </Button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="space-y-4 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">All Set!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Two-factor authentication is now enabled. You'll need to enter a verification code each time you sign in.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                <p className="text-sm text-orange-400">
                                    <strong>Important:</strong> Save your backup codes in a safe place in case you lose access to your authenticator app.
                                </p>
                            </div>

                            <Button onClick={onClose} className="w-full">
                                Done
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
