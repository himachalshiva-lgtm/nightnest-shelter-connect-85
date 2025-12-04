import { User, Bell, Shield, Database, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
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
            <Input defaultValue="Staff Member" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input defaultValue="staff@nightnest.org" className="bg-secondary border-border" />
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

        <Button variant="default">Save Changes</Button>
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
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Volunteer Shortage</p>
              <p className="text-sm text-muted-foreground">Alert when volunteers are needed</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Daily Summary</p>
              <p className="text-sm text-muted-foreground">Receive daily check-in reports</p>
            </div>
            <Switch />
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
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
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

        <Button variant="outline">Export My Data</Button>
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
          <Button variant="outline">View Documentation</Button>
          <Button variant="outline">Contact Support</Button>
        </div>
      </div>
    </div>
  );
}
