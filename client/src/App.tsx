import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import WatchPage from "@/pages/watch-page";
import ProfilePage from "@/pages/profile-page";
import WatchlistPage from "@/pages/watchlist-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminContentManagement from "@/pages/admin/content-management";
import AdminUserManagement from "@/pages/admin/user-management";
import AdminAnalytics from "@/pages/admin/analytics";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/watch/:id" component={WatchPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/watchlist" component={WatchlistPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/content" component={AdminContentManagement} />
      <ProtectedRoute path="/admin/users" component={AdminUserManagement} />
      <ProtectedRoute path="/admin/analytics" component={AdminAnalytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
