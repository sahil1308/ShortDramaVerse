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

// In development, remove protected routes for easier testing
function App() {
  return (
    <>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={HomePage} />
        <Route path="/watch/:id" component={WatchPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/watchlist" component={WatchlistPage} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/content" component={AdminContentManagement} />
        <Route path="/admin/users" component={AdminUserManagement} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
