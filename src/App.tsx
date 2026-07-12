import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthPage from "@/pages/Auth";

const BottomNav = lazy(() => import("@/components/BottomNav"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CustomerForm = lazy(() => import("@/pages/CustomerForm"));
const CustomerDetail = lazy(() => import("@/pages/CustomerDetail"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const TryOn = lazy(() => import("@/pages/TryOn"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function BottomNavSlot() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading || !user || pathname === "/auth") return null;

  return (
    <Suspense fallback={null}>
      <BottomNav />
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/add" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
                <Route path="/edit/:id" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
                <Route path="/customer/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
                <Route path="/tryon" element={<ProtectedRoute><TryOn /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <BottomNavSlot />
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
