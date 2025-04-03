import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Film,
  Users,
  BarChart,
  TrendingUp,
  PlayCircle,
  Eye,
  Layers,
  ChevronRight,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminLayout } from "@/components/layout/admin";

// Using AdminLayout imported from @/components/layout/admin

// Mock data for charts
const viewsData = [
  { name: 'Mon', views: 4000 },
  { name: 'Tue', views: 3000 },
  { name: 'Wed', views: 5000 },
  { name: 'Thu', views: 2780 },
  { name: 'Fri', views: 4890 },
  { name: 'Sat', views: 6390 },
  { name: 'Sun', views: 5490 },
];

export default function AdminDashboard() {
  // Fetch analytics data
  const { data: userAnalytics } = useQuery({
    queryKey: ["/api/admin/analytics/users"],
  });

  const { data: contentAnalytics } = useQuery({
    queryKey: ["/api/admin/analytics/content"],
  });

  const { data: revenueAnalytics } = useQuery({
    queryKey: ["/api/admin/analytics/revenue"],
  });

  return (
    <AdminLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAnalytics?.totalUsers || "..."}</div>
            <p className="text-xs text-muted-foreground">
              +{userAnalytics?.newUsersToday || "..."} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Content
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentAnalytics?.totalDramas || "..."}</div>
            <p className="text-xs text-muted-foreground">
              {contentAnalytics?.totalEpisodes || "..."} episodes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentAnalytics?.totalViews || "..."}</div>
            <p className="text-xs text-muted-foreground">
              Across all content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Coins Spent
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueAnalytics?.totalCoinsSpent || "..."}</div>
            <p className="text-xs text-muted-foreground">
              {revenueAnalytics?.premiumUnlocks || "..."} premium unlocks
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Viewing Trends</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={viewsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="hsl(0 92% 49%)" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueAnalytics?.mostProfitableSeries ? (
              <div className="space-y-3">
                {revenueAnalytics.mostProfitableSeries.map((series: any) => (
                  <div key={series.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <PlayCircle className="h-5 w-5 text-primary mr-2" />
                      <div>
                        <p className="font-medium">{series.title}</p>
                        <p className="text-xs text-muted-foreground">Revenue: {series.revenue} coins</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                Loading data...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="mr-3 bg-primary/10 rounded-full p-2">
                  <Film className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">New content uploaded</p>
                  <p className="text-xs text-muted-foreground">
                    <Clock className="inline-block h-3 w-3 mr-1" />
                    10 minutes ago
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-3 bg-primary/10 rounded-full p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">5 new user registrations</p>
                  <p className="text-xs text-muted-foreground">
                    <Clock className="inline-block h-3 w-3 mr-1" />
                    2 hours ago
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-3 bg-primary/10 rounded-full p-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Premium content purchases</p>
                  <p className="text-xs text-muted-foreground">
                    <Clock className="inline-block h-3 w-3 mr-1" />
                    5 hours ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
