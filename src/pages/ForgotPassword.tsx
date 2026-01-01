import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await resetPassword(email);

            if (error) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                });
            } else {
                setIsEmailSent(true);
                toast({
                    title: "Email Sent",
                    description: "Check your inbox for the password reset link.",
                });
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

    if (isEmailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 via-background to-background">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,hsl(var(--accent)/0.05),transparent_50%)]" />

                <div className="relative z-10 w-full max-w-md">
                    <div className="flex items-center gap-2 mb-8 justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary glow-primary">
                            <Moon className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <span className="text-3xl font-bold text-foreground">NightNest</span>
                    </div>

                    <div className="stat-card p-8 space-y-6 text-center">
                        <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-foreground">Check Your Email</h2>
                            <p className="text-muted-foreground">
                                We've sent a password reset link to:
                            </p>
                            <p className="font-medium text-foreground">{email}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                            <p className="text-sm text-muted-foreground">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button
                                    onClick={() => setIsEmailSent(false)}
                                    className="text-primary hover:underline font-medium"
                                >
                                    try again
                                </button>
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate('/')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Sign In
                        </Button>
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
                            <Mail className="h-7 w-7 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Forgot Password?</h2>
                        <p className="text-muted-foreground">
                            No worries! Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="staff@nightnest.org"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    Send Reset Link
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Sign In
                    </Button>
                </div>
            </div>
        </div>
    );
}
