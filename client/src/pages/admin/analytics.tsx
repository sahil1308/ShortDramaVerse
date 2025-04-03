import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminLayout } from "@/components/layout/admin";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Clock, 
  Calendar, 
  EyeIcon, 
  Download, 
  Coins, 
  ArrowUp, 
  ArrowDown 
} from "lucide-react";

// Mock data for charts
const viewsData = [
  { name: 'Jan', views: 4000, users: 2400 },
  { name: 'Feb', views: 3000, users: 1398 },
  { name: 'Mar', views: 5000, users: 3800 },
  { name: 'Apr', views: 2780, users: 3908 },
  { name: 'May', views: 4890, users: 4800 },
  { name: 'Jun', views: 6390, users: 3800 },
  { name: 'Jul', views: 5490, users: 4300 },
];

const genreData = [
  { name: 'Romance', value: 35 },
  { name: 'Comedy', value: 25 },
  { name: 'Suspense', value: 20 },
  { name: 'Action', value: 15 },
  { name: 'Others', value: 5 },
];

const COLORS = ['#E50914', '#0A84FF', '#FFBE0B', '#34C759', '#5856D6'];

const deviceData = [
  { name: 'Mobile', users: 4000 },
  { name: 'Desktop', users: 3000 },
  { name: 'Tablet', users: 2000 },
  { name: 'TV', users: 1000 },
];

const retentionData = [
  { name: 'Day 1', retention: 100 },
  { name: 'Day 3', retention: 80 },
  { name: 'Day 7', retention: 65 },
  { name: 'Day 14', retention: 55 },
  { name: 'Day 30', retention: 45 },
];

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("month");

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
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Analytics Overview</h2>
          <div className="flex items-center gap-2">
            <Select defaultValue={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics?.totalUsers || 0}</div>
              <div className="flex items-center pt-1 text-xs text-green-500">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>{userAnalytics?.newUsersToday || 0} new today</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <EyeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contentAnalytics?.totalViews || 0}</div>
              <div className="flex items-center pt-1 text-xs text-green-500">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>12% increase</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14m 32s</div>
              <div className="flex items-center pt-1 text-xs text-red-500">
                <ArrowDown className="mr-1 h-3 w-3" />
                <span>3% decrease</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueAnalytics?.totalCoinsSpent || 0} coins</div>
              <div className="flex items-center pt-1 text-xs text-green-500">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>8% increase</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different analytics */}
        <Tabs defaultValue="views">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="views">Views</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Views Tab */}
          <TabsContent value="views">
            <Card>
              <CardHeader>
                <CardTitle>Views Overview</CardTitle>
                <CardDescription>
                  Total views across all content over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewsData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E50914" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#E50914" 
                        fillOpacity={1} 
                        fill="url(#colorViews)" 
                        name="Views"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content By Genre</CardTitle>
                  <CardDescription>
                    Distribution of views by genre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genreData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {genreData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Content</CardTitle>
                  <CardDescription>
                    Most viewed content in the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueAnalytics?.mostProfitableSeries?.map((series: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{series.title}</div>
                            <div className="text-sm text-muted-foreground">{series.revenue} coins</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{1000 + Math.floor(Math.random() * 9000)} views</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>
                  User retention over time after sign-up
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={retentionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="retention" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Average Watch Time</CardTitle>
                  <CardDescription>
                    Average time spent watching content by genre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[
                          { name: 'Romance', time: 18 },
                          { name: 'Comedy', time: 14 },
                          { name: 'Action', time: 16 },
                          { name: 'Suspense', time: 21 },
                          { name: 'Historical', time: 11 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" unit="min" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value) => `${value} minutes`} />
                        <Bar dataKey="time" fill="#FFBE0B" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                  <CardDescription>
                    Percentage of users who complete episodes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completed', value: 68 },
                            { name: 'Partial', value: 22 },
                            { name: 'Abandoned', value: 10 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#34C759" />
                          <Cell fill="#FFBE0B" />
                          <Cell fill="#E50914" />
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New users over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewsData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#0A84FF" 
                        fillOpacity={1} 
                        fill="url(#colorUsers)" 
                        name="Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Devices</CardTitle>
                  <CardDescription>
                    User distribution across devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deviceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="users" fill="#5856D6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Premium vs Free</CardTitle>
                  <CardDescription>
                    Breakdown of premium and free users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Premium Users', value: userAnalytics?.premiumUsers || 0 },
                            { name: 'Free Users', value: (userAnalytics?.totalUsers || 0) - (userAnalytics?.premiumUsers || 0) },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#FFBE0B" />
                          <Cell fill="#5856D6" />
                        </Pie>
                        <Tooltip formatter={(value) => `${value} users`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Coin transactions over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Jan', coinPurchases: 400, contentUnlocks: 300 },
                        { name: 'Feb', coinPurchases: 600, contentUnlocks: 400 },
                        { name: 'Mar', coinPurchases: 800, contentUnlocks: 700 },
                        { name: 'Apr', coinPurchases: 1200, contentUnlocks: 900 },
                        { name: 'May', coinPurchases: 1000, contentUnlocks: 850 },
                        { name: 'Jun', coinPurchases: 1500, contentUnlocks: 1200 },
                        { name: 'Jul', coinPurchases: 1800, contentUnlocks: 1500 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="coinPurchases" fill="#E50914" name="Coin Purchases" />
                      <Bar dataKey="contentUnlocks" fill="#FFBE0B" name="Content Unlocks" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Revenue Drivers</CardTitle>
                  <CardDescription>
                    Content generating most coin transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueAnalytics?.mostProfitableSeries?.map((series: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-yellow-500/10 text-yellow-500">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{series.title}</div>
                            <div className="text-sm text-muted-foreground">{series.revenue} coins</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{Math.floor(series.revenue / 50)} unlocks</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Types</CardTitle>
                  <CardDescription>
                    Breakdown of coin transaction types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Content Unlocks', value: revenueAnalytics?.premiumUnlocks || 0 },
                            { name: 'Coin Purchases', value: revenueAnalytics?.coinPurchases || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#E50914" />
                          <Cell fill="#34C759" />
                        </Pie>
                        <Tooltip formatter={(value) => `${value} transactions`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
