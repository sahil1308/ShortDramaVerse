import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import SeriesDetailPage from "@/pages/series-detail";
import EpisodePlayerPage from "@/pages/episode-player";
import { ProtectedRoute } from "@/lib/protected-route";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAdsPage from "@/pages/admin/ads";
import { AdminRoute } from "@/lib/protected-route";

// Import CSS
import "./index.css";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/series/:id" component={SeriesDetailPage} />
      <ProtectedRoute path="/episode/:id" component={EpisodePlayerPage} />
      <Route path="/auth" component={AuthPage} />
      <AdminRoute path="/admin/dashboard" component={AdminDashboard} />
      <AdminRoute path="/admin/ads" component={AdminAdsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}