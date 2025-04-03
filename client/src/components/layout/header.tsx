import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Search, 
  Bell, 
  ChevronDown,
  LogOut,
  User,
  Settings,
  ShieldCheck
} from "lucide-react";
import { Logo } from "@/icons/logo";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
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

export function Header() {
  // Use mock user instead of real auth
  const user = mockUser;
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();
  
  // Mock logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
      window.location.href = "/auth";
    }
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-3 flex items-center justify-between border-b border-border">
      {/* Logo (mobile only) */}
      <div className="flex items-center md:hidden">
        <Logo size="sm" className="mr-2" />
        <h1 className="text-lg font-bold">ShortDramaVerse</h1>
      </div>
      
      {/* Search Bar (desktop) */}
      <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
        <form onSubmit={handleSearch} className="w-full relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Search for dramas, genres, actors..."
            className="w-full bg-muted text-foreground rounded-full pl-10 focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center">
        {/* Mobile Search Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search size={20} />
        </Button>
        
        {/* Notification Button (desktop) */}
        <Button variant="ghost" size="icon" className="hidden md:flex mr-2 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 bg-primary text-primary-foreground w-4 h-4 rounded-full text-xs flex items-center justify-center">
            3
          </span>
        </Button>
        
        {/* Coins (mobile) */}
        <div className="md:hidden mr-4 flex items-center">
          <span className="mr-1">🪙</span>
          <span className="font-bold text-yellow-400">{user?.coins || 0}</span>
        </div>
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 p-0">
              <Avatar>
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2" size={16} />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2" size={16} />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            
            {user?.isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <ShieldCheck className="mr-2" size={16} />
                    <span>Admin Panel</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2" size={16} />
              <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Mobile Search Input (Expandable) */}
      {showSearch && (
        <div className="absolute left-0 top-full w-full p-4 bg-background border-b border-border z-20 md:hidden">
          <form onSubmit={handleSearch} className="flex items-center">
            <Input
              type="text"
              placeholder="Search..."
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="ml-2">
              Search
            </Button>
          </form>
        </div>
      )}
    </header>
  );
}
