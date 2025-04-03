import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Channel } from "@shared/schema";
import { ChannelCard } from "@/components/ui/channel-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/icons/logo";
import { 
  Home, 
  Compass, 
  Bookmark, 
  Clock, 
  Download, 
  Settings,
  ShieldCheck
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Temporary mock user data for development
const mockUser = {
  id: 1,
  displayName: "Test User",
  username: "testuser",
  coins: 100,
  profileImage: "https://ui-avatars.com/api/?background=E50914&color=fff",
  isAdmin: true,
  isPremium: true
};

export function Sidebar() {
  const [location] = useLocation();
  // Use mock user instead of real auth
  const user = mockUser;
  
  // Mock logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
      window.location.href = "/auth";
    }
  });
  
  // Fetch user subscriptions
  const { data: subscriptions } = useQuery<(Channel & { isSubscribed: boolean })[]>({
    queryKey: ["/api/subscriptions"],
    queryFn: async () => {
      const res = await fetch("/api/subscriptions", {
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error("Failed to fetch subscriptions");
      }
      
      const data = await res.json();
      return data.map((sub: any) => ({
        ...sub.channel,
        isSubscribed: true
      }));
    },
    enabled: !!user,
  });
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <aside className="hidden md:flex md:w-64 h-screen bg-card fixed left-0 top-0 flex-col p-4 overflow-y-auto">
      <div className="flex items-center mb-8">
        <Logo size="md" className="mr-2" />
        <h1 className="text-xl font-bold">ShortDramaVerse</h1>
      </div>
      
      <nav className="mb-6">
        <ul className="space-y-1">
          <li>
            <Link href="/">
              <a className={`flex items-center p-3 rounded font-medium ${
                isActive("/") 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted text-foreground"
              }`}>
                <Home className="mr-3" size={20} />
                <span>Home</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/explore">
              <a className={`flex items-center p-3 rounded font-medium ${
                isActive("/explore") 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted text-foreground"
              }`}>
                <Compass className="mr-3" size={20} />
                <span>Explore</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/watchlist">
              <a className={`flex items-center p-3 rounded font-medium ${
                isActive("/watchlist") 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted text-foreground"
              }`}>
                <Bookmark className="mr-3" size={20} />
                <span>Watchlist</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/history">
              <a className={`flex items-center p-3 rounded font-medium ${
                isActive("/history") 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted text-foreground"
              }`}>
                <Clock className="mr-3" size={20} />
                <span>History</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/downloads">
              <a className={`flex items-center p-3 rounded font-medium ${
                isActive("/downloads") 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted text-foreground"
              }`}>
                <Download className="mr-3" size={20} />
                <span>Downloads</span>
              </a>
            </Link>
          </li>
          
          {user?.isAdmin && (
            <li>
              <Link href="/admin">
                <a className={`flex items-center p-3 rounded font-medium ${
                  location.startsWith("/admin")
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted text-foreground"
                }`}>
                  <ShieldCheck className="mr-3" size={20} />
                  <span>Admin Panel</span>
                </a>
              </Link>
            </li>
          )}
        </ul>
      </nav>
      
      <div className="p-4 bg-card rounded-lg mb-6 border">
        <div className="flex items-center mb-3">
          <span className="mr-2">🪙</span>
          <span className="font-semibold">My Coins</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-yellow-400">{user?.coins || 0}</span>
          <Button variant="secondary" size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500">
            Buy More
          </Button>
        </div>
      </div>
      
      {subscriptions && subscriptions.length > 0 && (
        <>
          <h3 className="font-medium mb-2 text-muted-foreground text-sm px-3">SUBSCRIPTIONS</h3>
          <ul className="mb-6 space-y-2">
            {subscriptions.map(channel => (
              <li key={channel.id}>
                <a href="#" className="flex items-center p-2 rounded hover:bg-muted">
                  <ChannelCard channel={channel} isSubscribed={true} size="sm" />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      
      <div className="mt-auto pt-4 border-t border-muted">
        <div className="flex items-center p-2">
          <img 
            src={user?.profileImage || "https://ui-avatars.com/api/?background=E50914&color=fff"}
            className="w-9 h-9 rounded-full mr-3" 
            alt="User avatar" 
          />
          <div>
            <p className="font-medium">{user?.displayName || "Guest"}</p>
            <p className="text-sm text-muted-foreground">
              {user?.isPremium ? "Premium Member" : "Free Member"}
            </p>
          </div>
        </div>
        <div className="flex mt-2 space-x-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href="/profile">
              <Settings size={16} className="mr-1" /> Profile
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
