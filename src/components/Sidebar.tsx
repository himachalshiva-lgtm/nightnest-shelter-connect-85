import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Map, 
  Users, 
  Settings, 
  LogOut,
  Moon,
  QrCode,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();
  const { isAdmin, role } = useAuthContext();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', showAlways: true },
    { icon: Shield, label: 'Admin Dashboard', path: '/admin', adminOnly: true },
    { icon: Building2, label: 'Shelters', path: '/shelters', showAlways: true },
    { icon: Map, label: 'Map View', path: '/map', showAlways: true },
    { icon: Users, label: 'Volunteers', path: '/volunteers', showAlways: true },
    { icon: QrCode, label: 'Generate Wristbands', path: '/generate-wristbands', showAlways: true },
    { icon: Settings, label: 'Settings', path: '/settings', showAlways: true },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) return isAdmin;
    return item.showAlways;
  });

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Moon className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">NightNest</span>
        </div>

        {/* Role Badge */}
        {role && (
          <div className="px-6 py-3 border-b border-border">
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              isAdmin ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
            )}>
              {isAdmin ? 'Shelter Admin' : 'Staff'}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
