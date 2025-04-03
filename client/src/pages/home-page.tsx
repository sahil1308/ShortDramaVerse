import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DramaGrid } from '@/components/drama-grid';
import { Advertisement } from '@/components/advertisement';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Search, Menu, X, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Advertisement as AdvertisementType } from '@shared/schema';

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // We would normally navigate to /search?q={searchQuery}
    console.log('Searching for:', searchQuery);
  };
  
  // Fetch banner advertisements
  const { data: bannerAds = [] as AdvertisementType[] } = useQuery<AdvertisementType[]>({
    queryKey: ['/api/ads/banner'],
  });
  
  // Fetch sidebar advertisements
  const { data: sidebarAds = [] as AdvertisementType[] } = useQuery<AdvertisementType[]>({
    queryKey: ['/api/ads/sidebar'],
  });
  
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h1 className="text-xl font-bold">ShortDramaVerse</h1>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col p-4 space-y-4">
              <Link href="/" className="font-medium py-2">Home</Link>
              <Link href="/watchlist" className="font-medium py-2">My Watchlist</Link>
              <Link href="/history" className="font-medium py-2">Watch History</Link>
              <Link href="/genres" className="font-medium py-2">Genres</Link>
              <Link href="/premium" className="font-medium py-2">Premium Content</Link>
              <Link href="/profile" className="font-medium py-2">Profile</Link>
              {user?.isAdmin && (
                <Link href="/admin/dashboard" className="font-medium py-2 text-primary">Admin Dashboard</Link>
              )}
              <Button onClick={handleLogout} className="w-full">Logout</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setMenuOpen(true)}
              className="p-2 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="text-xl font-bold">ShortDramaVerse</Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className="font-medium transition-colors hover:text-primary">Home</Link>
              <Link href="/watchlist" className="font-medium transition-colors hover:text-primary">My Watchlist</Link>
              <Link href="/history" className="font-medium transition-colors hover:text-primary">History</Link>
              <Link href="/genres" className="font-medium transition-colors hover:text-primary">Genres</Link>
              <Link href="/premium" className="font-medium transition-colors hover:text-primary">Premium</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <input
                type="text"
                placeholder="Search dramas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 py-1.5 px-3 pr-8 rounded-full border bg-background"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            </form>
            
            <div className="flex items-center gap-2">
              <button className="p-2 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              <div className="relative group">
                <Link href="/profile" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="hidden md:inline font-medium text-sm">
                    {user?.displayName || user?.username}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container py-6">
        {/* Banner Ad */}
        {bannerAds.length > 0 && (
          <div className="mb-8">
            <Advertisement ad={bannerAds[0]} placement="banner" />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Section */}
            <DramaGrid 
              title="Featured Series" 
              seriesQueryKey={['/api/drama-series']}
              adsQueryKey={['/api/ads/in-feed']}
            />
            
            {/* Popular Section */}
            <DramaGrid 
              title="Popular Now" 
              seriesQueryKey={['/api/drama-series']}
              adsQueryKey={['/api/ads/in-feed']}
            />
            
            {/* Genres */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Browse by Genre</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {['Romance', 'Action', 'Comedy', 'Thriller', 'Drama', 'Fantasy', 'Historical', 'Mystery', 'Sci-Fi', 'Adventure', 'Horror', 'Crime'].map((genre) => (
                  <Link 
                    key={genre} 
                    href={`/genres/${genre.toLowerCase()}`}
                    className="bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg p-3 text-center transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* New Releases */}
            <DramaGrid 
              title="New Releases" 
              seriesQueryKey={['/api/drama-series']}
            />
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-72 space-y-6">
            {/* Coin Balance */}
            <div className="bg-primary/5 rounded-lg p-4">
              <h3 className="font-bold mb-2">My Coin Balance</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-yellow-400 rounded-full w-6 h-6 mr-2"></div>
                  <span className="font-medium">{user?.coinBalance || 0} coins</span>
                </div>
                <Button size="sm" asChild>
                  <Link href="/coins/buy">Buy Coins</Link>
                </Button>
              </div>
            </div>
            
            {/* Continue Watching */}
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <h3 className="font-bold mb-3">Continue Watching</h3>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Your watch history will appear here.
                </div>
              </div>
            </div>
            
            {/* Sidebar Ad */}
            {sidebarAds.length > 0 && (
              <div>
                <Advertisement ad={sidebarAds[0]} placement="sidebar" />
              </div>
            )}
            
            {/* Top Rated */}
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <h3 className="font-bold mb-3">Top Rated</h3>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Highest rated series will appear here.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t mt-12 py-6 bg-background/95">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-bold">ShortDramaVerse</h2>
              <p className="text-sm text-muted-foreground">Your premium short drama streaming platform</p>
            </div>
            <div className="flex gap-8">
              <div className="text-sm">
                <h3 className="font-semibold mb-2">Company</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/contact">Contact</Link></li>
                  <li><Link href="/careers">Careers</Link></li>
                </ul>
              </div>
              <div className="text-sm">
                <h3 className="font-semibold mb-2">Legal</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li><Link href="/terms">Terms of Use</Link></li>
                  <li><Link href="/privacy">Privacy Policy</Link></li>
                  <li><Link href="/copyright">Copyright</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ShortDramaVerse. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}