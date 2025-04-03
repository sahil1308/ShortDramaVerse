import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/layout/admin";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Search, 
  MoreVertical, 
  Shield, 
  Coins, 
  UserCheck, 
  UserX, 
  Mail, 
  Loader2,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock user data (since users endpoint isn't available)
const MOCK_USERS = [
  {
    id: 1, 
    username: "admin",
    email: "admin@shortdramaverse.com",
    displayName: "Administrator",
    profileImage: "https://ui-avatars.com/api/?name=Admin&background=E50914&color=fff",
    coins: 1000,
    isPremium: true,
    isAdmin: true,
    createdAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 2, 
    username: "user1",
    email: "user1@example.com",
    displayName: "Alex Morgan",
    profileImage: "https://ui-avatars.com/api/?name=Alex+Morgan&background=0A84FF&color=fff",
    coins: 250,
    isPremium: true,
    isAdmin: false,
    createdAt: "2023-01-15T00:00:00Z"
  },
  {
    id: 3, 
    username: "user2",
    email: "user2@example.com",
    displayName: "Sam Wilson",
    profileImage: "https://ui-avatars.com/api/?name=Sam+Wilson&background=FFBE0B&color=fff",
    coins: 100,
    isPremium: false,
    isAdmin: false,
    createdAt: "2023-02-10T00:00:00Z"
  },
  {
    id: 4, 
    username: "user3",
    email: "user3@example.com",
    displayName: "Jamie Lee",
    profileImage: "https://ui-avatars.com/api/?name=Jamie+Lee&background=5856D6&color=fff",
    coins: 500,
    isPremium: true,
    isAdmin: false,
    createdAt: "2023-03-05T00:00:00Z"
  },
  {
    id: 5, 
    username: "user4",
    email: "user4@example.com",
    displayName: "Taylor Kim",
    profileImage: "https://ui-avatars.com/api/?name=Taylor+Kim&background=34C759&color=fff",
    coins: 0,
    isPremium: false,
    isAdmin: false,
    createdAt: "2023-04-20T00:00:00Z"
  }
];

// Using AdminLayout imported from @/components/layout/admin

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // In an actual implementation, we'd fetch users from the backend
  // For now, using mock data
  
  // Filter users by search query
  const filteredUsers = MOCK_USERS.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search users by name, username, or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button className="flex items-center">
            <Shield className="mr-2" size={16} />
            Add Admin
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_USERS.length}</div>
              <p className="text-xs text-muted-foreground">
                {MOCK_USERS.filter(u => u.isAdmin).length} admins, {MOCK_USERS.filter(u => !u.isAdmin).length} regular users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Premium Members
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_USERS.filter(u => u.isPremium).length}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((MOCK_USERS.filter(u => u.isPremium).length / MOCK_USERS.length) * 100)}% of total users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Coins
              </CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(MOCK_USERS.reduce((sum, user) => sum + user.coins, 0))}</div>
              <p className="text-xs text-muted-foreground">
                Across all user accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                In the last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coins</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.profileImage} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:gap-2">
                            <span>@{user.username}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.isAdmin && (
                          <Badge className="bg-primary text-primary-foreground">Admin</Badge>
                        )}
                        {user.isPremium && (
                          <Badge className="bg-yellow-400 text-black">Premium</Badge>
                        )}
                        {!user.isPremium && !user.isAdmin && (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.coins}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Mail className="mr-2" size={16} />
                            Email User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Coins className="mr-2" size={16} />
                            Adjust Coins
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.isPremium ? (
                            <DropdownMenuItem>
                              <UserX className="mr-2" size={16} />
                              Remove Premium
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <UserCheck className="mr-2" size={16} />
                              Grant Premium
                            </DropdownMenuItem>
                          )}
                          {user.isAdmin ? (
                            <DropdownMenuItem>
                              <Shield className="mr-2" size={16} />
                              Remove Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <Shield className="mr-2" size={16} />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <UserX className="mr-2" size={16} />
                            Suspend Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
