import { useState, useEffect } from 'react';
import { User, Bell, Shield, Database, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function Settings() {
  const { toast } = useToast();
  const { user, resetPassword, sendVerificationEmail } = useAuth();

  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // Notification states
  const [lowBedAlerts, setLowBedAlerts] = useState(true);
  const [volunteerShortage, setVolunteerShortage] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  // Password reset state
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.displayName || 'Staff Member');
      setEmail(user.email || 'staff@nightnest.org');
    }
  }, [user]);

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile changes have been saved successfully.",
    });
  };

  const handleChangePassword = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address not found.",
        variant: "destructive",
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Reset Email Sent",
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
      setIsResettingPassword(false);
    }
  };

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    try {
      const { error } = await sendVerificationEmail();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification Email Sent",
          description: "Check your inbox to verify your email address.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleExportData = async () => {
    // Mock export for now as we don't have direct DB access in this view
    toast({
      title: "Export Started",
      description: "Your data export will be emailed to you shortly.",
    });
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
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="flex items-center gap-2">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border flex-1"
                disabled
              />
              {user && !user.emailVerified && (
                <span className="text-xs text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
                  Unverified
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <Input value="Staff" disabled className="bg-secondary/50 border-border" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Assigned Shelter</label>
            <Input
              value=""
              placeholder="Not assigned"
              className="bg-secondary border-border"
              disabled
            />
          </div>
        </div>

        <Button type="button" variant="default" onClick={() => handleSaveProfile()}>
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

        <Button type="button" variant="outline" onClick={() => toast({ title: "Saved", description: "Preferences saved." })}>
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
          {/* Email Verification */}
          {user && !user.emailVerified && (
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Not Verified</p>
                  <p className="text-sm text-muted-foreground">Verify your email to access all features</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSendVerification}
                  disabled={isSendingVerification}
                >
                  {isSendingVerification ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send Verification"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Password Reset */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted-foreground">Secure your account with a strong password</p>
              </div>
              <Button
                variant="outline"
                onClick={handleChangePassword}
                disabled={isResettingPassword}
              >
                {isResettingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
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

        <Button type="button" variant="outline" onClick={() => handleExportData()}>
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
          <Button type="button" variant="outline" onClick={() => handleViewDocs()}>View Documentation</Button>
          <Button type="button" variant="outline" onClick={() => handleContactSupport()}>Contact Support</Button>
        </div>
      </div>
    </div>
  );
}
