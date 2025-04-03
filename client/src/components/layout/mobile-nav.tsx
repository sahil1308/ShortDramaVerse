import { Link, useLocation } from "wouter";
import { 
  Home, 
  Compass, 
  Bookmark, 
  Download, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/explore", icon: Compass, label: "Explore" },
    { path: "/watchlist", icon: Bookmark, label: "Watchlist" },
    { path: "/downloads", icon: Download, label: "Downloads" },
    { path: "/profile", icon: User, label: "Profile" },
  ];
  
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-background border-t border-border flex z-20">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <a className={cn(
            "flex-1 flex flex-col items-center py-3",
            location === item.path 
              ? "text-primary" 
              : "text-muted-foreground"
          )}>
            <item.icon className={location === item.path ? "fill-current" : ""} size={20} />
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        </Link>
      ))}
    </nav>
  );
}
