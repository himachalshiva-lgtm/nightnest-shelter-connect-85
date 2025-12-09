import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { supabase } from "@/integrations/supabase/client";

export function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={handleLogout} />
      <main className="pl-64">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
