import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Avatar,
  AvatarFallback,
  AvatarImage 
} from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { ContinueWatchingCard } from "@/components/ui/continue-watching-card";
import { DramaCard } from "@/components/ui/drama-card";
import { WatchHistory } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, DownloadCloud, Coins, Clock } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [coinAmount, setCoinAmount] = useState(100);
  
  // Watchlist query
  const { data: watchlist } = useQuery({
    queryKey: ["/api/watchlist"],
  });
  
  // Watch history query
  const { data: watchHistory } = useQuery<(WatchHistory & { episode: any, series: any })[]>({
    queryKey: ["/api/history"],
  });
  
  // Coin transactions query
  const { data: coinTransactions } = useQuery({
    queryKey: ["/api/coins/transactions"],
  });
  
  // Purchase coins mutation
  const purchaseCoinsMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/coins/purchase", { amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coins/transactions"] });
    },
  });
  
  const handlePurchaseCoins = () => {
    if (coinAmount > 0) {
      purchaseCoinsMutation.mutate(coinAmount);
    }
  };
  
  return (
    <div className="app-container relative min-h-screen pb-16 md:pb-0 md:flex bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 min-h-screen">
        <Header />
        
        <div className="p-4 md:p-6">
          {/* Profile Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center">
            <Avatar className="w-24 h-24 mb-4 md:mb-0 md:mr-6">
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {user?.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold mb-1">{user?.displayName}</h1>
              <p className="text-muted-foreground mb-3">@{user?.username}</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center text-sm">
                  <Coins className="text-yellow-400 mr-1" size={16} />
                  <span><span className="font-bold text-yellow-400">{user?.coins}</span> coins</span>
                </div>
                <div className="flex items-center text-sm">
                  <DownloadCloud className="text-muted-foreground mr-1" size={16} />
                  <span>0 downloads</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="text-muted-foreground mr-1" size={16} />
                  <span>Member since {new Date(user?.createdAt || "").toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="mt-4 md:mt-0 md:ml-auto">
              Edit Profile
            </Button>
          </div>
          
          {/* Profile Content */}
          <Tabs defaultValue="watchlist">
            <TabsList className="mb-6">
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              <TabsTrigger value="history">Watch History</TabsTrigger>
              <TabsTrigger value="coins">My Coins</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="watchlist">
              {watchlist && watchlist.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {watchlist.map((item: any) => (
                    <DramaCard key={item.id} drama={item.series} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <h3 className="text-xl font-medium mb-2">Your watchlist is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Save shows and movies to watch later by clicking the bookmark icon.
                  </p>
                  <Button asChild>
                    <a href="/">Browse Content</a>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              {watchHistory && watchHistory.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {watchHistory.map((item) => (
                    <ContinueWatchingCard key={item.id} watchHistory={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <h3 className="text-xl font-medium mb-2">No watch history</h3>
                  <p className="text-muted-foreground mb-6">
                    Your watch history will appear here.
                  </p>
                  <Button asChild>
                    <a href="/">Start Watching</a>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="coins">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Buy Coins</CardTitle>
                    <CardDescription>
                      Purchase coins to unlock premium content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <Button 
                        variant={coinAmount === 100 ? "default" : "outline"} 
                        onClick={() => setCoinAmount(100)}
                      >
                        <Coins className="mr-1" size={16} /> 100
                      </Button>
                      <Button 
                        variant={coinAmount === 250 ? "default" : "outline"} 
                        onClick={() => setCoinAmount(250)}
                      >
                        <Coins className="mr-1" size={16} /> 250
                      </Button>
                      <Button 
                        variant={coinAmount === 500 ? "default" : "outline"} 
                        onClick={() => setCoinAmount(500)}
                      >
                        <Coins className="mr-1" size={16} /> 500
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-muted rounded-md mb-4">
                      <span>Total:</span>
                      <span className="font-bold text-yellow-400">
                        <Coins className="inline mr-1" size={16} /> {coinAmount} coins
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={handlePurchaseCoins}
                      disabled={purchaseCoinsMutation.isPending}
                    >
                      {purchaseCoinsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Purchase Now"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                      Your recent coin transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {coinTransactions && coinTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {coinTransactions.map((transaction: any) => (
                          <div key={transaction.id} className="flex justify-between items-center p-3 border-b border-border">
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.transactionDate).toLocaleString()}
                              </p>
                            </div>
                            <div className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-primary'}`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Account settings will be available in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
