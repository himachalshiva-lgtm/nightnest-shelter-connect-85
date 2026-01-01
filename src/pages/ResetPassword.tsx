import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Moon, Lock, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { updatePassword } = useAuth();

    // Check if this is a password reset flow (user clicked link from email)
    const isRecoveryFlow = searchParams.get('type') === 'recovery';

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: "Please make sure both passwords are identical.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 8) {
            toast({
                title: "Password too short",
                description: "Password must be at least 8 characters long.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await updatePassword(newPassword);

            if (error) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                });
            } else {
                setIsSuccess(true);
                toast({
                    title: "Password Updated",
                    description: "Your password has been successfully changed.",
                });
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 via-background to-background">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Password Updated!</h2>
                    <p className="text-muted-foreground">
                        Your password has been successfully changed. Redirecting you to login...
                    </p>
                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 via-background to-background">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.08),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,hsl(var(--accent)/0.05),transparent_50%)]" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary glow-primary">
                        <Moon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <span className="text-3xl font-bold text-foreground">NightNest</span>
                </div>

                {/* Card */}
                <div className="stat-card p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <KeyRound className="h-7 w-7 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
                        <p className="text-muted-foreground">
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="pl-10 h-12 bg-secondary border-border"
                                    required
                                    minLength={8}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 h-12 bg-secondary border-border"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="scan"
                            size="lg"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Update Password
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Remember your password?{' '}
                        <button
                            onClick={() => navigate('/')}
                            className="text-primary hover:underline font-medium"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
