import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Film,
  Users,
  DollarSign,
  BarChart2,
  MessageSquare,
  Image,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center py-4 mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to App
            </Link>
          </Button>
          <h1 className="text-2xl font-bold ml-4">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span>Admin: {user?.displayName || user?.username}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main>
        <div className="bg-primary/5 rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to the Admin Portal</h2>
          <p className="max-w-2xl">
            Manage content, users, advertisements, and monitor platform metrics
            from this central dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Content Management"
            description="Upload, edit, and manage drama series and episodes"
            link="/admin/content"
            icon={<Film className="h-6 w-6" />}
          />
          <DashboardCard
            title="User Management"
            description="View and manage user accounts and permissions"
            link="/admin/users"
            icon={<Users className="h-6 w-6" />}
          />
          <DashboardCard
            title="Coin System"
            description="Manage virtual currency and user transactions"
            link="/admin/coins"
            icon={<DollarSign className="h-6 w-6" />}
          />
          <DashboardCard
            title="Analytics"
            description="View platform metrics and user engagement data"
            link="/admin/analytics"
            icon={<BarChart2 className="h-6 w-6" />}
          />
          <DashboardCard
            title="Feedback"
            description="Review user comments and ratings"
            link="/admin/feedback"
            icon={<MessageSquare className="h-6 w-6" />}
          />
          <DashboardCard
            title="Advertisements"
            description="Manage ad placements and campaigns"
            link="/admin/ads"
            icon={<Image className="h-6 w-6" />}
          />
        </div>
      </main>
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
};

function DashboardCard({ title, description, link, icon }: DashboardCardProps) {
  return (
    <Link href={link}>
      <div className="border rounded-lg p-6 hover:bg-primary/5 transition-colors cursor-pointer h-full">
        <div className="flex items-center mb-4">
          <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4">
            {icon}
          </div>
          <h3 className="font-bold text-xl">{title}</h3>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}