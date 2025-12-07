import { useState } from 'react';
import { User, Bell, Shield, Database, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  
  // Profile state
  const [fullName, setFullName] = useState('Staff Member');
  const [email, setEmail] = useState('staff@nightnest.org');
  
  // Notification states
  const [lowBedAlerts, setLowBedAlerts] = useState(true);
  const [volunteerShortage, setVolunteerShortage] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile changes have been saved successfully.",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Password Change",
      description: "A password reset link has been sent to your email.",
    });
  };

  const handleEnable2FA = () => {
    toast({
      title: "Two-Factor Authentication",
      description: "2FA setup instructions have been sent to your email.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your data export is being prepared. You'll receive an email when ready.",
    });
  };

  const handleViewDocs = () => {
    window.open('https://docs.lovable.dev/', '_blank');
  };

  const handleContactSupport = () => {
    toast({
      title: "Support Request",
      description: "Opening support contact form...",
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
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <Input defaultValue="Shelter Staff" disabled className="bg-secondary/50 border-border" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Assigned Shelter</label>
            <Input defaultValue="Hope Haven Center" disabled className="bg-secondary/50 border-border" />
          </div>
        </div>

        <Button variant="default" onClick={handleSaveProfile}>Save Changes</Button>
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
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={handleEnable2FA}>
            Enable Two-Factor Authentication
          </Button>
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

        <Button variant="outline" onClick={handleExportData}>Export My Data</Button>
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
