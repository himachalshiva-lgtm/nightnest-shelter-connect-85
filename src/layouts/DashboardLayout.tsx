import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
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

