import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Mail, Lock, ArrowRight, Building2, UserCog, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface Shelter {
  id: string;
  name: string;
  address: string;
}

type RoleType = 'staff' | 'admin';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType>('staff');
  const [selectedShelterId, setSelectedShelterId] = useState<string>('');
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch shelters for admin signup
  useEffect(() => {
    async function fetchShelters() {
      const { data, error } = await supabase
        .from('shelters')
        .select('id, name, address')
        .order('name');
      
      if (!error && data) {
        setShelters(data);
      }
    }
    fetchShelters();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validate admin requires shelter
        if (selectedRole === 'admin' && !selectedShelterId) {
          toast({
            title: "Shelter Required",
            description: "Please select a shelter to manage as an admin.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/dashboard`;
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            }
          }
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Create user role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: signUpData.user.id,
              role: selectedRole,
            });

          if (roleError) {
            console.error('Error creating role:', roleError);
          }

          // Update profile with shelter if admin
          if (selectedRole === 'admin' && selectedShelterId) {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ 
                shelter_id: selectedShelterId,
                full_name: fullName 
              })
              .eq('id', signUpData.user.id);

            if (profileError) {
              console.error('Error updating profile:', profileError);
            }
          }
        }

        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials.",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

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
        description: "Please enter your email to receive an OTP.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setIsLoading(false);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "OTP Sent",
        description: "Check your email for the login code."
      });
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

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 bg-secondary border-border"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
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
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-secondary border-border"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('staff')}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        selectedRole === 'staff'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <Users className="h-5 w-5" />
                      <span className="font-medium">Staff</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('admin')}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        selectedRole === 'admin'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <UserCog className="h-5 w-5" />
                      <span className="font-medium">Shelter Admin</span>
                    </button>
                  </div>
                </div>

                {selectedRole === 'admin' && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Select Your Shelter
                    </Label>
                    <Select value={selectedShelterId} onValueChange={setSelectedShelterId}>
                      <SelectTrigger className="h-12 bg-secondary border-border">
                        <SelectValue placeholder="Choose a shelter to manage" />
                      </SelectTrigger>
                      <SelectContent>
                        {shelters.map((shelter) => (
                          <SelectItem key={shelter.id} value={shelter.id}>
                            {shelter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

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
                Sign in with Magic Link / OTP
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
            {isSignUp 
              ? "Staff: Basic operations. Shelter Admin: Full management access."
              : "Note: Volunteers and Shelters data in the dashboard is currently simulated for demonstration."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
