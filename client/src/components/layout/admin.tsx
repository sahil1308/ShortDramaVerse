import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  BarChart, 
  Film, 
  Users, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  // Redirect if not admin
  if (user && !user.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-8 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the admin area.
          </p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const adminLinks = [
    { path: "/admin", label: "Dashboard", icon: BarChart },
    { path: "/admin/content", label: "Content Management", icon: Film },
    { path: "/admin/users", label: "User Management", icon: Users },
    { path: "/admin/analytics", label: "Analytics", icon: TrendingUp }
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Sidebar />

      <div className="md:ml-64 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
          <div className="flex overflow-auto pb-2 md:pb-0 md:flex-wrap gap-2">
            {adminLinks.map((link) => (
              <Button
                key={link.path}
                variant={isActive(link.path) ? "default" : "outline"}
                asChild
                className="flex items-center"
                size="sm"
              >
                <Link href={link.path}>
                  <link.icon className="mr-2" size={16} />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

export { Header, Sidebar };
