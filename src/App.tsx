import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Shelters from "./pages/Shelters";
import ShelterDetail from "./pages/ShelterDetail";
import MapView from "./pages/MapView";
import Volunteers from "./pages/Volunteers";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import GenerateWristbands from "./pages/GenerateWristbands";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/shelters" element={<Shelters />} />
              <Route path="/shelters/:id" element={<ShelterDetail />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/generate-wristbands" element={<GenerateWristbands />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
