
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientManagement from "./pages/PatientManagement";
import HealthActorManagement from "./pages/HealthActorManagement";
import Stats from "./pages/Stats";
import HealthActorView from "./pages/HealthActorView";
import PatientView from "./pages/PatientView";
import NotFound from "./pages/NotFound";
import AuthRouter from "./router/AuthRouter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<AuthRouter><Dashboard /></AuthRouter>} />
            <Route path="/patients" element={<AuthRouter><PatientManagement /></AuthRouter>} />
            <Route path="/health-actors" element={<AuthRouter><HealthActorManagement /></AuthRouter>} />
            <Route path="/stats" element={<AuthRouter><Stats /></AuthRouter>} />
            <Route path="/health-actor-view" element={<AuthRouter><HealthActorView /></AuthRouter>} />
            <Route path="/patient-view" element={<AuthRouter><PatientView /></AuthRouter>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
