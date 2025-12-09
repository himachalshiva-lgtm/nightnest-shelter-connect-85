import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle the email link sign-in if the user clicked the link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      if (!emailForSignIn) {
        emailForSignIn = window.prompt('Please provide your email for confirmation');
      }
      if (emailForSignIn) {
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            toast({ title: "Success", description: "Successfully signed in with email link!" });
            navigate('/dashboard');
          })
          .catch((error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
          });
      }
    }
  }, [navigate, toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);

        toast({
          title: "Account Created",
          description: "Please check your email to verify your account.",
        });
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email to receive a login link.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);

    const actionCodeSettings = {
      url: window.location.href, // Redirect back to this page
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      toast({
        title: "Link Sent",
        description: "Check your email for the sign-in link."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,hsl(var(--accent)/0.1),transparent_50%)]" />

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary glow-primary">
              <Moon className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-4xl font-bold text-foreground">NightNest</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Smart Shelter<br />
            <span className="text-primary">Management</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            Real-time bed availability, instant wristband check-ins, and intelligent shelter recommendations. Making every night safer.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-3xl font-bold text-primary">70%</p>
              <p className="text-sm text-muted-foreground">Faster Check-ins</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-3xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">Real-time Updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Moon className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">NightNest</span>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-muted-foreground">
              {isSignUp ? "Enter your details to get started" : "Sign in to access your shelter dashboard"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  {isSignUp ? "Sign Up" : "Sign In"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            {!isSignUp && (
              <Button variant="outline" type="button" className="w-full" onClick={handleOtpLogin} disabled={isLoading}>
                Sign in with Magic Link
              </Button>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline hover:text-primary/90 transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Note: Volunteers and Shelters data in the dashboard is currently simulated for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}
