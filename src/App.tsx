import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/use-auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Shelters from "./pages/Shelters";
import ShelterDetail from "./pages/ShelterDetail";
import MapView from "./pages/MapView";
import Volunteers from "./pages/Volunteers";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import GenerateWristbands from "./pages/GenerateWristbands";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { DashboardLayout } from "./layouts/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/shelters" element={<Shelters />} />
              <Route path="/shelters/:id" element={<ShelterDetail />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/generate-wristbands" element={<GenerateWristbands />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
