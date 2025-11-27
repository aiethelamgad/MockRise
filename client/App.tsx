import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AuthRedirectHandler } from '@/components/auth/AuthRedirectHandler';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "keen-slider/keen-slider.min.css";
import { AppRoutes } from '@/routes';

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AuthRedirectHandler />
              <AppRoutes />
            </TooltipProvider>
          </QueryClientProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;