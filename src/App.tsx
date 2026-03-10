import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/components/Dashboard";
import Analise from "@/pages/Analise";
import Ajustes from "@/pages/Ajustes";
import Perfil from "@/pages/Perfil";
import EstagioDetail from "@/pages/EstagioDetail";
import Calendario from "@/pages/Calendario";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/estagio/:stage" element={<EstagioDetail />} />
              <Route path="/analise" element={<Analise />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/ajustes" element={<Ajustes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
