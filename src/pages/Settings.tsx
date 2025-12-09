import { useState, useEffect } from 'react';
import { User, Bell, Shield, Database, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  full_name: string | null;
  assigned_shelter: string | null;
  low_bed_alerts: boolean;
  volunteer_shortage_alerts: boolean;
  daily_summary: boolean;
}

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [assignedShelter, setAssignedShelter] = useState('');
  const [role, setRole] = useState('Staff');

  // Notification states
  const [lowBedAlerts, setLowBedAlerts] = useState(true);
  const [volunteerShortage, setVolunteerShortage] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        setEmail(user.email || '');

        // Fetch profile from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
        }

        if (profile) {
          setFullName(profile.full_name || '');
          setAssignedShelter(profile.assigned_shelter || '');
          setLowBedAlerts(profile.low_bed_alerts ?? true);
          setVolunteerShortage(profile.volunteer_shortage_alerts ?? true);
          setDailySummary(profile.daily_summary ?? false);
        } else {
          // Profile doesn't exist yet, use auth metadata as fallback
          setFullName(user.user_metadata?.full_name || '');
        }

        // Fetch user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleData) {
          setRole(roleData.role.charAt(0).toUpperCase() + roleData.role.slice(1));
        }
      }
    } catch (error: any) {
      console.error('Error loading user data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    try {
      setUpdating(true);

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (authError) throw authError;

      // Upsert profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          assigned_shelter: assignedShelter || null,
          low_bed_alerts: lowBedAlerts,
          volunteer_shortage_alerts: volunteerShortage,
          daily_summary: dailySummary,
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      toast({
        title: "Profile Updated",
        description: "Your profile and preferences have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!userId) return;

    try {
      setUpdating(true);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          low_bed_alerts: lowBedAlerts,
          volunteer_shortage_alerts: volunteerShortage,
          daily_summary: dailySummary,
        }, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "No email found for this account",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/settings`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);

      // Fetch wristbands data
      const { data: wristbands, error: wristbandsError } = await supabase
        .from('wristbands')
        .select('*');

      if (wristbandsError) throw wristbandsError;

      // Fetch check-in history
      const { data: checkIns, error: checkInsError } = await supabase
        .from('check_in_history')
        .select('*');

      if (checkInsError) throw checkInsError;

      // Create export data
      const exportData = {
        exportDate: new Date().toISOString(),
        wristbands: wristbands || [],
        checkInHistory: checkIns || [],
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nightnest-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleViewDocs = () => {
    window.open('https://docs.lovable.dev/', '_blank');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@nightnest.app?subject=NightNest Support Request';
    toast({
      title: "Opening Email",
      description: "Your email client should open shortly.",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="stat-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Profile</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              value={email}
              disabled
              className="bg-secondary/50 border-border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <Input value={role} disabled className="bg-secondary/50 border-border" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Assigned Shelter</label>
            <Input 
              value={assignedShelter} 
              onChange={(e) => setAssignedShelter(e.target.value)}
              placeholder="Enter shelter name"
              className="bg-secondary border-border" 
            />
          </div>
        </div>

        <Button variant="default" onClick={handleSaveProfile} disabled={updating}>
          {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      {/* Notifications */}
      <div className="stat-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Low Bed Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when beds are running low</p>
            </div>
            <Switch checked={lowBedAlerts} onCheckedChange={setLowBedAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Volunteer Shortage</p>
              <p className="text-sm text-muted-foreground">Alert when volunteers are needed</p>
            </div>
            <Switch checked={volunteerShortage} onCheckedChange={setVolunteerShortage} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Daily Summary</p>
              <p className="text-sm text-muted-foreground">Receive daily check-in reports</p>
            </div>
            <Switch checked={dailySummary} onCheckedChange={setDailySummary} />
          </div>
        </div>

        <Button variant="outline" onClick={handleSaveNotifications} disabled={updating}>
          {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Notification Preferences
        </Button>
      </div>

      {/* Security */}
      <div className="stat-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Security</h3>
        </div>

        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleChangePassword}>
            Reset Password
          </Button>
          <div className="w-full">
            <Button variant="outline" className="w-full justify-start" disabled>
              Enable Two-Factor Authentication (Contact Admin)
            </Button>
            <p className="text-xs text-muted-foreground mt-2 ml-1">
              2FA is currently managed by your organization's identity policy.
            </p>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="stat-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Data & Privacy</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          NightNest is committed to privacy. We do not store personal identity data for individuals using our wristband system. All health notes are basic and non-invasive.
        </p>

        <Button variant="outline" onClick={handleExportData} disabled={exporting}>
          {exporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Export My Data
        </Button>
      </div>

      {/* Help */}
      <div className="stat-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Help & Support</h3>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleViewDocs}>View Documentation</Button>
          <Button variant="outline" onClick={handleContactSupport}>Contact Support</Button>
        </div>
      </div>
    </div>
  );
}
